// Regras de filtro e ordenação da busca de eventos (B1). Funções puras sobre
// os eventos do estado em memória.
import type { Evento } from "@/data/tipos";
import { OPCOES_FILTRO, OPCOES_ONDE, OPCOES_QUANDO, type ValoresBusca } from "@/components/BuscaSegmentada";
import { diasEntre } from "@/lib/formato";

export type Periodo = "todos" | "semana" | "mes" | "prazo";
export type Ordem = "prazo" | "data" | "nome";

/** Blocos de área exibidos em B1, na ordem do protótipo. */
export const AREAS_B1 = ["Todas", "Computação", "Saúde", "Educação", "Ciência de Dados"];

/**
 * Valores iniciais da busca em B1 quando a URL não traz nada: o protótipo mostra
 * “nov 2026 – mar 2027”, o que deixa de fora o evento já encerrado.
 */
export const BUSCA_B1: ValoresBusca = {
  termo: "",
  onde: OPCOES_ONDE[0],
  quando: OPCOES_QUANDO[1],
  filtro: OPCOES_FILTRO[0],
};

function escolher(valor: string | null, opcoes: string[], padrao: string) {
  return valor && opcoes.includes(valor) ? valor : padrao;
}

/** Lê ?q=&onde=&quando=&filtro= (nomes usados pela A1). */
export function buscaDaUrl(params: URLSearchParams): ValoresBusca {
  return {
    termo: params.get("q") ?? BUSCA_B1.termo,
    onde: escolher(params.get("onde"), OPCOES_ONDE, BUSCA_B1.onde),
    quando: escolher(params.get("quando"), OPCOES_QUANDO, BUSCA_B1.quando),
    filtro: escolher(params.get("filtro"), OPCOES_FILTRO, BUSCA_B1.filtro),
  };
}

export function buscaParaUrl(v: ValoresBusca) {
  const p = new URLSearchParams();
  if (v.termo.trim()) p.set("q", v.termo.trim());
  p.set("onde", v.onde);
  p.set("quando", v.quando);
  p.set("filtro", v.filtro);
  return p.toString();
}

function normalizar(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

/** Soma dias a uma data ISO ("2026-11-12") sem depender do fuso do navegador. */
function somarDias(iso: string, dias: number) {
  const [a, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

/** O evento acontece (ao menos um dia) entre `de` e `ate`, inclusive? */
function acontece(e: Evento, de: string, ate: string) {
  return e.dataInicio <= ate && e.dataFim >= de;
}

function fimDoMes(iso: string) {
  const [a, m] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m, 0)).toISOString().slice(0, 10);
}

export function prazoAberto(e: Evento, hoje: string) {
  return e.situacaoSubmissoes === "aberta" && !!e.prazos.submissoes && diasEntre(hoje, e.prazos.submissoes) >= 0;
}

function passaBusca(e: Evento, v: ValoresBusca, hoje: string) {
  if (v.termo.trim()) {
    const alvo = normalizar(
      [e.nome, e.nomeCurto, e.sigla, e.area, e.grupoArea, e.local.cidade ?? "", e.local.instituicao ?? "", ...e.areasTematicas].join(" "),
    );
    const palavras = normalizar(v.termo).split(/\s+/).filter(Boolean);
    if (!palavras.every((p) => alvo.includes(p))) return false;
  }

  switch (v.onde) {
    case "Bahia":
      if (e.local.uf !== "BA") return false;
      break;
    case "Pernambuco":
      if (e.local.uf !== "PE") return false;
      break;
    case "Só on-line":
      if (e.formato === "Presencial") return false;
      break;
  }

  switch (v.quando) {
    case "nov 2026 – mar 2027":
      if (!acontece(e, "2026-11-01", "2027-03-31")) return false;
      break;
    case "Este mês":
      if (!acontece(e, hoje, fimDoMes(hoje))) return false;
      break;
    case "Próximos 3 meses":
      if (!acontece(e, hoje, somarDias(hoje, 90))) return false;
      break;
  }

  switch (v.filtro) {
    case "Submissões abertas":
      if (!prazoAberto(e, hoje)) return false;
      break;
    case "Gratuitos":
      if (Math.min(...e.categorias.map((c) => c.preco)) !== 0) return false;
      break;
    case "Presencial":
      if (e.formato === "On-line") return false;
      break;
    case "On-line":
      if (e.formato === "Presencial") return false;
      break;
  }
  return true;
}

function passaPeriodo(e: Evento, periodo: Periodo, hoje: string) {
  switch (periodo) {
    case "semana":
      return acontece(e, hoje, somarDias(hoje, 6));
    case "mes":
      return acontece(e, hoje, fimDoMes(hoje));
    case "prazo":
      return prazoAberto(e, hoje);
    default:
      return true;
  }
}

/** Chave de ordenação “prazo de submissão mais próximo”: prazos futuros primeiro. */
function chavePrazo(e: Evento, hoje: string) {
  const p = e.prazos.submissoes;
  if (!p || diasEntre(hoje, p) < 0) return `9-${e.dataInicio}`;
  return `0-${p}`;
}

export function filtrarEventos(
  eventos: Evento[],
  { busca, periodo, area, ordem, hoje }: { busca: ValoresBusca; periodo: Periodo; area: string; ordem: Ordem; hoje: string },
) {
  const lista = eventos.filter(
    (e) => passaBusca(e, busca, hoje) && passaPeriodo(e, periodo, hoje) && (area === "Todas" || e.grupoArea === area),
  );
  return lista.sort((a, b) => {
    if (ordem === "nome") return a.nome.localeCompare(b.nome, "pt-BR");
    if (ordem === "data") return a.dataInicio.localeCompare(b.dataInicio);
    return chavePrazo(a, hoje).localeCompare(chavePrazo(b, hoje));
  });
}
