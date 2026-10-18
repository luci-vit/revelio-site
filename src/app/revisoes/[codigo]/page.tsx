import type { Metadata } from "next";
import { TelaParecer } from "@/components/revisao/TelaParecer";

export const metadata: Metadata = { title: "Registrar parecer" };

export default function Pagina() {
  return <TelaParecer />;
}
