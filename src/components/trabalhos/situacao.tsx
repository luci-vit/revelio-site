import { Estado, IconesEstado, type TomEstado } from "@/components/Estado";
import type { Evento, Recomendacao, Trabalho } from "@/data/tipos";
import { prazoCurto } from "@/lib/formato";

/** Situações em que o resultado já saiu e o autor vê os pareceres. */
export function temResultado(t: Trabalho) {
  return t.situacao === "aprovado" || t.situacao === "aprovado-com-ajustes" || t.situacao === "rejeitado";
}

/**
 * Selo de situação do trabalho (C4 e C5). `detalhada` acrescenta o prazo
 * relevante: “Enviado · editável até 15/11, 23:59 (BRT)”.
 */
export function SituacaoTrabalho({
  trabalho,
  evento,
  detalhada = false,
  grande = false,
}: {
  trabalho: Trabalho;
  evento?: Evento;
  detalhada?: boolean;
  grande?: boolean;
}) {
  const prazoSub = evento?.prazos.submissoes;
  switch (trabalho.situacao) {
    case "enviado":
      return (
        <Estado tom="sucesso" grande={grande}>
          {detalhada && prazoSub && !evento?.encerrado ? `Enviado · editável até ${prazoCurto(prazoSub)}` : "Enviado"}
        </Estado>
      );
    case "rascunho":
      return (
        <Estado tom="neutro" icone={IconesEstado.documento} grande={grande}>
          {detalhada && prazoSub ? `Rascunho · prazo ${prazoCurto(prazoSub)}` : "Rascunho"}
        </Estado>
      );
    case "em-revisao":
      return (
        <Estado tom="info" grande={grande}>
          Em revisão
        </Estado>
      );
    case "aprovado":
      return (
        <Estado tom="sucesso" grande={grande}>
          Aprovado
        </Estado>
      );
    case "aprovado-com-ajustes":
      return (
        <Estado tom="atencao" grande={grande}>
          Aprovado com ajustes
        </Estado>
      );
    case "rejeitado":
      return (
        <Estado tom="erro" grande={grande}>
          Não aprovado
        </Estado>
      );
  }
}

export const RECOMENDACAO: Record<Recomendacao, { tom: TomEstado; rotulo: string }> = {
  aceitar: { tom: "sucesso", rotulo: "Recomenda aprovar" },
  "aceitar-com-ajustes": { tom: "atencao", rotulo: "Recomenda aprovar com ajustes" },
  rejeitar: { tom: "erro", rotulo: "Recomenda não aprovar" },
};

/** Ação da linha em C4 conforme a situação. */
export function acaoDoTrabalho(t: Trabalho): { rotulo: string; href: string } {
  if (t.situacao === "rascunho") {
    return { rotulo: "Continuar envio", href: `/eventos/${t.eventoSlug}/submissao?codigo=${t.codigo}` };
  }
  if (temResultado(t)) return { rotulo: "Ver pareceres", href: `/meus-trabalhos/${t.codigo}` };
  return { rotulo: "Ver detalhes", href: `/meus-trabalhos/${t.codigo}` };
}
