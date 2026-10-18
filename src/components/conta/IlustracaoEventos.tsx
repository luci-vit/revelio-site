"use client";

import { CalendarDays, CheckCircle2, MapPin, Monitor } from "lucide-react";
import { useEstado } from "@/data/estado";
import * as f from "@/lib/formato";
import styles from "./IlustracaoEventos.module.css";

/**
 * Composição gráfica do herói da página inicial (A1): cards de eventos do
 * cenário empilhados sobre o brilho de pôr do sol, sem foto real. É
 * decorativa; os mesmos eventos aparecem com links na busca (B1).
 */
export function IlustracaoEventos() {
  const { estado } = useEstado();
  const abertos = estado.eventos.filter((e) => !e.encerrado);
  const principal = abertos.find((e) => e.slug === "sbda-2027") ?? abertos[0];
  const atras = abertos.filter((e) => e.slug !== principal?.slug).slice(0, 2);
  if (!principal) return null;
  const selo = f.seloData(principal.dataInicio, principal.dataFim);

  return (
    <div className={styles.cena} aria-hidden="true">
      <div className={styles.brilho} />

      {atras.map((ev, i) => (
        <div key={ev.slug} className={`${styles.cardAtras} ${i === 0 ? styles.atrasA : styles.atrasB}`}>
          <div className={styles.capaPequena} style={{ background: ev.capa }}>
            <span>{ev.tituloCapa}</span>
          </div>
          <div className={styles.corpoPequeno}>
            <strong>{ev.nomeCurto}</strong>
            <span className={styles.linhaInfo}>
              <CalendarDays size={14} /> {f.periodoCurto(ev.dataInicio, ev.dataFim)}
            </span>
          </div>
        </div>
      ))}

      <div className={styles.cardPrincipal}>
        <div className={styles.capa} style={{ background: principal.capa }}>
          <div className={`${styles.selo} vidro-escuro`}>
            <span className={styles.seloDias}>{selo.dias}</span>
            <span className={styles.seloMes}>{selo.mes}</span>
          </div>
          <span className={styles.tituloCapa}>{principal.tituloCapa}</span>
        </div>
        <div className={styles.corpo}>
          <strong className={styles.nome}>{principal.nome}</strong>
          <span className={styles.linhaInfo}>
            {principal.local.online ? (
              <>
                <Monitor size={16} /> On-line
              </>
            ) : (
              <>
                <MapPin size={16} /> {principal.local.cidade}, {principal.local.uf} · {principal.local.instituicao}
              </>
            )}
          </span>
        </div>
      </div>

      {principal.prazos.submissoes ? (
        <div className={`${styles.chip} vidro`}>
          <CheckCircle2 size={18} className={styles.chipIcone} />
          <span>
            Submissões até <span className="tabular">{f.prazo(principal.prazos.submissoes)}</span>
          </span>
        </div>
      ) : null}
    </div>
  );
}
