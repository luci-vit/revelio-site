import { numero, porcentagem } from "@/lib/formato";
import styles from "./Alcance.module.css";

export interface EtapaFunil {
  etapa: string;
  valor: number;
}

/** Complemento da taxa de cada etapa, como no protótipo. */
const BASE_DA_TAXA = ["", "", " dos cliques", " de quem abriu"];

/**
 * Funil de alcance (E7): cada etapa com valor e taxa de conversão em relação à
 * anterior. A barra é proporcional à primeira etapa; o texto já diz tudo, então
 * a barra fica escondida dos leitores de tela.
 */
export function Funil({ etapas }: { etapas: EtapaFunil[] }) {
  const base = etapas[0]?.valor ?? 0;
  return (
    <ol className={styles.funil}>
      {etapas.map((e, i) => {
        const anterior = etapas[i - 1];
        const taxa = anterior ? porcentagem(e.valor, anterior.valor, 1) : null;
        const largura = base ? (e.valor / base) * 100 : 0;
        return (
          <li key={e.etapa} className={styles.funilEtapa}>
            <div className={styles.funilLinha}>
              <span>{e.etapa}</span>
              <span className={`${styles.funilValor} tabular`}>
                <strong>{numero(e.valor)}</strong>
                {taxa ? (
                  <>
                    <span aria-hidden="true"> · </span>
                    <span className="sr-only">, </span>
                    {taxa}
                    {BASE_DA_TAXA[i] ?? ""}
                  </>
                ) : null}
              </span>
            </div>
            <span className={styles.trilho} aria-hidden="true">
              <span
                className={`${styles.preenchido} ${i === 0 ? styles.preenchidoBase : ""}`}
                style={{ width: `max(${largura}%, 8px)` }}
              />
            </span>
          </li>
        );
      })}
    </ol>
  );
}
