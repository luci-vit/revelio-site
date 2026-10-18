"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Botao } from "@/components/Botao";
import styles from "./Confirmacao.module.css";

/**
 * Confirmação simples em diálogo modal (nativo, com foco preso e Esc para
 * cancelar). Usada para recusar convite, enviar parecer e declarar conflito.
 */
export function Confirmacao({
  aberto,
  titulo,
  children,
  rotuloConfirmar,
  rotuloCancelar = "Voltar",
  variante = "primario",
  aoConfirmar,
  aoCancelar,
}: {
  aberto: boolean;
  titulo: string;
  children: ReactNode;
  rotuloConfirmar: string;
  rotuloCancelar?: string;
  variante?: "primario" | "destrutivo";
  aoConfirmar: () => void;
  aoCancelar: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      className={styles.dialogo}
      aria-labelledby={idTitulo}
      onCancel={(e) => {
        e.preventDefault();
        aoCancelar();
      }}
      onClick={(e) => {
        // Clique no fundo (fora da caixa) cancela.
        if (e.target === ref.current) aoCancelar();
      }}
    >
      <div className={styles.caixa}>
        <h2 id={idTitulo} className="h3">
          {titulo}
        </h2>
        <div className={styles.texto}>{children}</div>
        <div className={styles.acoes}>
          <Botao variante={variante} onClick={aoConfirmar}>
            {rotuloConfirmar}
          </Botao>
          <Botao variante="secundario" onClick={aoCancelar} autoFocus>
            {rotuloCancelar}
          </Botao>
        </div>
      </div>
    </dialog>
  );
}
