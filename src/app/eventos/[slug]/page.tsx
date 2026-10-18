import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PaginaEvento } from "@/components/evento/PaginaEvento";
import { evento } from "@/data/eventos";

export async function generateMetadata({ params }: PageProps<"/eventos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: evento(slug)?.nome ?? "Evento" };
}

export default async function Pagina({ params }: PageProps<"/eventos/[slug]">) {
  const { slug } = await params;
  // Eventos do cenário. (Eventos criados só em memória pela E1 não existem no servidor.)
  if (!evento(slug)) notFound();
  return (
    <Suspense>
      <PaginaEvento slug={slug} />
    </Suspense>
  );
}
