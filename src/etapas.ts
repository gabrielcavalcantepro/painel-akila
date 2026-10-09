/**
 * Ordem lógica das etapas do quiz (mesma lista de ETAPAS_ORDEM em
 * js/app.js no repositório plano-alimentar-para-lactantes). Se uma
 * etapa for adicionada/removida/reordenada lá, replique a mudança
 * aqui também — é o que mantém o funil deste painel na ordem certa.
 */
export const ETAPAS_ORDEM = [
  "0", "1", "2", "3", "4", "5", "6",
  "n1", "8", "9", "10",
  "n2", "n3", "11",
  "n4", "n5", "12", "13", "14", "15", "16", "17", "18", "19", "20",
  "22", "bio", "23", "24", "25",
] as const;
