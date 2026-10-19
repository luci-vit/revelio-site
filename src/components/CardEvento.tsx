"use client";

import { Heart, MapPin, Monitor, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useEstado } from "@/data/estado";
import { hojeDoPapel } from "@/data/demo";
import { estaInscrito } from "@/data/selectors";
import type { Evento } from "@/data/tipos";
import * as f from "@/lib/formato";
import { Botao } from "./Botao";
import { Estado, Etiqueta, IconesEstado } from "./Estado";
import styles from "./CardEvento.module.css";

/** Situação das submissões com ícone + texto + cor, dia, hora e fuso. */
export function SituacaoSubmissoes({
  evento,
  mostrarInscricao = false,
}: {
  evento: Evento;
  /** Se true e a pessoa estiver inscrita, mostra “Você está inscrita” no lugar do prazo. */
  mostrarInscricao?: boolean;
}) {
  const { estado, usuario, papel } = useEstado();
  if (mostrarInscricao && usuario && estaInscrito(estado, usuario.id, evento.slug) && !evento.encerrado) {
    return <Estado tom="info">Você está inscrita</Estado>;
  }
  const p = evento.prazos;
  if (evento.situacaoSubmissoes === "em-breve" && p.submissoesAbrem) {
    return (
      <Estado tom="neutro" icone={IconesEstado.calendario}>
        Submissões abrem em {f.data(p.submissoesAbrem)}
      </Estado>
    );
  }
  if (evento.situacaoSubmissoes === "encerrada" || !p.submissoes) {
    return (
      <Estado tom="neutro" icone={IconesEstado.cadeado}>
        Submissões encerradas
      </Estado>
    );
  }
  const faltam = f.diasEntre(hojeDoPapel(papel), p.submissoes);
  // Atenção só na reta final (B1: “faltam 2 dias”).
  if (faltam <= 2) {
    return (
      <Estado tom="atencao">
        Submissões até {f.prazoCurto(p.submissoes)} · faltam {faltam} {faltam === 1 ? "dia" : "dias"}
      </Estado>
    );
  }
  return (
    <Estado tom="sucesso" icone={IconesEstado.relogio}>
      Submissões até {f.prazo(p.submissoes)}
    </Estado>
  );
}

export function precoAPartirDe(evento: Evento) {
  const precos = evento.categorias.map((c) => c.preco);
  const min = Math.min(...precos);
  if (min === 0) return "Gratuito";
  if (precos.length === 1) return f.dinheiro(min, true);
  return `A partir de ${f.dinheiro(min)}`;
}

/** Card de evento (identidade 3.7): o que, quando, onde e se ainda dá para participar. */
export function CardEvento({ evento }: { evento: Evento }) {
  const { estado, despachar } = useEstado();
  const salvo = estado.salvos.includes(evento.slug);
  const selo = f.seloData(evento.dataInicio, evento.dataFim);
  const href = `/eventos/${evento.slug}`;

  return (
    <article className={styles.card}>
      <div className={styles.capa} style={{ background: evento.capa }}>
        <div className={`${styles.selo} vidro-escuro`}>
          <span className={styles.seloDias}>{selo.dias}</span>
          <span className={styles.seloMes}>{selo.mes}</span>
        </div>
        <button
          type="button"
          className={`${styles.salvar} vidro`}
          aria-label="Salvar evento"
          aria-pressed={salvo}
          onClick={() => despachar({ tipo: "alternarSalvo", eventoSlug: evento.slug })}
        >
          <Heart size={22} fill={salvo ? "currentColor" : "none"} aria-hidden="true" />
        </button>
        <span className={styles.tituloCapa} aria-hidden="true">
          {evento.tituloCapa}
        </span>
      </div>
      <div className={styles.corpo}>
        <div className="linha-1">
          <Etiqueta>{evento.area}</Etiqueta>
          <Etiqueta>{evento.formato}</Etiqueta>
        </div>
        <h3 className={styles.nome}>
          <Link href={href}>{evento.nome}</Link>
        </h3>
        <p className={styles.info}>
          <CalendarDays size={20} aria-hidden="true" />
          <time dateTime={evento.dataInicio}>{f.periodoExtenso(evento.dataInicio, evento.dataFim)}</time>
        </p>
        <p className={styles.info}>
          {evento.local.online ? (
            <>
              <Monitor size={20} aria-hidden="true" /> On-line
            </>
          ) : (
            <>
              <MapPin size={20} aria-hidden="true" /> {evento.local.cidade}, {evento.local.uf} · {evento.local.instituicao}
            </>
          )}
        </p>
        <div>
          <SituacaoSubmissoes evento={evento} />
        </div>
        <div className={styles.rodape}>
          <span className={styles.preco}>{precoAPartirDe(evento)}</span>
          <Botao variante="secundario" href={href} aria-label={`Ver evento: ${evento.nome}`}>
            Ver evento
          </Botao>
        </div>
      </div>
    </article>
  );
}
