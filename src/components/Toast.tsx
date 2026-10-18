"use client";

import { CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import styles from "./Toast.module.css";

interface DadosToast {
  /** Texto; pode conter <strong> para o identificador. */
  mensagem: ReactNode;
  acao?: { rotulo: string; href: string };
}

const Contexto = createContext<(t: DadosToast) => void>(() => {});

/**
 * Aviso em página (toast) em Ameixa: confirma a ação, mostra o identificador e
 * oferece o próximo passo. Ex.:
 *   const mostrar = useToast();
 *   mostrar({ mensagem: <>Artigo enviado. Número: <strong>SBDA-0042</strong></>, acao: { rotulo: "Ver artigo", href: "/meus-trabalhos/SBDA-0042" } });
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(DadosToast & { id: number }) | null>(null);
  const mostrar = useCallback((t: DadosToast) => setToast({ ...t, id: Date.now() }), []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 7000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <Contexto.Provider value={mostrar}>
      {children}
      <div className={styles.regiao} role="status" aria-live="polite">
        {toast ? (
          <div key={toast.id} className={styles.toast}>
            <FaixaConteudo {...toast} />
            <button type="button" className={styles.fechar} onClick={() => setToast(null)} aria-label="Fechar aviso">
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </Contexto.Provider>
  );
}

export function useToast() {
  return useContext(Contexto);
}

function FaixaConteudo({ mensagem, acao }: DadosToast) {
  return (
    <>
      <CheckCircle2 size={22} aria-hidden="true" className={styles.icone} />
      <span className={styles.mensagem}>{mensagem}</span>
      {acao ? (
        <Link href={acao.href} className={styles.acao}>
          {acao.rotulo}
        </Link>
      ) : null}
    </>
  );
}

/** A mesma faixa escura, fixa no topo da página (ex.: C4 “Trabalho enviado…”). */
export function FaixaConfirmacao(props: DadosToast) {
  return (
    <div className={styles.faixa} role="status">
      <FaixaConteudo {...props} />
    </div>
  );
}
