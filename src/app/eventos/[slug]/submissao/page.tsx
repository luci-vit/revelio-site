import type { Metadata } from "next";
import { Suspense } from "react";
import { Submissao } from "@/components/submissao/Submissao";

export const metadata: Metadata = { title: "Novo trabalho" };

export default function Pagina() {
  return (
    <Suspense fallback={<div className="container pagina apoio">Carregando a submissão…</div>}>
      <Submissao />
    </Suspense>
  );
}
