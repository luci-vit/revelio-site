"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import styles from "./LayoutOrganizacao.module.css";

const SECOES: { rotulo: string; caminho: string | null }[] = [
  { rotulo: "Visão geral", caminho: "" },
  { rotulo: "Alcance", caminho: "/alcance" },
  { rotulo: "Inscritos", caminho: null },
  { rotulo: "Trabalhos", caminho: "/trabalhos" },
  { rotulo: "Comitê científico", caminho: "/comite" },
  { rotulo: "Seleção", caminho: "/selecao" },
  { rotulo: "Publicação", caminho: "/publicacao" },
  { rotulo: "Certificados", caminho: "/publicacao#certificados" },
  { rotulo: "Configurações", caminho: null },
];

/**
 * Área da organização (E2–E7): menu lateral do evento + conteúdo.
 * Itens sem tela no protótipo (Inscritos, Configurações) aparecem desabilitados.
 */
export function LayoutOrganizacao({ slug, children }: { slug: string; children: ReactNode }) {
  const caminho = usePathname();
  const base = `/organizacao/${slug}`;

  return (
    <div className={styles.layout}>
      <nav aria-label="Seções do evento" className={styles.lateral}>
        <ul>
          {SECOES.map((s) => {
            if (s.caminho === null) {
              return (
                <li key={s.rotulo}>
                  <span className={`${styles.item} ${styles.desabilitado}`} aria-disabled="true" title="Fora do escopo do protótipo">
                    {s.rotulo}
                  </span>
                </li>
              );
            }
            const href = base + s.caminho;
            const semAncora = href.split("#")[0];
            const ativo = !s.caminho.includes("#") && (s.caminho === "" ? caminho === base : caminho === semAncora);
            return (
              <li key={s.rotulo}>
                <Link href={href} className={`${styles.item} ${ativo ? styles.ativo : ""}`} aria-current={ativo ? "page" : undefined}>
                  {s.rotulo}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className={styles.conteudo}>{children}</div>
    </div>
  );
}
