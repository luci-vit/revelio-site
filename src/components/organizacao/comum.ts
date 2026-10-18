// Ajudas compartilhadas pelas telas E4–E6 da organização.
import { pessoa } from "@/data/pessoas";
import type { Autor, Decisao, Recomendacao, Trabalho } from "@/data/tipos";

export function nomePessoa(id: string | null | undefined) {
  return pessoa(id)?.nome ?? id ?? "";
}

/**
 * “autora”, “coautor”… conforme a posição no trabalho e a concordância
 * declarada no cadastro da pessoa; sem ela, usa a forma neutra (“autoria”).
 */
export function papelDeAutoria(t: Trabalho, a: Autor) {
  const principal = a.pessoaId === t.responsavelId || t.autores[0] === a;
  const concordancia = pessoa(a.pessoaId)?.concordancia;
  if (!concordancia) return principal ? "autoria" : "coautoria";
  const base = principal ? "autor" : "coautor";
  return concordancia === "feminino" ? `${base}a` : base;
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
