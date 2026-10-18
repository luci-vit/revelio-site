// Utilidades das telas de inscrição (B3, B4, B5).
import type { Categoria, Evento, Inscricao, Pessoa } from "@/data/tipos";

/** Nome por extenso das instituições do cenário (o crachá usa o nome completo). */
const INSTITUICOES: Record<string, string> = {
  UFBA: "Universidade Federal da Bahia",
  UFRB: "Universidade Federal do Recôncavo da Bahia",
  IFBA: "Instituto Federal da Bahia",
  UFPE: "Universidade Federal de Pernambuco",
  UFC: "Universidade Federal do Ceará",
  USP: "Universidade de São Paulo",
  UFMG: "Universidade Federal de Minas Gerais",
  UEFS: "Universidade Estadual de Feira de Santana",
};

export function nomeInstituicao(sigla: string) {
  return INSTITUICOES[sigla] ?? sigla;
}

/** Categoria sugerida a partir do vínculo da conta. */
export function categoriaSugerida(evento: Evento, p: Pessoa | null): Categoria["id"] {
  const porVinculo: Record<string, Categoria["id"]> = {
    "Pós-graduação": "pos-graduacao",
    Graduação: "graduacao",
  };
  const desejada = (p && porVinculo[p.vinculo]) || "profissional";
  return evento.categorias.find((c) => c.id === desejada)?.id ?? evento.categorias[0].id;
}

export function modalidadeDa(inscricao: Inscricao, evento: Evento): "Presencial" | "On-line" {
  return inscricao.modalidade ?? (evento.local.online ? "On-line" : "Presencial");
}

/** "Salvador, BA" · "On-line" */
export function localCurto(evento: Evento) {
  if (evento.local.online) return "On-line";
  return [evento.local.cidade, evento.local.uf].filter(Boolean).join(", ");
}

/** "no IV Simpósio…" / "na Jornada de IHC 2026" (contração com o nome do evento). */
export function noEvento(nome: string) {
  const feminino = /^(jornada|semana|conferência|escola|reunião|mostra|feira)\b/i.test(nome);
  return `${feminino ? "na" : "no"} ${nome}`;
}

/** "do IV Simpósio…" / "da Jornada de IHC 2026". */
export function doEvento(nome: string) {
  return noEvento(nome).replace(/^n/, "d");
}
