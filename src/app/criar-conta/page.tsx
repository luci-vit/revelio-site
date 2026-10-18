import type { Metadata } from "next";
import { Suspense } from "react";
import { FormCriarConta } from "@/components/conta/FormCriarConta";

export const metadata: Metadata = { title: "Criar conta" };

export default function Pagina() {
  return (
    <Suspense>
      <FormCriarConta />
    </Suspense>
  );
}
