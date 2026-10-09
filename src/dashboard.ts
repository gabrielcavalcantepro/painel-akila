export const DASHBOARD_HTML = /* html */ `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Painel — Plano Alimentar Para Lactantes</title>
<meta name="robots" content="noindex, nofollow">
<style>
  :root {
    --cor-primaria: #c84600;
    --cor-primaria-escura: #a83900;
    --cor-fundo: #f6f4f1;
    --cor-cartao: #ffffff;
    --cor-borda: #e6e1da;
    --cor-texto: #2b2520;
    --cor-texto-suave: #6b6258;
    --cor-sucesso: #3e7d44;
    --cor-alerta: #c0392b;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: var(--cor-fundo);
    color: var(--cor-texto);
  }
  #tela-login {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .caixa-login {
    background: var(--cor-cartao);
    border: 1px solid var(--cor-borda);
    border-radius: 14px;
    padding: 32px 28px;
    width: 100%;
    max-width: 340px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.08);
  }
  .caixa-login h1 { font-size: 18px; margin: 0 0 4px; }
  .caixa-login p { font-size: 13px; color: var(--cor-texto-suave); margin: 0 0 20px; }
  input[type="password"] {
    width: 100%;
    padding: 11px 12px;
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
    font-size: 15px;
    margin-bottom: 12px;
  }
  button {
    cursor: pointer;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    font-family: inherit;
  }
  .btn-primario {
    width: 100%;
    background: var(--cor-primaria);
    color: #fff;
    padding: 11px 14px;
  }
  .btn-primario:hover { background: var(--cor-primaria-escura); }
  .erro-login { color: var(--cor-alerta); font-size: 13px; margin-top: 10px; min-height: 16px; }

  #tela-painel { display: none; max-width: 980px; margin: 0 auto; padding: 24px 16px 60px; }
  .cabecalho {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 22px;
    flex-wrap: wrap;
  }
  .cabecalho h1 { font-size: 20px; margin: 0; }
  .cabecalho-acoes { display: flex; gap: 8px; }
  .btn-secundario {
    background: var(--cor-cartao);
    border: 1px solid var(--cor-borda) !important;
    color: var(--cor-texto);
    padding: 8px 14px;
  }
  .btn-secundario:hover { background: var(--cor-fundo); }

  .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 26px; }
  .kpi {
    background: var(--cor-cartao);
    border: 1px solid var(--cor-borda);
    border-radius: 12px;
    padding: 16px 18px;
  }
  .kpi-valor { font-size: 26px; font-weight: 700; }
  .kpi-label { font-size: 12px; color: var(--cor-texto-suave); text-transform: uppercase; letter-spacing: 0.03em; }

  .secao { background: var(--cor-cartao); border: 1px solid var(--cor-borda); border-radius: 12px; padding: 20px; margin-bottom: 20px; }
  .secao h2 { font-size: 15px; margin: 0 0 4px; }
  .secao .secao-sub { font-size: 12.5px; color: var(--cor-texto-suave); margin: 0 0 16px; }

  .linha-funil { display: flex; align-items: center; gap: 10px; padding: 6px 0; font-size: 13px; }
  .linha-funil .rotulo { width: 110px; flex-shrink: 0; color: var(--cor-texto-suave); font-variant-numeric: tabular-nums; }
  .linha-funil .barra-track { flex: 1; background: var(--cor-fundo); border-radius: 999px; height: 18px; overflow: hidden; }
  .linha-funil .barra-fill { display: block; height: 100%; background: var(--cor-primaria); border-radius: 999px; transition: width 0.3s ease; }
  .linha-funil .numeros { width: 150px; flex-shrink: 0; text-align: right; font-variant-numeric: tabular-nums; }
  .linha-funil .queda { color: var(--cor-alerta); font-size: 11.5px; }

  .bloco-etapa { margin-bottom: 18px; }
  .bloco-etapa:last-child { margin-bottom: 0; }
  .bloco-etapa-titulo { font-size: 13px; font-weight: 700; margin-bottom: 8px; color: var(--cor-primaria-escura); }
  .linha-resposta { display: flex; align-items: center; gap: 10px; padding: 4px 0; font-size: 13px; }
  .linha-resposta .rotulo { flex: 1; }
  .linha-resposta .barra-track { width: 120px; flex-shrink: 0; background: var(--cor-fundo); border-radius: 999px; height: 10px; overflow: hidden; }
  .linha-resposta .barra-fill { display: block; height: 100%; background: #7c9473; border-radius: 999px; }
  .linha-resposta .total { width: 40px; text-align: right; flex-shrink: 0; color: var(--cor-texto-suave); }

  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid var(--cor-borda); }
  th { color: var(--cor-texto-suave); font-weight: 600; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.02em; }
  .tag { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11.5px; font-weight: 600; }
  .tag-completo { background: #e4efe2; color: var(--cor-sucesso); }
  .tag-abandonou { background: #f6e9df; color: var(--cor-primaria-escura); }

  .carregando, .vazio { text-align: center; color: var(--cor-texto-suave); font-size: 13px; padding: 20px 0; }
</style>
</head>
<body>

<div id="tela-login">
  <div class="caixa-login">
    <h1>Painel — Plano Alimentar Para Lactantes</h1>
    <p>Acesso restrito. Informe a senha para ver o funil e as respostas dos leads.</p>
    <input type="password" id="campo-senha" placeholder="Senha" autocomplete="current-password">
    <button type="button" class="btn-primario" id="btn-entrar">Entrar</button>
    <p class="erro-login" id="erro-login"></p>
  </div>
</div>

<div id="tela-painel">
  <div class="cabecalho">
    <h1>Funil do quiz</h1>
    <div class="cabecalho-acoes">
      <button type="button" class="btn-secundario" id="btn-atualizar">↻ Atualizar</button>
      <button type="button" class="btn-secundario" id="btn-sair">Sair</button>
    </div>
  </div>

  <div class="kpis" id="kpis"></div>

  <div class="secao">
    <h2>Funil por etapa</h2>
    <p class="secao-sub">Quantas sessões distintas chegaram em cada etapa, na ordem real do quiz. A % de queda é em relação à etapa anterior.</p>
    <div id="funil"><p class="carregando">Carregando...</p></div>
  </div>

  <div class="secao">
    <h2>Respostas por etapa</h2>
    <p class="secao-sub">O que os leads estão marcando em cada pergunta.</p>
    <div id="respostas"><p class="carregando">Carregando...</p></div>
  </div>

  <div class="secao">
    <h2>Leads recentes</h2>
    <p class="secao-sub">Últimas 300 sessões, mais recente primeiro. Útil pra ver quem parou onde.</p>
    <div id="leads"><p class="carregando">Carregando...</p></div>
  </div>
</div>

<script>
(function () {
  "use strict";

  const telaLogin = document.getElementById("tela-login");
  const telaPainel = document.getElementById("tela-painel");
  const campoSenha = document.getElementById("campo-senha");
  const erroLogin = document.getElementById("erro-login");

  function formatarData(iso) {
    try {
      const d = new Date(iso.endsWith("Z") ? iso : iso + "Z");
      return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    } catch (e) { return iso; }
  }

  function renderizarKpis(dados) {
    const completaram = dados.leads.filter((l) => l.completou).length;
    const taxa = dados.totalSessoes > 0 ? Math.round((completaram / dados.totalSessoes) * 100) : 0;
    document.getElementById("kpis").innerHTML = [
      { label: "Sessões iniciadas", valor: dados.totalSessoes },
      { label: "Completaram o quiz", valor: completaram },
      { label: "Taxa de conclusão", valor: taxa + "%" },
    ].map((k) => \`
      <div class="kpi">
        <div class="kpi-valor">\${k.valor}</div>
        <div class="kpi-label">\${k.label}</div>
      </div>
    \`).join("");
  }

  function renderizarFunil(dados) {
    const container = document.getElementById("funil");
    if (dados.funil.length === 0) { container.innerHTML = '<p class="vazio">Sem dados ainda.</p>'; return; }
    const primeiraEtapaComDados = dados.funil.find((f) => f.sessoes > 0);
    const base = primeiraEtapaComDados ? primeiraEtapaComDados.sessoes : dados.totalSessoes;
    let anterior = null;
    container.innerHTML = dados.funil.map((f) => {
      const pctDoInicio = base > 0 ? Math.round((f.sessoes / base) * 100) : 0;
      let quedaTexto = "";
      if (anterior !== null && anterior > 0 && f.sessoes < anterior) {
        const pctQueda = Math.round(((anterior - f.sessoes) / anterior) * 100);
        quedaTexto = \`<span class="queda"> −\${pctQueda}%</span>\`;
      }
      anterior = f.sessoes;
      return \`
        <div class="linha-funil">
          <span class="rotulo">Etapa \${f.etapa}</span>
          <span class="barra-track"><span class="barra-fill" style="width:\${pctDoInicio}%"></span></span>
          <span class="numeros">\${f.sessoes} (\${pctDoInicio}%)\${quedaTexto}</span>
        </div>
      \`;
    }).join("");
  }

  function renderizarRespostas(dados) {
    const container = document.getElementById("respostas");
    if (dados.respostas.length === 0) { container.innerHTML = '<p class="vazio">Sem respostas ainda.</p>'; return; }

    const porEtapa = new Map();
    dados.respostas.forEach((r) => {
      const chave = r.etapa + "|" + r.campo;
      if (!porEtapa.has(chave)) porEtapa.set(chave, []);
      porEtapa.get(chave).push(r);
    });

    container.innerHTML = Array.from(porEtapa.entries()).map(([chave, itens]) => {
      const [etapa, campo] = chave.split("|");
      const maior = Math.max(...itens.map((i) => i.total));
      const linhas = itens.map((i) => \`
        <div class="linha-resposta">
          <span class="rotulo">\${i.rotulo}</span>
          <span class="barra-track"><span class="barra-fill" style="width:\${Math.round((i.total / maior) * 100)}%"></span></span>
          <span class="total">\${i.total}</span>
        </div>
      \`).join("");
      return \`
        <div class="bloco-etapa">
          <div class="bloco-etapa-titulo">Etapa \${etapa} · \${campo}</div>
          \${linhas}
        </div>
      \`;
    }).join("");
  }

  function renderizarLeads(dados) {
    const container = document.getElementById("leads");
    if (dados.leads.length === 0) { container.innerHTML = '<p class="vazio">Sem leads ainda.</p>'; return; }
    const linhas = dados.leads.map((l) => \`
      <tr>
        <td>\${l.nome ? l.nome : "<em>sem nome</em>"}</td>
        <td>\${l.ultimaEtapa} <span style="color:var(--cor-texto-suave)">(\${l.posicaoEtapa + 1}/\${dados.etapasOrdem.length})</span></td>
        <td>\${l.completou ? '<span class="tag tag-completo">Completou</span>' : '<span class="tag tag-abandonou">Abandonou</span>'}</td>
        <td>\${formatarData(l.ultimoEventoEm)}</td>
      </tr>
    \`).join("");
    container.innerHTML = \`
      <table>
        <thead><tr><th>Nome</th><th>Última etapa</th><th>Status</th><th>Última atividade</th></tr></thead>
        <tbody>\${linhas}</tbody>
      </table>
    \`;
  }

  async function carregarResumo() {
    const resp = await fetch("/api/resumo", { credentials: "same-origin" });
    if (resp.status === 401) {
      telaPainel.style.display = "none";
      telaLogin.style.display = "flex";
      return;
    }
    const dados = await resp.json();
    if (!dados.ok) return;
    telaLogin.style.display = "none";
    telaPainel.style.display = "block";
    renderizarKpis(dados);
    renderizarFunil(dados);
    renderizarRespostas(dados);
    renderizarLeads(dados);
  }

  document.getElementById("btn-entrar").addEventListener("click", async () => {
    erroLogin.textContent = "";
    const resp = await fetch("/api/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha: campoSenha.value }),
    });
    const dados = await resp.json();
    if (dados.ok) {
      campoSenha.value = "";
      carregarResumo();
    } else {
      erroLogin.textContent = dados.erro || "Senha incorreta.";
    }
  });

  campoSenha.addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("btn-entrar").click();
  });

  document.getElementById("btn-atualizar").addEventListener("click", carregarResumo);

  document.getElementById("btn-sair").addEventListener("click", async () => {
    await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
    telaPainel.style.display = "none";
    telaLogin.style.display = "flex";
  });

  carregarResumo();
})();
</script>
</body>
</html>
`;
