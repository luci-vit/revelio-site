import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { EstadoProvider } from "@/data/estado";
import { NavBar } from "@/components/NavBar";
import { SeletorPapel } from "@/components/SeletorPapel";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Revelio — eventos científicos",
    template: "%s · Revelio",
  },
  description:
    "Encontre eventos científicos, inscreva-se e publique. Protótipo de alta fidelidade (IHC 2026.2).",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${bricolage.variable}`}>
      <body>
        <EstadoProvider>
          <ToastProvider>
            <a className="sr-only" href="#conteudo">
              Pular para o conteúdo
            </a>
            <NavBar />
            <main id="conteudo">{children}</main>
            <SeletorPapel />
          </ToastProvider>
        </EstadoProvider>
      </body>
    </html>
  );
}
