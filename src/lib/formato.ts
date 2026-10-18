// Formatação de datas, prazos e valores. Prazos sempre com dia, hora e fuso:
// "15/11/2026, 23:59 (BRT)".

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** Lê "2027-02-03" ou ISO completo sem sofrer com fuso do navegador. */
function partes(iso: string) {
  const [data, resto] = iso.split("T");
  const [ano, mes, dia] = data.split("-").map(Number);
  const [hora, minuto] = (resto ?? "00:00").slice(0, 5).split(":").map(Number);
  return { ano, mes, dia, hora, minuto };
}

const dois = (n: number) => String(n).padStart(2, "0");

/** "15/11/2026" */
export function data(iso: string) {
  const p = partes(iso);
  return `${dois(p.dia)}/${dois(p.mes)}/${p.ano}`;
}

/** "15/11" */
export function dataCurta(iso: string) {
  const p = partes(iso);
  return `${dois(p.dia)}/${dois(p.mes)}`;
}

/** "23:59" */
export function hora(iso: string) {
  const p = partes(iso);
  return `${dois(p.hora)}:${dois(p.minuto)}`;
}

/** "15/11/2026, 23:59 (BRT)" */
export function prazo(iso: string) {
  return `${data(iso)}, ${hora(iso)} (BRT)`;
}

/** "15/11, 23:59 (BRT)" */
export function prazoCurto(iso: string) {
  return `${dataCurta(iso)}, ${hora(iso)} (BRT)`;
}

/** "3 a 5 de fevereiro de 2027", "20 e 21 de novembro de 2026" */
export function periodoExtenso(inicio: string, fim: string) {
  const a = partes(inicio);
  const b = partes(fim);
  if (a.ano === b.ano && a.mes === b.mes) {
    if (a.dia === b.dia) return `${a.dia} de ${MESES[a.mes - 1]} de ${a.ano}`;
    const sep = b.dia - a.dia === 1 ? "e" : "a";
    return `${a.dia} ${sep} ${b.dia} de ${MESES[a.mes - 1]} de ${a.ano}`;
  }
  return `${a.dia} de ${MESES[a.mes - 1]} a ${b.dia} de ${MESES[b.mes - 1]} de ${b.ano}`;
}

/** "3 a 5/02/2027", "20 e 21/11/2026" */
export function periodoCurto(inicio: string, fim: string) {
  const a = partes(inicio);
  const b = partes(fim);
  if (a.ano === b.ano && a.mes === b.mes) {
    const sep = b.dia - a.dia === 1 ? "e" : "a";
    return `${a.dia} ${sep} ${b.dia}/${dois(b.mes)}/${b.ano}`;
  }
  return `${data(inicio)} a ${data(fim)}`;
}

/** Selo de data do card: { dias: "3–5", mes: "FEV 2027" } */
export function seloData(inicio: string, fim: string) {
  const a = partes(inicio);
  const b = partes(fim);
  const dias = a.dia === b.dia ? `${a.dia}` : `${a.dia}–${b.dia}`;
  return { dias, mes: `${MESES_CURTOS[a.mes - 1].toUpperCase()} ${a.ano}` };
}

/** "3/02" — dia/mês usado na programação. */
export function diaMes(iso: string) {
  const p = partes(iso);
  return `${p.dia}/${dois(p.mes)}`;
}

/** "R$ 40" / "R$ 120,00" */
export function dinheiro(valor: number, sempreCentavos = false) {
  if (valor === 0) return "Gratuito";
  const temCentavos = sempreCentavos || valor % 1 !== 0;
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: temCentavos ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

/** "9.840" */
export function numero(n: number) {
  return n.toLocaleString("pt-BR");
}

/** "32%" */
export function porcentagem(parte: number, total: number, casas = 0) {
  if (!total) return "0%";
  return `${((parte / total) * 100).toLocaleString("pt-BR", { maximumFractionDigits: casas })}%`;
}

/** Dias inteiros entre duas datas ISO (b - a). */
export function diasEntre(a: string, b: string) {
  const pa = partes(a);
  const pb = partes(b);
  const ua = Date.UTC(pa.ano, pa.mes - 1, pa.dia);
  const ub = Date.UTC(pb.ano, pb.mes - 1, pb.dia);
  return Math.round((ub - ua) / 86_400_000);
}
