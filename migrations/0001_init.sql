-- Eventos do funil do quiz: uma linha por "etapa vista" e por
-- "opção selecionada". O painel agrega essas linhas na hora de montar
-- o funil e a distribuição de respostas (ver src/resumo.ts).
CREATE TABLE IF NOT EXISTS eventos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sessao_id TEXT NOT NULL,
  tipo TEXT NOT NULL,              -- 'etapa_vista' | 'opcao_selecionada'
  etapa TEXT NOT NULL,             -- bate com o data-etapa do quiz (ex: "0", "n1", "bio", "25")
  campo TEXT,                      -- chave do estado do quiz (ex: "idade", "travouResultados")
  valor TEXT,                      -- data-valor da opção escolhida
  rotulo TEXT,                     -- texto visível da opção (sem emoji)
  nome TEXT,                       -- nome do lead, só preenchido a partir da Etapa 9
  criado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_eventos_sessao ON eventos(sessao_id);
CREATE INDEX IF NOT EXISTS idx_eventos_tipo_etapa ON eventos(tipo, etapa);
CREATE INDEX IF NOT EXISTS idx_eventos_criado_em ON eventos(criado_em);
