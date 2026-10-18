"use client";

import { Bell, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useEstado } from "@/data/estado";
import { NOME_PAPEL } from "@/data/pessoas";
import { naoLidas, temRevisoes } from "@/data/selectors";
import { Avatar } from "./Basicos";
import { Botao } from "./Botao";
import { Logo } from "./Logo";
import { PainelAvisos } from "./PainelAvisos";
import styles from "./NavBar.module.css";

interface ItemMenu {
  rotulo: string;
  href: string;
  /** Prefixos de rota que deixam o item ativo. */
  ativoEm: string[];
}

/**
 * Barra de navegação em vidro com o menu em pílula, que muda com o papel.
 * Visitante: Eventos, Como funciona, Para organizadores + Entrar / Criar conta.
 * Conta: Eventos, Minhas inscrições, Meus trabalhos, (Revisões), (Organização) + sino e avatar.
 */
export function NavBar() {
  const { estado, papel, usuario, definirPapel } = useEstado();
  const caminho = usePathname();
  const router = useRouter();
  const [avisosAbertos, setAvisosAbertos] = useState(false);
  const [menuMovel, setMenuMovel] = useState(false);
  const refAvisos = useRef<HTMLDivElement>(null);

  // Fecha painéis ao navegar.
  const [caminhoAnterior, setCaminhoAnterior] = useState(caminho);
  if (caminho !== caminhoAnterior) {
    setCaminhoAnterior(caminho);
    setAvisosAbertos(false);
    setMenuMovel(false);
  }

  useEffect(() => {
    if (!avisosAbertos) return;
    function fora(e: MouseEvent) {
      if (refAvisos.current && !refAvisos.current.contains(e.target as Node)) setAvisosAbertos(false);
    }
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") setAvisosAbertos(false);
    }
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [avisosAbertos]);

  const logado = papel !== "visitante" && usuario;

  const itens: ItemMenu[] = logado
    ? [
        { rotulo: "Eventos", href: "/eventos", ativoEm: ["/eventos"] },
        { rotulo: "Minhas inscrições", href: "/minhas-inscricoes", ativoEm: ["/minhas-inscricoes"] },
        { rotulo: "Meus trabalhos", href: "/meus-trabalhos", ativoEm: ["/meus-trabalhos"] },
        ...(papel === "revisor" && temRevisoes(estado, usuario.id)
          ? [{ rotulo: "Revisões", href: "/revisoes", ativoEm: ["/revisoes"] }]
          : []),
        ...(papel === "organizador"
          ? [{ rotulo: "Organização", href: "/organizacao/sbda-2027", ativoEm: ["/organizacao"] }]
          : []),
      ]
    : [
        { rotulo: "Eventos", href: "/eventos", ativoEm: ["/eventos", "/"] },
        { rotulo: "Como funciona", href: "/#como-funciona", ativoEm: [] },
        { rotulo: "Para organizadores", href: "/#para-organizadores", ativoEm: [] },
      ];

  // Subpáginas de evento que pertencem a outra seção do menu (como no protótipo).
  const secaoDoEvento = logado
    ? /^\/eventos\/[^/]+\/submissao/.test(caminho)
      ? "/meus-trabalhos"
      : /^\/eventos\/[^/]+\/inscricao/.test(caminho)
        ? "/minhas-inscricoes"
        : null
    : null;

  function ativo(item: ItemMenu) {
    if (secaoDoEvento) return item.href === secaoDoEvento;
    return item.ativoEm.some((p) => (p === "/" ? caminho === "/" : caminho === p || caminho.startsWith(p + "/")));
  }

  const contador = logado ? naoLidas(estado, usuario.id) : 0;

  return (
    <header className={styles.barra}>
      <div className={styles.interno}>
        <Logo />

        <nav aria-label="Principal" className={`${styles.menu} ${menuMovel ? styles.menuAberto : ""}`}>
          <ul className={`${styles.pilula} vidro`}>
            {itens.map((it) => (
              <li key={it.rotulo}>
                <Link href={it.href} className={`${styles.item} ${ativo(it) ? styles.ativo : ""}`} aria-current={ativo(it) ? "page" : undefined}>
                  {it.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.direita}>
          {logado ? (
            <>
              <div className={styles.avisosEnvoltorio} ref={refAvisos}>
                <button
                  type="button"
                  className={`${styles.sino} vidro`}
                  aria-label={contador ? `Notificações, ${contador} não lidas` : "Notificações"}
                  aria-expanded={avisosAbertos}
                  aria-controls="painel-avisos"
                  onClick={() => setAvisosAbertos((v) => !v)}
                >
                  <Bell size={24} aria-hidden="true" />
                  {contador ? (
                    <span className={styles.contador} aria-hidden="true">
                      {contador}
                    </span>
                  ) : null}
                </button>
                {avisosAbertos ? <PainelAvisos id="painel-avisos" aoFechar={() => setAvisosAbertos(false)} /> : null}
              </div>
              <span className={styles.avatar} title={`${usuario.nome} · ${NOME_PAPEL[papel]}`}>
                <Avatar iniciais={usuario.iniciais} />
                <span className="sr-only">
                  {usuario.nome}, {NOME_PAPEL[papel]}
                </span>
              </span>
            </>
          ) : (
            <>
              <button
                type="button"
                className={styles.entrar}
                onClick={() => {
                  definirPapel("participante");
                  router.push("/eventos");
                }}
              >
                Entrar
              </button>
              <Botao href="/criar-conta" className={styles.criarConta}>
                Criar conta
              </Botao>
            </>
          )}
          <button
            type="button"
            className={styles.abrirMenu}
            aria-label={menuMovel ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuMovel}
            onClick={() => setMenuMovel((v) => !v)}
          >
            {menuMovel ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}
