import { numero, porcentagem } from "@/lib/formato";
import styles from "./Alcance.module.css";

/** Barras horizontais de origem dos inscritos por estado (E7). */
export function OrigemEstados({ origem, idTitulo }: { origem: { uf: string; valor: number }[]; idTitulo: string }) {
  const max = Math.max(...origem.map((o) => o.valor), 0);
  const total = origem.reduce((s, o) => s + o.valor, 0);
  return (
    <ul className={styles.origem} aria-labelledby={idTitulo}>
      {origem.map((o) => (
        <li key={o.uf} className={styles.origemItem}>
          <span className={styles.origemUf}>{o.uf}</span>
          <span className={styles.trilho} aria-hidden="true">
            <span className={`${styles.preenchido} ${styles.preenchidoBase}`} style={{ width: `${max ? (o.valor / max) * 100 : 0}%` }} />
          </span>
          <span className={`${styles.origemValor} tabular`}>
            {numero(o.valor)}
            <span className="sr-only"> inscritos ({porcentagem(o.valor, total)})</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
