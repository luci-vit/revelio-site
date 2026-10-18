"use client";

import { Info } from "lucide-react";
import Link from "next/link";
import { Botao, BotaoBloqueado } from "@/components/Botao";
import { precoAPartirDe } from "@/components/CardEvento";
import { Estado, IconesEstado } from "@/components/Estado";
import { useEstado } from "@/data/estado";
import { inscricaoNoEvento } from "@/data/selectors";
import type { Evento, Pessoa } from "@/data/tipos";
import * as f from "@/lib/formato";
import styles from "./PaginaEvento.module.css";

// Pessoas do cenário tratadas no masculino (o restante dos textos segue “inscrita”).
const MASCULINO = new Set(["paulo", "luiz", "marcos", "roberto", "tiago", "rafael"]);

/** “inscrita” ou “inscrito”, conforme a pessoa logada. */
export function inscritaOu(usuario: Pessoa | null) {
  return usuario && MASCULINO.has(usuario.id) ? "inscrito" : "inscrita";
}

/** Caixa “Inscrição” da lateral (B2). */
export function CaixaInscricao({ evento }: { evento: Evento }) {
  const { estado, usuario } = useEstado();
  const inscricao = inscricaoNoEvento(estado, usuario?.id, evento.slug);
  const href = `/eventos/${evento.slug}/inscricao`;

  let acao;
  if (inscricao) {
    acao = (
      <div className="pilha">
        <div className={styles.selo}>
          <Estado tom="sucesso">
            Você está {inscritaOu(usuario)} · ingresso <span className="tabular">{inscricao.ingresso}</span>
          </Estado>
        </div>
        <div>
          <Botao variante="secundario" href={`${href}/confirmada`}>
            Ver crachá
          </Botao>
        </div>
      </div>
    );
  } else if (evento.encerrado) {
    acao = (
      <BotaoBloqueado
        id="inscricao"
        explicacao={
          <>
            <Info size={16} aria-hidden="true" /> Este evento já aconteceu. As inscrições estão encerradas.
          </>
        }
      >
        Fazer inscrição
      </BotaoBloqueado>
    );
  } else if (evento.vagasDisponiveis <= 0) {
    acao = (
      <BotaoBloqueado
        id="inscricao"
        explicacao={
          <>
            <Info size={16} aria-hidden="true" /> As vagas se esgotaram.
          </>
        }
      >
        Fazer inscrição
      </BotaoBloqueado>
    );
  } else {
    acao = (
      <div>
        <Botao href={href}>Fazer inscrição</Botao>
      </div>
    );
  }

  return (
    <section className={`card-destaque ${styles.caixa}`} aria-labelledby="titulo-inscricao">
      <h2 id="titulo-inscricao" className={styles.tituloCaixa}>
        Inscrição
      </h2>
      <p className="tabular">
        {precoAPartirDe(evento)} · Vagas: {f.numero(evento.vagas)} ({f.numero(evento.vagasDisponiveis)}{" "}
        {evento.vagasDisponiveis === 1 ? "disponível" : "disponíveis"})
      </p>
      <p className="corpo-apoio">Uma inscrição vale para todos os trabalhos que você enviar.</p>
      {acao}
      {evento.encerrado && inscricao ? (
        <p className="apoio">
          Certificados e recibos ficam em <Link href="/minhas-inscricoes">Minhas inscrições</Link>.
        </p>
      ) : null}
    </section>
  );
}

/** Caixa “Prazos” da lateral (B2). */
export function CaixaPrazos({ evento }: { evento: Evento }) {
  const p = evento.prazos;
  const emBreve = evento.situacaoSubmissoes === "em-breve";
  return (
    <section className={`card ${styles.caixa}`} aria-labelledby="titulo-prazos">
      <h2 id="titulo-prazos" className={styles.tituloCaixa}>
        Prazos
      </h2>
      <dl className="pares">
        {emBreve && p.submissoesAbrem ? (
          <div>
            <dt>Abertura</dt>
            <dd>{f.prazo(p.submissoesAbrem)}</dd>
          </div>
        ) : null}
        {p.submissoes ? (
          <div>
            <dt>Submissões</dt>
            <dd className={evento.situacaoSubmissoes === "aberta" ? "forte" : undefined}>até {f.prazo(p.submissoes)}</dd>
          </div>
        ) : null}
        {p.revisao ? (
          <div>
            <dt>Revisão</dt>
            <dd>até {f.prazo(p.revisao)}</dd>
          </div>
        ) : null}
        {p.resultado ? (
          <div>
            <dt>Resultado</dt>
            <dd>{f.data(p.resultado)}</dd>
          </div>
        ) : null}
        <div>
          <dt>Evento</dt>
          <dd>{f.periodoCurto(evento.dataInicio, evento.dataFim)}</dd>
        </div>
      </dl>
      {evento.encerrado ? (
        <Estado tom="neutro" icone={IconesEstado.cadeado}>
          Evento encerrado
        </Estado>
      ) : null}
    </section>
  );
}
