import type { Metadata } from "next";
import { TelaFila } from "@/components/revisao/TelaFila";

export const metadata: Metadata = { title: "Revisões" };

export default function Pagina() {
  return <TelaFila />;
}
