// “Hoje” da demonstração. O protótipo mostra momentos diferentes do ciclo do
// SBDA 2027: participante/autor antes do fim das submissões, revisor e
// organizador durante a revisão. Use `hojeDoPapel(papel)` para cálculos de
// “faltam N dias”.
import type { Papel } from "./tipos";

export const HOJE_SUBMISSOES = "2026-11-12"; // B1: “faltam 2 dias” para 14/11
export const HOJE_REVISAO = "2026-11-28"; // D2: “faltam 12 dias” para 10/12

export function hojeDoPapel(papel: Papel) {
  return papel === "revisor" || papel === "organizador" ? HOJE_REVISAO : HOJE_SUBMISSOES;
}
