// Ajudas compartilhadas pelas telas E4–E6 da organização.
import { pessoa } from "@/data/pessoas";
import type { Autor, Decisao, Recomendacao, Trabalho } from "@/data/tipos";

export function nomePessoa(id: string | null | undefined) {
  return pessoa(id)?.nome ?? id ?? "";
}

/** Concordância simples para o cenário fictício (nomes femininos terminam em “a”). */
function feminino(nome: string) {
  return nome.split(" ")[0].toLowerCase().endsWith("a");
}

/** “autora”, “coautor”… conforme a posição no trabalho. */
export function papelDeAutoria(t: Trabalho, a: Autor) {
  const principal = a.pessoaId === t.responsavelId || t.autores[0] === a;
  const base = principal ? "autor" : "coautor";
  return feminino(a.nome) ? `${base}a` : base;
}

export const ROTULO_RECOMENDACAO: Record<Recomendacao, string> = {
  aceitar: "Aprovar",
  "aceitar-com-ajustes": "Aprovar com ajustes",
  rejeitar: "Não aprovar",
};

export const ROTULO_DECISAO: Record<Decisao, string> = {
  aprovado: "Aprovado",
  "aprovado-com-ajustes": "Aprovado com ajustes",
  rejeitado: "Não aprovado",
};
