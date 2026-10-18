import { dataCurta, numero, prazoCurto } from "@/lib/formato";
import styles from "./Alcance.module.css";

export interface Semana {
  inicio: string;
  valor: number;
}

/** Soma 6 dias a uma data ISO (só a data), sem depender do fuso do navegador. */
function fimDaSemana(iso: string) {
  const [a, m, d] = iso.slice(0, 10).split("-").map(Number);
  const dt = new Date(Date.UTC(a, m - 1, d + 6));
  return dt.toISOString().slice(0, 10);
}

/** Escala do eixo: múltiplo de 5 acima do maior valor. */
function topoDaEscala(max: number) {
  return Math.max(5, Math.ceil(max / 5) * 5 + (max % 5 === 0 ? 5 : 0));
}

/**
 * Barras verticais de inscrições por semana (E7). O pico fica em Ameixa e as
 * demais em rosado; o valor aparece sempre acima da barra. Uma linha tracejada
 * marca o fim das submissões. Leitores de tela recebem uma tabela equivalente.
 */
export function GraficoSemanas({
  semanas,
  fimSubmissoes,
  idTitulo,
}: {
  semanas: Semana[];
  /** ISO do fim das submissões (opcional). */
  fimSubmissoes?: string;
  idTitulo: string;
}) {
  const max = Math.max(...semanas.map((s) => s.valor), 0);
  const topo = topoDaEscala(max);
  const marcas = Array.from({ length: topo / 5 + 1 }, (_, i) => i * 5);
  const fimData = fimSubmissoes?.slice(0, 10);
  const indiceFim = fimData ? semanas.findIndex((s) => s.inicio <= fimData && fimData <= fimDaSemana(s.inicio)) : -1;

  return (
    <>
      <div className={styles.rolagem} tabIndex={0} role="group" aria-labelledby={idTitulo}>
        <div className={styles.grafico} aria-hidden="true">
          <div className={styles.eixoY}>
            {marcas.map((m) => (
              <span key={m} style={{ bottom: `${(m / topo) * 100}%` }}>
                {m}
              </span>
            ))}
          </div>
          <div className={styles.area}>
            {marcas.map((m) => (
              <span key={m} className={styles.grade} style={{ bottom: `${(m / topo) * 100}%` }} />
            ))}
            {semanas.map((s, i) => {
              const pico = s.valor === max && max > 0;
              return (
                <div key={s.inicio} className={styles.coluna}>
                  <div className={styles.colunaBarra}>
                    <span
                      className={`${styles.barra} ${pico ? styles.barraPico : ""}`}
                      style={{ height: `${(s.valor / topo) * 100}%` }}
                    >
                      <span className={styles.valorBarra}>{s.valor}</span>
                    </span>
                    {i === indiceFim && fimSubmissoes ? (
                      <span className={styles.marcoFim}>
                        <span className={styles.marcoTexto}>
                          <strong>fim das submissões</strong>
                          <span className="tabular">{prazoCurto(fimSubmissoes).replace(" (BRT)", "")}</span>
                        </span>
                      </span>
                    ) : null}
                  </div>
                  <span className={`${styles.rotuloSemana} tabular`}>{dataCurta(s.inicio)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <table className="sr-only">
        <caption>Inscrições por semana, semana iniciada em</caption>
        <thead>
          <tr>
            <th scope="col">Semana</th>
            <th scope="col">Inscrições</th>
          </tr>
        </thead>
        <tbody>
          {semanas.map((s, i) => (
            <tr key={s.inicio}>
              <th scope="row">
                {dataCurta(s.inicio)} a {dataCurta(fimDaSemana(s.inicio))}
                {i === indiceFim ? " (semana do fim das submissões)" : ""}
              </th>
              <td>{numero(s.valor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
