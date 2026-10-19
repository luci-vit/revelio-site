"use client";

import { useLayoutEffect, useRef } from "react";
import styles from "./Segmentado.module.css";

export interface OpcaoSegmentada<T extends string> {
  valor: T;
  rotulo: string;
}

/**
 * Controle segmentado em pílula (ex.: abas de período “Todos · Esta semana ·
 * Este mês · Prazo aberto”). O item ativo fica em Ameixa, com um indicador
 * que desliza até a opção escolhida.
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
  const refGrupo = useRef<HTMLDivElement>(null);
  const refIndicador = useRef<HTMLDivElement>(null);
  const refBotoes = useRef<Map<T, HTMLButtonElement>>(new Map());

  useLayoutEffect(() => {
    const grupo = refGrupo.current;
    const indicador = refIndicador.current;
    if (!grupo || !indicador) return;
    function posicionar() {
      const alvo = refBotoes.current.get(valor);
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
    // Só anima depois da primeira posição, para não “voar” do canto ao montar.
    const quadro = requestAnimationFrame(() => {
      indicador.dataset.pronto = "true";
    });
    const observador = new ResizeObserver(posicionar);
    observador.observe(grupo);
    return () => {
      cancelAnimationFrame(quadro);
      observador.disconnect();
    };
  }, [valor, opcoes]);

  return (
    <div ref={refGrupo} className={styles.grupo} role="radiogroup" aria-label={rotulo}>
      <div ref={refIndicador} className={styles.indicador} aria-hidden="true" />
      {opcoes.map((o) => {
        const ativo = o.valor === valor;
        return (
          <button
            key={o.valor}
            ref={(el) => {
              if (el) refBotoes.current.set(o.valor, el);
              else refBotoes.current.delete(o.valor);
            }}
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
