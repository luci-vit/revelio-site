// Rascunho do novo evento (E1) e regras de validação de cada etapa.
// Datas com hora vêm de <input type="datetime-local"> ("2026-11-15T23:59");
// datas simples de <input type="date"> ("2026-12-18"). Todos os prazos são
// em horário de Brasília (BRT, UTC−3).

import type { Categoria, Formato, GrupoArea } from "@/data/tipos";
import { data } from "@/lib/formato";

export interface CategoriaRascunho {
  id: Exclude<Categoria["id"], "gratuita">;
  nome: string;
  ativa: boolean;
  preco: string;
}

export interface Rascunho {
  // 1. Dados do evento
  nome: string;
  sigla: string;
  grupoArea: GrupoArea | "";
  formato: Formato;
  dataInicio: string;
  dataFim: string;
  cidade: string;
  uf: string;
  instituicao: string;
  descricao: string;
  // 2. Prazos
  submissoesAbrem: string;
  submissoes: string;
  fuso: "BRT";
  revisao: string;
  resultado: string;
  revisoresPorTrabalho: string;
  // 3. Inscrição
  vagas: string;
  gratuito: boolean;
  categorias: CategoriaRascunho[];
  // 4. Chamada de trabalhos
  areasTematicas: string;
  formatosAceitos: string;
  publico: string;
}

export const RASCUNHO_VAZIO: Rascunho = {
  nome: "",
  sigla: "",
  grupoArea: "",
  formato: "Presencial",
  dataInicio: "",
  dataFim: "",
  cidade: "",
  uf: "",
  instituicao: "",
  descricao: "",
  submissoesAbrem: "",
  submissoes: "",
  fuso: "BRT",
  revisao: "",
  resultado: "",
  revisoresPorTrabalho: "2",
  vagas: "",
  gratuito: false,
  categorias: [
    { id: "graduacao", nome: "Graduação", ativa: true, preco: "" },
    { id: "pos-graduacao", nome: "Pós-graduação", ativa: true, preco: "" },
    { id: "profissional", nome: "Profissional", ativa: true, preco: "" },
  ],
  areasTematicas: "",
  formatosAceitos: "Artigo completo (até 12 páginas) e resumo expandido (até 4 páginas).",
  publico: "Pesquisadores, estudantes e profissionais da área.",
};

export type Erros = Partial<Record<string, string>>;

/** "2026-11-15T23:59" → "15/11/2026" */
const dia = (v: string) => data(v);

export function errosDados(r: Rascunho): Erros {
  const e: Erros = {};
  if (!r.nome.trim()) e.nome = "Informe o nome do evento. Ex.: IV Simpósio Brasileiro de Dados Abertos";
  if (!r.sigla.trim()) e.sigla = "Informe a sigla. Ex.: SBDA";
  else if (!/^[A-Za-z]{2,8}$/.test(r.sigla.trim()))
    e.sigla = "Use de 2 a 8 letras, sem espaços nem números. Ex.: SBDA";
  if (!r.grupoArea) e.grupoArea = "Escolha a área. Ex.: Ciência de Dados";
  if (!r.dataInicio) e.dataInicio = "Informe o primeiro dia do evento. Ex.: 03/02/2027";
  if (!r.dataFim) e.dataFim = "Informe o último dia do evento. Ex.: 05/02/2027";
  else if (r.dataInicio && r.dataFim < r.dataInicio)
    e.dataFim = `O último dia precisa ser igual ou depois do primeiro (${dia(r.dataInicio)}).`;
  if (r.formato !== "On-line") {
    if (!r.cidade.trim()) e.cidade = "Informe a cidade. Ex.: Salvador";
    if (!/^[A-Za-z]{2}$/.test(r.uf.trim())) e.uf = "Use a sigla do estado com 2 letras. Ex.: BA";
  }
  return e;
}

export function errosPrazos(r: Rascunho): Erros {
  const e: Erros = {};
  if (!r.submissoesAbrem) e.submissoesAbrem = "Informe quando as submissões abrem. Ex.: 01/10/2026, 00:00";
  if (!r.submissoes) e.submissoes = "Informe o fim das submissões. Ex.: 15/11/2026, 23:59";
  else if (r.submissoesAbrem && r.submissoes <= r.submissoesAbrem)
    e.submissoes = `O fim das submissões precisa ser depois da abertura (${dia(r.submissoesAbrem)}).`;
  if (!r.revisao) e.revisao = "Informe o fim da revisão. Ex.: 10/12/2026, 23:59";
  else if (r.submissoes && r.revisao <= r.submissoes)
    e.revisao = `O fim da revisão precisa ser depois do fim das submissões (${dia(r.submissoes)}).`;
  if (!r.resultado) e.resultado = "Informe a data do resultado. Ex.: 18/12/2026";
  else if (r.revisao && `${r.resultado}T23:59` <= r.revisao)
    e.resultado = `A divulgação do resultado precisa ser depois do fim da revisão (${dia(r.revisao)}).`;
  else if (r.dataInicio && r.resultado >= r.dataInicio)
    e.resultado = `O resultado precisa sair antes do início do evento (${dia(r.dataInicio)}). Ex.: ${dia(
      menosDias(r.dataInicio, 30),
    )}`;
  const n = Number(r.revisoresPorTrabalho);
  if (!Number.isInteger(n) || n < 2) e.revisoresPorTrabalho = "Use pelo menos 2 revisores por trabalho. Ex.: 2";
  else if (n > 5) e.revisoresPorTrabalho = "Use no máximo 5 revisores por trabalho. Ex.: 2";
  return e;
}

export function errosInscricao(r: Rascunho): Erros {
  const e: Erros = {};
  const vagas = Number(r.vagas);
  if (!r.vagas || !Number.isInteger(vagas) || vagas < 1) e.vagas = "Informe o número de vagas. Ex.: 300";
  if (!r.gratuito) {
    const ativas = r.categorias.filter((c) => c.ativa);
    if (ativas.length === 0) e.categorias = "Marque pelo menos uma categoria ou indique que o evento é gratuito.";
    for (const c of ativas) {
      const v = Number(r.categorias.find((x) => x.id === c.id)?.preco.replace(",", "."));
      if (!c.preco || Number.isNaN(v) || v <= 0) e[`preco-${c.id}`] = `Informe o valor em reais. Ex.: ${exemploPreco(c.id)}`;
    }
  }
  return e;
}

export function errosChamada(r: Rascunho): Erros {
  const e: Erros = {};
  if (listaAreas(r.areasTematicas).length === 0)
    e.areasTematicas = "Informe ao menos uma área, separadas por vírgula. Ex.: Governo aberto, Transparência";
  if (!r.formatosAceitos.trim()) e.formatosAceitos = "Descreva os formatos aceitos. Ex.: Artigo completo (até 12 páginas)";
  return e;
}

export const VALIDADORES = [errosDados, errosPrazos, errosInscricao, errosChamada, () => ({}) as Erros];

export function listaAreas(texto: string) {
  return texto
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
}

function exemploPreco(id: CategoriaRascunho["id"]) {
  return id === "graduacao" ? "40" : id === "pos-graduacao" ? "60" : "120";
}

export function menosDias(iso: string, dias: number) {
  const [a, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d - dias)).toISOString().slice(0, 10);
}

/** "2026-11-15T23:59" → "2026-11-15T23:59:00-03:00" */
export function isoBrt(valor: string, horaPadrao = "23:59") {
  const comHora = valor.includes("T") ? valor : `${valor}T${horaPadrao}`;
  return `${comHora.slice(0, 16)}:00-03:00`;
}

export function slugDe(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
