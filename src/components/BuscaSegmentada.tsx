"use client";

import { CalendarDays, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import styles from "./BuscaSegmentada.module.css";

export interface ValoresBusca {
  termo: string;
  onde: string;
  quando: string;
  filtro: string;
}

export const OPCOES_ONDE = ["Todo o Brasil · on-line", "Bahia", "Pernambuco", "Só on-line"];
export const OPCOES_QUANDO = ["Qualquer data", "nov 2026 – mar 2027", "Este mês", "Próximos 3 meses"];
export const OPCOES_FILTRO = ["Nenhum", "Submissões abertas", "Gratuitos", "Presencial", "On-line"];

export const BUSCA_PADRAO: ValoresBusca = {
  termo: "",
  onde: OPCOES_ONDE[0],
  quando: OPCOES_QUANDO[0],
  filtro: OPCOES_FILTRO[0],
};

/**
 * Busca segmentada em vidro (A1, B1): Buscar · Onde · Quando · Filtros + botão
 * em gradiente (a única ação primária da área). Cada segmento mostra o valor
 * escolhido.
 */
export function BuscaSegmentada({
  inicial = BUSCA_PADRAO,
  aoBuscar,
  rotuloFiltros = "Submissões, formato",
}: {
  inicial?: ValoresBusca;
  aoBuscar: (v: ValoresBusca) => void;
  /** Texto do segmento Filtros quando “Nenhum” está selecionado. */
  rotuloFiltros?: string;
}) {
  const [v, setV] = useState<ValoresBusca>(inicial);

  function enviar(e: FormEvent) {
    e.preventDefault();
    aoBuscar(v);
  }

  return (
    <form className={`${styles.busca} vidro`} role="search" onSubmit={enviar}>
      <Segmento icone={<Search size={22} />} rotulo="Buscar" id="busca-termo">
        <input
          id="busca-termo"
          className={styles.valor}
          placeholder="Nome ou área"
          value={v.termo}
          onChange={(e) => setV({ ...v, termo: e.target.value })}
        />
      </Segmento>
      <Segmento icone={<MapPin size={22} />} rotulo="Onde" id="busca-onde">
        <Selecao id="busca-onde" valor={v.onde} opcoes={OPCOES_ONDE} aoMudar={(onde) => setV({ ...v, onde })} />
      </Segmento>
      <Segmento icone={<CalendarDays size={22} />} rotulo="Quando" id="busca-quando">
        <Selecao id="busca-quando" valor={v.quando} opcoes={OPCOES_QUANDO} aoMudar={(quando) => setV({ ...v, quando })} />
      </Segmento>
      <Segmento icone={<SlidersHorizontal size={22} />} rotulo="Filtros" id="busca-filtro">
        <Selecao
          id="busca-filtro"
          valor={v.filtro}
          opcoes={OPCOES_FILTRO}
          aoMudar={(filtro) => setV({ ...v, filtro })}
          rotuloVazio={rotuloFiltros}
        />
      </Segmento>
      <button type="submit" className={styles.botao}>
        <Search size={22} aria-hidden="true" />
        Buscar
      </button>
    </form>
  );
}

function Segmento({ icone, rotulo, id, children }: { icone: ReactNode; rotulo: string; id: string; children: ReactNode }) {
  return (
    <div className={styles.segmento}>
      <span className={styles.icone} aria-hidden="true">
        {icone}
      </span>
      <div className={styles.textos}>
        <label htmlFor={id} className={styles.rotulo}>
          {rotulo}
        </label>
        {children}
      </div>
    </div>
  );
}

function Selecao({
  id,
  valor,
  opcoes,
  aoMudar,
  rotuloVazio,
}: {
  id: string;
  valor: string;
  opcoes: string[];
  aoMudar: (v: string) => void;
  rotuloVazio?: string;
}) {
  return (
    <select id={id} className={styles.valor} value={valor} onChange={(e) => aoMudar(e.target.value)}>
      {opcoes.map((o, i) => (
        <option key={o} value={o}>
          {i === 0 && rotuloVazio ? rotuloVazio : o}
        </option>
      ))}
    </select>
  );
}
