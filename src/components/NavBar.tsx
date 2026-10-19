"use client";

import { Bell, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
 * Visitante: marca e ações de acesso; os eventos são acessados pela landing page.
 * Participante, autor e revisor: Eventos, Minhas inscrições, Meus trabalhos e (Revisões).
 * Organizador: Eventos e Organização. Contas também têm sino e avatar.
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
        ...(papel !== "organizador"
          ? [
              { rotulo: "Minhas inscrições", href: "/minhas-inscricoes", ativoEm: ["/minhas-inscricoes"] },
              { rotulo: "Meus trabalhos", href: "/meus-trabalhos", ativoEm: ["/meus-trabalhos"] },
            ]
          : []),
        ...(papel === "revisor" && temRevisoes(estado, usuario.id)
          ? [{ rotulo: "Revisões", href: "/revisoes", ativoEm: ["/revisoes"] }]
          : []),
        ...(papel === "organizador"
          ? [{ rotulo: "Organização", href: "/organizacao/sbda-2027", ativoEm: ["/organizacao"] }]
          : []),
      ]
    : [];

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

  // Indicador em pílula que desliza até o item ativo. Posicionado direto no
  // DOM (sem estado) para não re-renderizar a barra a cada medida.
  const refLista = useRef<HTMLUListElement>(null);
  const refIndicador = useRef<HTMLLIElement>(null);
  const chaveAtiva = itens.find(ativo)?.rotulo ?? "";
  const chaveItens = itens.map((it) => it.rotulo).join("|");

  useLayoutEffect(() => {
    const lista = refLista.current;
    const indicador = refIndicador.current;
    if (!lista || !indicador) return;
    function posicionar() {
      const alvo = lista!.querySelector<HTMLElement>('a[aria-current="page"]');
      if (!alvo) {
        indicador!.style.opacity = "0";
        return;
      }
      indicador!.style.opacity = "1";
      indicador!.style.width = `${alvo.offsetWidth}px`;
      indicador!.style.height = `${alvo.offsetHeight}px`;
      indicador!.style.transform = `translate(${alvo.offsetLeft}px, ${alvo.offsetTop}px)`;
    }
    posicionar();
    // Só anima depois da primeira posição, para não “voar” do canto ao carregar.
    const quadro = requestAnimationFrame(() => {
      indicador.dataset.pronto = "true";
    });
    const observador = new ResizeObserver(posicionar);
    observador.observe(lista);
    return () => {
      cancelAnimationFrame(quadro);
      observador.disconnect();
    };
  }, [chaveAtiva, chaveItens]);

  return (
    <header className={styles.barra}>
      <div className={styles.interno}>
        <Logo />

        {itens.length > 0 ? (
          <nav aria-label="Principal" className={`${styles.menu} ${menuMovel ? styles.menuAberto : ""}`}>
            <ul ref={refLista} className={`${styles.pilula} vidro`}>
              <li ref={refIndicador} className={styles.indicador} role="presentation" aria-hidden="true" />
              {itens.map((it) => (
                <li key={it.rotulo}>
                  <Link
                    href={it.href}
                    className={`${styles.item} ${ativo(it) ? styles.ativo : ""}`}
                    aria-current={ativo(it) ? "page" : undefined}
                  >
                    {it.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

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
          {itens.length > 0 ? (
            <button
              type="button"
              className={styles.abrirMenu}
              aria-label={menuMovel ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuMovel}
              onClick={() => setMenuMovel((v) => !v)}
            >
              {menuMovel ? <X size={24} /> : <Menu size={24} />}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
