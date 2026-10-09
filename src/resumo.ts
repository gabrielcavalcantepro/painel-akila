import { ETAPAS_ORDEM } from "./etapas";

interface LinhaEvento {
  sessao_id: string;
  tipo: string;
  etapa: string;
  campo: string | null;
  valor: string | null;
  rotulo: string | null;
  nome: string | null;
  criado_em: string;
}

/**
 * Busca os eventos brutos do D1 e monta o funil + a distribuição de
 * respostas + a lista de leads em JavaScript puro (em vez de SQL
 * complexo com window functions). O volume de linhas de um quiz de
 * captação é pequeno o bastante pra isso ser rápido e, principalmente,
 * fácil de entender e ajustar depois. Se o volume crescer muito (gestão
 * de milhões de eventos), vale revisitar e mover a agregação pra SQL.
 */
export async function montarResumo(db: D1Database) {
  const { results } = await db
    .prepare(
      `SELECT sessao_id, tipo, etapa, campo, valor, rotulo, nome, criado_em
       FROM eventos
       ORDER BY criado_em ASC
       LIMIT 50000`,
    )
    .all<LinhaEvento>();

  const linhas = results;

  // --- Funil: quantas sessões distintas chegaram em cada etapa ---
  const sessoesPorEtapa = new Map<string, Set<string>>();
  for (const l of linhas) {
    if (l.tipo !== "etapa_vista") continue;
    if (!sessoesPorEtapa.has(l.etapa)) sessoesPorEtapa.set(l.etapa, new Set());
    sessoesPorEtapa.get(l.etapa)!.add(l.sessao_id);
  }
  const totalSessoes = new Set(linhas.map((l) => l.sessao_id)).size;
  const funil = ETAPAS_ORDEM.map((etapa) => ({
    etapa,
    sessoes: sessoesPorEtapa.get(etapa)?.size ?? 0,
  }));

  // --- Respostas: distribuição por etapa + campo + valor ---
  type Resposta = { etapa: string; campo: string; valor: string; rotulo: string; total: number };
  const contagem = new Map<string, Resposta>();
  for (const l of linhas) {
    if (l.tipo !== "opcao_selecionada") continue;
    const chave = `${l.etapa}|${l.campo}|${l.valor}`;
    const atual = contagem.get(chave);
    if (atual) {
      atual.total++;
    } else {
      contagem.set(chave, {
        etapa: l.etapa,
        campo: l.campo ?? "",
        valor: l.valor ?? "",
        rotulo: l.rotulo || l.valor || "",
        total: 1,
      });
    }
  }
  const respostas = Array.from(contagem.values()).sort((a, b) => {
    const posA = ETAPAS_ORDEM.indexOf(a.etapa as (typeof ETAPAS_ORDEM)[number]);
    const posB = ETAPAS_ORDEM.indexOf(b.etapa as (typeof ETAPAS_ORDEM)[number]);
    if (posA !== posB) return posA - posB;
    if (a.campo !== b.campo) return a.campo.localeCompare(b.campo);
    return b.total - a.total;
  });

  // --- Leads: última etapa vista por sessão (por ordem cronológica, não alfabética) ---
  type UltimaEtapa = { etapa: string; criadoEm: string; nome: string | null };
  const ultimaPorSessao = new Map<string, UltimaEtapa>();
  const inicioPorSessao = new Map<string, string>();
  for (const l of linhas) {
    if (!inicioPorSessao.has(l.sessao_id)) inicioPorSessao.set(l.sessao_id, l.criado_em);
    if (l.tipo === "etapa_vista") {
      ultimaPorSessao.set(l.sessao_id, { etapa: l.etapa, criadoEm: l.criado_em, nome: l.nome });
    } else if (l.nome) {
      const atual = ultimaPorSessao.get(l.sessao_id);
      if (atual && !atual.nome) atual.nome = l.nome;
    }
  }
  const leads = Array.from(ultimaPorSessao.entries())
    .map(([sessaoId, info]) => ({
      sessaoId,
      nome: info.nome,
      ultimaEtapa: info.etapa,
      posicaoEtapa: ETAPAS_ORDEM.indexOf(info.etapa as (typeof ETAPAS_ORDEM)[number]),
      completou: info.etapa === "25",
      iniciadoEm: inicioPorSessao.get(sessaoId) ?? info.criadoEm,
      ultimoEventoEm: info.criadoEm,
    }))
    .sort((a, b) => (a.ultimoEventoEm < b.ultimoEventoEm ? 1 : -1))
    .slice(0, 300);

  return {
    totalSessoes,
    etapasOrdem: ETAPAS_ORDEM,
    funil,
    respostas,
    leads,
  };
}
