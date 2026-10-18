"use client";

import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import styles from "./Abas.module.css";

export interface Aba<T extends string> {
  valor: T;
  rotulo: string;
}

/**
 * Abas sublinhadas (página do evento: Sobre, Programação, Chamada…).
 * Controladas: o conteúdo de cada aba é renderizado por quem usa.
 *
 *   <Abas abas={…} valor={aba} aoMudar={setAba} rotulo="Seções do evento">
 *     {aba === "sobre" && <Sobre />}
 *   </Abas>
 */
export function Abas<T extends string>({
  abas,
  valor,
  aoMudar,
  rotulo,
  children,
}: {
  abas: Aba<T>[];
  valor: T;
  aoMudar: (v: T) => void;
  rotulo: string;
  children: ReactNode;
}) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function teclado(e: KeyboardEvent, i: number) {
    let prox = -1;
    if (e.key === "ArrowRight") prox = (i + 1) % abas.length;
    if (e.key === "ArrowLeft") prox = (i - 1 + abas.length) % abas.length;
    if (prox >= 0) {
      e.preventDefault();
      aoMudar(abas[prox].valor);
      refs.current[prox]?.focus();
    }
  }

  return (
    <div>
      <div className={styles.lista} role="tablist" aria-label={rotulo}>
        {abas.map((a, i) => {
          const ativa = a.valor === valor;
          return (
            <button
              key={a.valor}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-aba-${a.valor}`}
              aria-selected={ativa}
              aria-controls={`${id}-painel`}
              tabIndex={ativa ? 0 : -1}
              className={`${styles.aba} ${ativa ? styles.ativa : ""}`}
              onClick={() => aoMudar(a.valor)}
              onKeyDown={(e) => teclado(e, i)}
            >
              {a.rotulo}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`${id}-painel`} aria-labelledby={`${id}-aba-${valor}`} className={styles.painel}>
        {children}
      </div>
    </div>
  );
}
