"use client";

import { RotateCcw, UserRoundCog, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEstado } from "@/data/estado";
import { NOME_PAPEL, PESSOA_POR_PAPEL, pessoa } from "@/data/pessoas";
import { temRevisoes } from "@/data/selectors";
import type { Papel } from "@/data/tipos";
import styles from "./SeletorPapel.module.css";

const PAPEIS: Papel[] = ["visitante", "participante", "autor", "revisor", "organizador"];

/**
 * Só para a demonstração: alterna o papel atual (e a pessoa logada) e leva à
 * tela inicial de cada fluxo. Não faz parte da interface do produto.
 */
export function SeletorPapel() {
  const { estado, papel, definirPapel, despachar } = useEstado();
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  function inicioDo(p: Papel) {
    switch (p) {
      case "visitante":
        return "/";
      case "participante":
        return "/eventos";
      case "autor":
        return "/meus-trabalhos";
      case "revisor":
        return temRevisoes(estado, "paulo") ? "/revisoes" : "/convites/c-paulo-sbda";
      case "organizador":
        return "/organizacao/sbda-2027";
    }
  }

  function trocar(p: Papel) {
    definirPapel(p);
    setAberto(false);
    router.push(inicioDo(p));
  }

  if (!aberto) {
    return (
      <button type="button" className={styles.gatilho} onClick={() => setAberto(true)} aria-label={`Demonstração: papel atual ${NOME_PAPEL[papel]}. Trocar papel`}>
        <UserRoundCog size={20} aria-hidden="true" />
        <span>
          Demonstração · <strong>{NOME_PAPEL[papel]}</strong>
        </span>
      </button>
    );
  }

  return (
    <div className={styles.painel} role="dialog" aria-label="Trocar papel da demonstração">
      <div className={styles.topo}>
        <span className={styles.titulo}>Ver como</span>
        <button type="button" className={styles.fechar} onClick={() => setAberto(false)} aria-label="Fechar">
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <ul className={styles.lista}>
        {PAPEIS.map((p) => {
          const quem = pessoa(PESSOA_POR_PAPEL[p]);
          return (
            <li key={p}>
              <button
                type="button"
                className={`${styles.opcao} ${p === papel ? styles.ativa : ""}`}
                aria-pressed={p === papel}
                onClick={() => trocar(p)}
              >
                <span className={styles.opcaoPapel}>{NOME_PAPEL[p]}</span>
                <span className={styles.opcaoPessoa}>{quem ? quem.nome : "sem conta"}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className={styles.reiniciar}
        onClick={() => {
          despachar({ tipo: "reiniciar" });
          router.push("/");
          setAberto(false);
        }}
      >
        <RotateCcw size={16} aria-hidden="true" />
        Reiniciar demonstração
      </button>
    </div>
  );
}
