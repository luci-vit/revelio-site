"use client";

import { CalendarDays, MapPin, Monitor, UserRound } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Abas } from "@/components/Abas";
import { Trilha } from "@/components/Basicos";
import { Etiqueta } from "@/components/Estado";
import { useEstado } from "@/data/estado";
import { evento as eventoDoCenario } from "@/data/eventos";
import { eventoPorSlug } from "@/data/selectors";
import type { Evento } from "@/data/tipos";
import * as f from "@/lib/formato";
import { AbaAprovados, AbaPrazos, AbaProgramacao, AbaSobre } from "./AbasEvento";
import { CaixaEnviarTrabalho, InstrucoesAutores } from "./ChamadaTrabalhos";
import { CaixaInscricao, CaixaPrazos } from "./LateralEvento";
import styles from "./PaginaEvento.module.css";

export type AbaEvento = "sobre" | "programacao" | "chamada" | "prazos" | "aprovados";

const ABAS: { valor: AbaEvento; rotulo: string }[] = [
  { valor: "sobre", rotulo: "Sobre" },
  { valor: "programacao", rotulo: "Programação" },
  { valor: "chamada", rotulo: "Chamada de trabalhos" },
  { valor: "prazos", rotulo: "Prazos" },
  { valor: "aprovados", rotulo: "Aprovados" },
];

function abaValida(v: string | null): AbaEvento {
  return ABAS.some((a) => a.valor === v) ? (v as AbaEvento) : "sobre";
}

export function localDoEvento(e: Evento) {
  if (e.local.online) return "On-line";
  const lugar = e.local.endereco?.split(" · ")[0] ?? e.local.instituicao;
  return [lugar, [e.local.cidade, e.local.uf].filter(Boolean).join(", ")].filter(Boolean).join(" · ");
}

/** B2 (+ C1 na aba “Chamada de trabalhos”) — Página do evento. */
export function PaginaEvento({ slug }: { slug: string }) {
  const { estado } = useEstado();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const aba = abaValida(params.get("aba"));

  // O estado em memória pode ter mudado o evento (resultado publicado, prazos…).
  const evento = eventoPorSlug(estado, slug) ?? eventoDoCenario(slug);
  if (!evento) return null;

  function mudarAba(v: AbaEvento) {
    router.replace(v === "sobre" ? pathname : `${pathname}?aba=${v}`, { scroll: false });
  }

  return (
    <div className="container pagina">
      <Trilha itens={[{ rotulo: "Eventos", href: "/eventos" }, { rotulo: evento.nome }]} />

      <div className={`com-lateral ${styles.corpo}`}>
        <div className={styles.principal}>
          <header className={styles.cabecalho}>
            <div className={styles.capa} style={{ background: evento.capa }} aria-hidden="true">
              <span>{evento.tituloCapa}</span>
            </div>
            <div className={styles.dados}>
              <div className="linha-1">
                <Etiqueta>{evento.area}</Etiqueta>
                <Etiqueta>{evento.formato}</Etiqueta>
              </div>
              <h1 className={styles.titulo}>{evento.nome}</h1>
              <ul className={styles.infos}>
                <li>
                  <CalendarDays size={20} aria-hidden="true" />
                  <span>
                    <time dateTime={evento.dataInicio}>{f.periodoExtenso(evento.dataInicio, evento.dataFim)}</time>
                    {evento.horario ? `, ${evento.horario}` : ""}
                  </span>
                </li>
                <li>
                  {evento.local.online ? <Monitor size={20} aria-hidden="true" /> : <MapPin size={20} aria-hidden="true" />}
                  <span>{localDoEvento(evento)}</span>
                </li>
                <li>
                  <UserRound size={20} aria-hidden="true" />
                  <span>Organização: {evento.organizacao}</span>
                </li>
              </ul>
            </div>
          </header>

          <Abas abas={ABAS} valor={aba} aoMudar={mudarAba} rotulo="Seções do evento">
            {aba === "sobre" && <AbaSobre evento={evento} />}
            {aba === "programacao" && <AbaProgramacao evento={evento} />}
            {aba === "chamada" && <InstrucoesAutores evento={evento} />}
            {aba === "prazos" && <AbaPrazos evento={evento} />}
            {aba === "aprovados" && <AbaAprovados evento={evento} />}
          </Abas>
        </div>

        <aside className={styles.lateral} aria-label={aba === "chamada" ? "Envio de trabalhos" : "Inscrição e prazos"}>
          {aba === "chamada" ? <CaixaEnviarTrabalho evento={evento} /> : <CaixaInscricao evento={evento} />}
          <CaixaPrazos evento={evento} />
        </aside>
      </div>
    </div>
  );
}
