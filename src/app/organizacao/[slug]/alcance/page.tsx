"use client";

import { BarChart3, Download } from "lucide-react";
import { useParams } from "next/navigation";
import { useId, useState } from "react";
import { CabecalhoPagina, CardNumero } from "@/components/Basicos";
import { Botao } from "@/components/Botao";
import { Segmentado } from "@/components/Segmentado";
import { Funil } from "@/components/organizacao/alcance/Funil";
import { GraficoSemanas } from "@/components/organizacao/alcance/GraficoSemanas";
import { OrigemEstados } from "@/components/organizacao/alcance/OrigemEstados";
import { TabelaCupons } from "@/components/organizacao/alcance/TabelaCupons";
import { baixarCsvAlcance } from "@/components/organizacao/alcance/csv";
import styles from "@/components/organizacao/alcance/Alcance.module.css";
import { ALCANCE_SBDA } from "@/data/alcance";
import { useEstado } from "@/data/estado";
import { eventoPorSlug } from "@/data/selectors";
import { numero, porcentagem } from "@/lib/formato";

type Periodo = "7" | "30" | "todo";

/** Dados de alcance por evento; só o SBDA 2027 tem números no cenário. */
const ALCANCE_POR_EVENTO: Record<string, typeof ALCANCE_SBDA> = { "sbda-2027": ALCANCE_SBDA };

/** Semanas exibidas no gráfico para cada período. */
const SEMANAS_DO_PERIODO: Record<Periodo, number> = { "7": 1, "30": 4, todo: Infinity };

export default function Pagina() {
  const { slug } = useParams<{ slug: string }>();
  const { estado } = useEstado();
  const evento = eventoPorSlug(estado, slug);
  const alcance = ALCANCE_POR_EVENTO[slug];
  const [periodo, setPeriodo] = useState<Periodo>("todo");
  const idSemanas = useId();
  const idFunil = useId();
  const idOrigem = useId();

  const nomeEvento = evento?.nome ?? "Evento";

  if (!alcance) {
    return (
      <div className="pilha-3">
        <CabecalhoPagina titulo="Alcance do evento" descricao={nomeEvento} />
        <div className={`card ${styles.vazio}`}>
          <BarChart3 size={32} aria-hidden="true" />
          <p className={styles.vazioTitulo}>Ainda não há dados de alcance</p>
          <p className="corpo-apoio">Os dados de alcance aparecem depois que as inscrições abrirem.</p>
        </div>
      </div>
    );
  }

  const { funil, porSemana, cupons, origem, inscricoes } = alcance;
  const [exibicoes, cliques] = funil;
  const ultimaSemana = porSemana[porSemana.length - 1]?.valor ?? 0;
  const comCupom = cupons.reduce((s, c) => s + c.usos, 0);
  const semanas = porSemana.slice(-Math.min(SEMANAS_DO_PERIODO[periodo], porSemana.length));
  const pico = porSemana.reduce((m, s) => (s.valor > m.valor ? s : m), porSemana[0]);
  const somaPeriodo = semanas.reduce((s, x) => s + x.valor, 0);
  const resumoSemanas =
    periodo === "todo"
      ? `O pico (${pico.valor}) foi na semana do fim das submissões.`
      : `${numero(somaPeriodo)} inscrições ${periodo === "7" ? "na última semana" : "nas últimas 4 semanas"}.`;

  return (
    <div className="pilha-3">
      <CabecalhoPagina
        titulo="Alcance do evento"
        descricao={`${nomeEvento} · atualizado há 10 min`}
        acoes={
          <>
            <Segmentado<Periodo>
              rotulo="Período do gráfico de inscrições"
              valor={periodo}
              aoMudar={setPeriodo}
              opcoes={[
                { valor: "7", rotulo: "7 dias" },
                { valor: "30", rotulo: "30 dias" },
                { valor: "todo", rotulo: "Todo o período" },
              ]}
            />
            <Botao variante="secundario" icone={<Download size={20} aria-hidden="true" />} onClick={() => baixarCsvAlcance(slug, alcance)}>
              Exportar CSV
            </Botao>
          </>
        }
      />

      <div className={styles.numeros}>
        <CardNumero rotulo="Inscrições pagas" valor={numero(inscricoes)}>
          <span className={styles.numeroApoio}>+{numero(ultimaSemana)} na última semana</span>
        </CardNumero>
        <CardNumero rotulo="Cliques em “Ver evento”" valor={numero(cliques.valor)}>
          <span className={styles.numeroApoio}>de {numero(exibicoes.valor)} exibições do card</span>
        </CardNumero>
        <CardNumero rotulo="Conversão clique → inscrição" valor={porcentagem(inscricoes, cliques.valor, 1)}>
          <span className={styles.numeroApoio}>
            {numero(inscricoes)} de {numero(cliques.valor)}
          </span>
        </CardNumero>
        <CardNumero rotulo="Inscrições com cupom" valor={numero(comCupom)}>
          <span className={styles.numeroApoio}>{porcentagem(comCupom, inscricoes)} do total</span>
        </CardNumero>
      </div>

      <div className={styles.linhaGraficos}>
        <section className={`card ${styles.cartao}`} aria-labelledby={idSemanas}>
          <div className={styles.cartaoTextos}>
            <h2 id={idSemanas} className={styles.cartaoTitulo}>
              Inscrições por semana
            </h2>
            <p className="apoio" aria-live="polite">
              {resumoSemanas}
            </p>
          </div>
          <GraficoSemanas semanas={semanas} fimSubmissoes={evento?.prazos.submissoes} idTitulo={idSemanas} />
        </section>

        <section className={`card ${styles.cartao}`} aria-labelledby={idFunil}>
          <div className={styles.cartaoTextos}>
            <h2 id={idFunil} className={styles.cartaoTitulo}>
              Funil de alcance
            </h2>
            <p className="apoio">De quem viu o card até quem concluiu a inscrição.</p>
          </div>
          <Funil etapas={funil} />
        </section>
      </div>

      <div className={styles.linhaTabelas}>
        <TabelaCupons cupons={cupons} />

        <section className={`card ${styles.cartao}`} aria-labelledby={idOrigem}>
          <div className={styles.cartaoTextos}>
            <h2 id={idOrigem} className={styles.cartaoTitulo}>
              Origem dos inscritos
            </h2>
            <p className="apoio">Por estado informado na conta.</p>
          </div>
          <OrigemEstados origem={origem} idTitulo={idOrigem} />
        </section>
      </div>
    </div>
  );
}
