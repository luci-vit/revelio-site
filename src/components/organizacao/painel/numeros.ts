// Números do painel do evento (E2). O SBDA 2027 parte dos agregados do
// cenário (PAINEL_SBDA) e soma o que mudou no estado durante a demonstração;
// eventos novos contam direto do estado (normalmente zero).

import { PAINEL_SBDA } from "@/data/alcance";
import { ESTADO_INICIAL, type Estado } from "@/data/estado";
import { convitesDoEvento, trabalhosSubmetidos } from "@/data/selectors";

export interface NumerosPainel {
  inscritos: number;
  trabalhosRecebidos: number;
  revisoresAceitos: number;
  revisoresConvidados: number;
  pareceresConcluidos: number;
  pareceresTotal: number;
  trabalhosComUmParecer: number;
}

function contar(estado: Estado, slug: string): NumerosPainel {
  const trabalhos = trabalhosSubmetidos(estado, slug);
  const codigos = new Set(trabalhos.map((t) => t.codigo));
  const pareceres = estado.pareceres.filter((p) => codigos.has(p.trabalhoCodigo));
  const convites = convitesDoEvento(estado, slug);
  return {
    inscritos: estado.inscricoes.filter((i) => i.eventoSlug === slug && i.situacao !== "cancelada").length,
    trabalhosRecebidos: trabalhos.length,
    revisoresAceitos: convites.filter((c) => c.situacao === "aceito").length,
    revisoresConvidados: convites.length,
    pareceresConcluidos: pareceres.filter((p) => p.situacao === "concluido").length,
    pareceresTotal: pareceres.length,
    trabalhosComUmParecer: trabalhos.filter(
      (t) => pareceres.filter((p) => p.trabalhoCodigo === t.codigo && p.situacao === "concluido").length === 1,
    ).length,
  };
}

export function numerosDoPainel(estado: Estado, slug: string): NumerosPainel {
  const agora = contar(estado, slug);
  if (slug !== "sbda-2027") return agora;
  const inicio = contar(ESTADO_INICIAL, slug);
  const chaves = Object.keys(agora) as (keyof NumerosPainel)[];
  const resultado = {} as NumerosPainel;
  for (const k of chaves) resultado[k] = Math.max(0, PAINEL_SBDA[k] + agora[k] - inicio[k]);
  return resultado;
}
