import type { Metadata } from "next";
import { DetalheTrabalho } from "@/components/trabalhos/DetalheTrabalho";

export async function generateMetadata({ params }: PageProps<"/meus-trabalhos/[codigo]">): Promise<Metadata> {
  const { codigo } = await params;
  return { title: `Trabalho ${decodeURIComponent(codigo).toUpperCase()}` };
}

export default async function Pagina({ params }: PageProps<"/meus-trabalhos/[codigo]">) {
  const { codigo } = await params;
  return <DetalheTrabalho codigo={decodeURIComponent(codigo)} />;
}
