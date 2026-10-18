import { LayoutOrganizacao } from "@/components/organizacao/LayoutOrganizacao";

export default async function Layout({ children, params }: LayoutProps<"/organizacao/[slug]">) {
  const { slug } = await params;
  return <LayoutOrganizacao slug={slug}>{children}</LayoutOrganizacao>;
}
