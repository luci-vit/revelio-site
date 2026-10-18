import type { Metadata } from "next";
import { Suspense } from "react";
import { ProximoPasso } from "@/components/conta/ProximoPasso";

export const metadata: Metadata = { title: "Conta criada" };

export default function Pagina() {
  return (
    <Suspense>
      <ProximoPasso />
    </Suspense>
  );
}
