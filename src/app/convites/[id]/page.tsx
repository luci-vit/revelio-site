import type { Metadata } from "next";
import { TelaConvite } from "@/components/revisao/TelaConvite";

export const metadata: Metadata = { title: "Convite para revisar" };

export default function Pagina() {
  return <TelaConvite />;
}
