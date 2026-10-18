// Alcance do SBDA 2027 (E7) e números agregados do painel (E2).

export const ALCANCE_SBDA = {
  inscricoes: 128,
  funil: [
    { etapa: "Exibições do card", valor: 9840 },
    { etapa: "Cliques em “Ver evento”", valor: 2310 },
    { etapa: "Abriram a inscrição", valor: 412 },
    { etapa: "Concluíram a inscrição", valor: 128 },
  ],
  /** Inscrições por semana, a partir de 15/09/2026. */
  porSemana: [
    { inicio: "2026-09-15", valor: 6 },
    { inicio: "2026-09-22", valor: 9 },
    { inicio: "2026-09-29", valor: 14 },
    { inicio: "2026-10-06", valor: 11 },
    { inicio: "2026-10-13", valor: 10 },
    { inicio: "2026-10-20", valor: 8 },
    { inicio: "2026-10-27", valor: 12 },
    { inicio: "2026-11-03", valor: 19 },
    { inicio: "2026-11-10", valor: 22 },
    { inicio: "2026-11-17", valor: 7 },
    { inicio: "2026-11-24", valor: 5 },
    { inicio: "2026-12-01", valor: 5 },
  ],
  cupons: [
    { codigo: "UFBA10", divulgador: "PPGCC-UFBA", cliques: 120, usos: 18 },
    { codigo: "LIGADADOS", divulgador: "Liga de Dados", cliques: 210, usos: 14 },
    { codigo: "DADOSBR", divulgador: "Comunidade Dados BR", cliques: 340, usos: 11 },
    { codigo: "GOVLAB", divulgador: "GovLab Bahia", cliques: 35, usos: 7 },
    { codigo: "NEWS", divulgador: "Newsletter Revelio", cliques: 60, usos: 4 },
  ],
  origem: [
    { uf: "BA", valor: 46 },
    { uf: "SP", valor: 21 },
    { uf: "PE", valor: 14 },
    { uf: "MG", valor: 11 },
    { uf: "RJ", valor: 9 },
    { uf: "Outros", valor: 27 },
  ],
};

/** Números agregados do painel do evento (E2). */
export const PAINEL_SBDA = {
  inscritos: 128,
  trabalhosRecebidos: 46,
  revisoresAceitos: 18,
  revisoresConvidados: 21,
  pareceresConcluidos: 71,
  pareceresTotal: 92,
  trabalhosComUmParecer: 9,
  lembreteRevisores: "2026-12-07",
};
