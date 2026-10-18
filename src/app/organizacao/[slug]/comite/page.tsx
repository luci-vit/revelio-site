import { PaginaComite } from "@/components/organizacao/comite/ComiteCientifico";

export default async function Pagina({ params }: PageProps<"/organizacao/[slug]/comite">) {
  const { slug } = await params;
  return <PaginaComite slug={slug} />;
}
