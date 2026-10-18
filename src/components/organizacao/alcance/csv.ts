import type { ALCANCE_SBDA } from "@/data/alcance";

type Alcance = typeof ALCANCE_SBDA;

const celula = (v: string | number) => {
  const s = String(v);
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const linha = (...vs: (string | number)[]) => vs.map(celula).join(";");

/** Monta o CSV de alcance (separador ";", como o Excel em pt-BR espera). */
export function csvAlcance(a: Alcance) {
  const l: string[] = [];
  l.push(linha("Seção", "Item", "Valor", "Extra"));
  l.push(linha("Total", "Inscrições pagas", a.inscricoes, ""));
  a.porSemana.forEach((s) => l.push(linha("Inscrições por semana", s.inicio, s.valor, "")));
  a.funil.forEach((f) => l.push(linha("Funil", f.etapa, f.valor, "")));
  a.cupons.forEach((c) => l.push(linha("Cupom", `${c.codigo} (${c.divulgador})`, c.usos, `${c.cliques} cliques`)));
  a.origem.forEach((o) => l.push(linha("Origem", o.uf, o.valor, "")));
  return "﻿" + l.join("\r\n");
}

/** Gera o arquivo no navegador e dispara o download. */
export function baixarCsvAlcance(slug: string, a: Alcance) {
  const blob = new Blob([csvAlcance(a)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `alcance-${slug}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
