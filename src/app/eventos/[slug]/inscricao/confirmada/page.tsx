import type { Metadata } from "next";
import { InscricaoConfirmada } from "@/components/inscricao/InscricaoConfirmada";

export const metadata: Metadata = { title: "Inscrição confirmada" };

export default function Pagina() {
  return <InscricaoConfirmada />;
}
