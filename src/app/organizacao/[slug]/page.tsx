import { PaginaPainel } from "@/components/organizacao/painel/PainelEvento";

export default async function Pagina({ params }: PageProps<"/organizacao/[slug]">) {
  const { slug } = await params;
  return <PaginaPainel slug={slug} />;
}
