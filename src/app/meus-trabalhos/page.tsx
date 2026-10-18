import type { Metadata } from "next";
import { Suspense } from "react";
import { MeusTrabalhos } from "@/components/trabalhos/MeusTrabalhos";

export const metadata: Metadata = { title: "Meus trabalhos" };

export default function Pagina() {
  return (
    <Suspense>
      <MeusTrabalhos />
    </Suspense>
  );
}
