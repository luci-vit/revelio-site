// Regras e formatações da submissão (C2/C3). Sem backend: tudo é validado aqui.
import type { Autor, Evento, EtapaSubmissao, Trabalho } from "@/data/tipos";

export const ETAPAS: { id: EtapaSubmissao; rotulo: string }[] = [
  { id: "dados", rotulo: "Dados do trabalho" },
  { id: "autores", rotulo: "Autores" },
  { id: "arquivo", rotulo: "Arquivo" },
  { id: "conferir", rotulo: "Conferir e enviar" },
];

export function indiceEtapa(etapa: EtapaSubmissao | undefined) {
  const i = ETAPAS.findIndex((e) => e.id === etapa);
  return i < 0 ? 0 : i;
}

export const LIMITE_TITULO = 200;
export const LIMITE_MB = 10;

export const MODALIDADES: Trabalho["modalidade"][] = ["Artigo completo", "Resumo expandido"];

/** Modalidades aceitas pelo evento, lidas de `formatosAceitos`. */
export function modalidadesDoEvento(evento: Evento): Trabalho["modalidade"][] {
  const texto = evento.formatosAceitos.toLowerCase();
  const aceitas = MODALIDADES.filter((m) => texto.includes(m.toLowerCase()));
  return aceitas.length ? aceitas : MODALIDADES;
}

/** Limite de páginas da modalidade, lido de `formatosAceitos` ("Artigo completo (até 12 páginas)"). */
export function limitePaginas(evento: Evento, modalidade: Trabalho["modalidade"]) {
  const re = new RegExp(`${modalidade}\\s*\\(até (\\d+) páginas\\)`, "i");
  const achado = evento.formatosAceitos.match(re);
  if (achado) return Number(achado[1]);
  return modalidade === "Artigo completo" ? 12 : 4;
}

/** Hora atual em Brasília: "14:32". */
export function horaAgora() {
  return new Date().toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "2,1 MB" / "640 KB" */
export function tamanhoLegivel(bytes: number) {
  const mb = bytes / (1024 * 1024);
  if (mb < 0.1) return `${Math.max(1, Math.round(bytes / 1024)).toLocaleString("pt-BR")} KB`;
  return `${mb.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MB`;
}

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function emailValido(email: string) {
  return RE_EMAIL.test(email.trim());
}

/** Nome para exibir: coautores sem conta podem ainda não ter nome. */
export function nomeAutor(a: Autor) {
  return a.nome || a.email;
}

export function palavrasDoTexto(texto: string) {
  return texto
    .split(/[,;]/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export interface ErrosDados {
  titulo?: string;
  resumo?: string;
  palavrasChave?: string;
  area?: string;
}

export function validarDados(t: Trabalho): ErrosDados {
  const erros: ErrosDados = {};
  if (!t.titulo.trim()) erros.titulo = "Escreva o título. Ex.: Dados abertos para cidades inclusivas";
  else if (t.titulo.length > LIMITE_TITULO) erros.titulo = `Encurte o título para até ${LIMITE_TITULO} caracteres.`;
  if (!t.resumo.trim()) erros.resumo = "Escreva o resumo do trabalho, em um parágrafo.";
  if (t.palavrasChave.length === 0)
    erros.palavrasChave = "Informe ao menos uma palavra-chave. Ex.: dados abertos, acessibilidade";
  if (!t.area) erros.area = "Escolha a área temática do trabalho.";
  return erros;
}

/** O que falta para enviar, com a etapa onde corrigir. */
export function pendencias(t: Trabalho, evento: Evento): { texto: string; etapa: EtapaSubmissao }[] {
  const lista: { texto: string; etapa: EtapaSubmissao }[] = [];
  if (Object.keys(validarDados(t)).length) lista.push({ texto: "Complete os dados do trabalho.", etapa: "dados" });
  if (t.autores.length === 0) lista.push({ texto: "Inclua ao menos um autor.", etapa: "autores" });
  if (!t.arquivo) lista.push({ texto: "Anexe o arquivo do trabalho em PDF.", etapa: "arquivo" });
  else if (t.arquivo.paginas > limitePaginas(evento, t.modalidade))
    lista.push({
      texto: `O arquivo tem ${t.arquivo.paginas} páginas; ${t.modalidade.toLowerCase()} aceita até ${limitePaginas(evento, t.modalidade)}.`,
      etapa: "arquivo",
    });
  return lista;
}
