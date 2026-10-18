import { Check } from "lucide-react";
import styles from "./Etapas.module.css";

export type SituacaoEtapa = "concluida" | "atual" | "pendente";

export interface Etapa {
  rotulo: string;
  situacao: SituacaoEtapa;
}

const TEXTO: Record<SituacaoEtapa, string> = {
  concluida: "Concluída",
  atual: "Em andamento",
  pendente: "Pendente",
};

/**
 * Indicador de etapas (submissão C2/C3, fases do evento E2).
 * Cada etapa mostra o estado em texto e ícone, não só em cor.
 */
export function Etapas({ etapas, rotulo = "Etapas" }: { etapas: Etapa[]; rotulo?: string }) {
  return (
    <ol className={styles.etapas} aria-label={rotulo}>
      {etapas.map((e, i) => (
        <li key={e.rotulo} className={`${styles.etapa} ${styles[e.situacao]}`} aria-current={e.situacao === "atual" ? "step" : undefined}>
          <div className={styles.marcador}>
            <span className={styles.circulo} aria-hidden="true">
              {e.situacao === "concluida" ? <Check size={18} strokeWidth={3} /> : i + 1}
            </span>
            {i < etapas.length - 1 ? <span className={styles.trilho} aria-hidden="true" /> : null}
          </div>
          <span className={styles.rotulo}>{e.rotulo}</span>
          <span className={styles.situacao}>{TEXTO[e.situacao]}</span>
        </li>
      ))}
    </ol>
  );
}

/** Monta a lista de etapas a partir do índice atual. */
export function etapasAte(rotulos: string[], atual: number): Etapa[] {
  return rotulos.map((rotulo, i) => ({
    rotulo,
    situacao: i < atual ? "concluida" : i === atual ? "atual" : "pendente",
  }));
}
