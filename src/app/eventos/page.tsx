import type { Metadata } from "next";
import { Suspense } from "react";
import { BuscaEventos } from "@/components/evento/BuscaEventos";

export const metadata: Metadata = { title: "Eventos" };

export default function Pagina() {
  return (
    <Suspense>
      <BuscaEventos />
    </Suspense>
  );
}
