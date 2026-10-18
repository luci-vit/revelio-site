"use client";

import { BookOpen, Cpu, Database, HeartPulse, Leaf, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./BlocosArea.module.css";

const ICONES: Record<string, ReactNode> = {
  Todas: <Sparkles size={24} />,
  Computação: <Cpu size={24} />,
  Saúde: <HeartPulse size={24} />,
  Educação: <BookOpen size={24} />,
  Ambiente: <Leaf size={24} />,
  "Ciência de Dados": <Database size={24} />,
};

/** Blocos de área (B1). O selecionado fica em Ameixa. */
export function BlocosArea({
  areas,
  valor,
  aoMudar,
}: {
  /** Inclua "Todas" como primeira opção. */
  areas: string[];
  valor: string;
  aoMudar: (v: string) => void;
}) {
  return (
    <div className={styles.blocos} role="radiogroup" aria-label="Áreas">
      {areas.map((a) => {
        const ativo = a === valor;
        return (
          <button
            key={a}
            type="button"
            role="radio"
            aria-checked={ativo}
            className={`${styles.bloco} ${ativo ? styles.ativo : ""}`}
            onClick={() => aoMudar(a)}
          >
            <span aria-hidden="true">{ICONES[a] ?? <Sparkles size={24} />}</span>
            <span className={styles.nome}>{a}</span>
          </button>
        );
      })}
    </div>
  );
}
