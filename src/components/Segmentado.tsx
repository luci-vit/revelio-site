"use client";

import styles from "./Segmentado.module.css";

export interface OpcaoSegmentada<T extends string> {
  valor: T;
  rotulo: string;
}

/**
 * Controle segmentado em pílula (ex.: abas de período “Todos · Esta semana ·
 * Este mês · Prazo aberto”). O item ativo fica em Ameixa.
 */
export function Segmentado<T extends string>({
  opcoes,
  valor,
  aoMudar,
  rotulo,
}: {
  opcoes: OpcaoSegmentada<T>[];
  valor: T;
  aoMudar: (v: T) => void;
  /** Nome acessível do grupo. */
  rotulo: string;
}) {
  return (
    <div className={styles.grupo} role="radiogroup" aria-label={rotulo}>
      {opcoes.map((o) => {
        const ativo = o.valor === valor;
        return (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={ativo}
            className={`${styles.item} ${ativo ? styles.ativo : ""}`}
            onClick={() => aoMudar(o.valor)}
          >
            {o.rotulo}
          </button>
        );
      })}
    </div>
  );
}
