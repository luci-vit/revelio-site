import type { Metadata } from "next";
import { FormInscricao } from "@/components/inscricao/FormInscricao";

export const metadata: Metadata = { title: "Inscrição no evento" };

export default function Pagina() {
  return <FormInscricao />;
}
