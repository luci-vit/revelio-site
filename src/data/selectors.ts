// Consultas prontas sobre o estado. Use dentro de componentes cliente:
//   const { estado, usuario } = useEstado();
//   const meus = trabalhosDaPessoa(estado, usuario?.id);

import type { Estado } from "./estado";
import type { Evento, Papel, Trabalho } from "./tipos";

export function eventoPorSlug(estado: Estado, slug: string): Evento | undefined {
  return estado.eventos.find((e) => e.slug === slug);
}

export function inscricoesDaPessoa(estado: Estado, pessoaId: string | undefined) {
  if (!pessoaId) return [];
  return estado.inscricoes.filter((i) => i.pessoaId === pessoaId && i.situacao !== "cancelada");
}

export function inscricaoNoEvento(estado: Estado, pessoaId: string | undefined, eventoSlug: string) {
  if (!pessoaId) return undefined;
  return estado.inscricoes.find(
    (i) => i.pessoaId === pessoaId && i.eventoSlug === eventoSlug && i.situacao !== "cancelada",
  );
}

export function estaInscrito(estado: Estado, pessoaId: string | undefined, eventoSlug: string) {
  return Boolean(inscricaoNoEvento(estado, pessoaId, eventoSlug));
}

export function trabalhoPorCodigo(estado: Estado, codigo: string): Trabalho | undefined {
  return estado.trabalhos.find((t) => t.codigo.toUpperCase() === codigo.toUpperCase());
}

/** Trabalhos em que a pessoa é autora ou coautora (C4). */
export function trabalhosDaPessoa(estado: Estado, pessoaId: string | undefined) {
  if (!pessoaId) return [];
  return estado.trabalhos.filter(
    (t) => t.responsavelId === pessoaId || t.autores.some((a) => a.pessoaId === pessoaId),
  );
}

/**
 * Trabalhos já submetidos ao evento — usados nas telas posteriores ao fim das
 * submissões (D2, E4, E5, E6). O rascunho de demonstração (SBDA-0042) entra
 * mesmo se o fluxo C2→C3 não tiver sido feito.
 */
export function trabalhosSubmetidos(estado: Estado, eventoSlug: string) {
  return estado.trabalhos.filter(
    (t) => t.eventoSlug === eventoSlug && (t.situacao !== "rascunho" || t.fluxoDemonstracao),
  );
}

export function pareceresDoTrabalho(estado: Estado, codigo: string) {
  return estado.pareceres.filter((p) => p.trabalhoCodigo === codigo);
}

/** Fila de revisões da pessoa num evento (D2). */
export function filaDoRevisor(estado: Estado, revisorId: string | undefined, eventoSlug?: string) {
  if (!revisorId) return [];
  return estado.pareceres
    .filter((p) => p.revisorId === revisorId)
    .map((p) => ({ parecer: p, trabalho: trabalhoPorCodigo(estado, p.trabalhoCodigo)! }))
    .filter((x) => x.trabalho && (!eventoSlug || x.trabalho.eventoSlug === eventoSlug));
}

export function convitesDaPessoa(estado: Estado, pessoaId: string | undefined) {
  if (!pessoaId) return [];
  return estado.convites.filter((c) => c.pessoaId === pessoaId);
}

export function convitesDoEvento(estado: Estado, eventoSlug: string) {
  return estado.convites.filter((c) => c.eventoSlug === eventoSlug);
}

/** O menu “Revisões” só aparece quando há convite aceito. */
export function temRevisoes(estado: Estado, pessoaId: string | undefined) {
  return convitesDaPessoa(estado, pessoaId).some((c) => c.situacao === "aceito");
}

export function notificacoesDaPessoa(estado: Estado, pessoaId: string | undefined) {
  if (!pessoaId) return [];
  return estado.notificacoes.filter((n) => n.pessoaId === pessoaId);
}

export function naoLidas(estado: Estado, pessoaId: string | undefined) {
  return notificacoesDaPessoa(estado, pessoaId).filter((n) => !n.lida).length;
}

/** Eventos que a pessoa organiza. */
export function eventosOrganizados(estado: Estado, pessoaId: string | undefined) {
  if (!pessoaId) return [];
  return estado.eventos.filter((e) => e.organizadorId === pessoaId);
}

/** Próximo código livre de trabalho ou ingresso: "SBDA-0058". */
export function proximoCodigo(codigosExistentes: string[], sigla: string, inicio = 1) {
  const nums = codigosExistentes
    .filter((c) => c.startsWith(`${sigla}-`))
    .map((c) => Number(c.split("-")[1]))
    .filter((n) => !Number.isNaN(n));
  const prox = Math.max(inicio - 1, ...nums) + 1;
  return `${sigla}-${String(prox).padStart(4, "0")}`;
}

export function papelLogado(papel: Papel) {
  return papel !== "visitante";
}
