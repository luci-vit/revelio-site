"use client";

import { SearchX } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { BlocosArea } from "@/components/BlocosArea";
import { Botao } from "@/components/Botao";
import { BuscaSegmentada, type ValoresBusca } from "@/components/BuscaSegmentada";
import { CardEvento } from "@/components/CardEvento";
import { Segmentado } from "@/components/Segmentado";
import { hojeDoPapel } from "@/data/demo";
import { useEstado } from "@/data/estado";
import { AREAS_B1, BUSCA_B1, buscaDaUrl, buscaParaUrl, filtrarEventos, type Ordem, type Periodo } from "./filtros";
import styles from "./BuscaEventos.module.css";

const PERIODOS: { valor: Periodo; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "semana", rotulo: "Esta semana" },
  { valor: "mes", rotulo: "Este mês" },
  { valor: "prazo", rotulo: "Prazo aberto" },
];

const ORDENS: { valor: Ordem; rotulo: string }[] = [
  { valor: "prazo", rotulo: "Prazo de submissão mais próximo" },
  { valor: "data", rotulo: "Data do evento" },
  { valor: "nome", rotulo: "Nome (A–Z)" },
];

/** B1 — Busca e filtro de eventos. */
export function BuscaEventos() {
  const { estado, papel } = useEstado();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [busca, setBusca] = useState<ValoresBusca>(() => buscaDaUrl(params));
  const [periodo, setPeriodo] = useState<Periodo>("todos");
  const [area, setArea] = useState("Todas");
  const [ordem, setOrdem] = useState<Ordem>("prazo");
  // Muda a cada “Limpar filtros” para recriar a busca segmentada com os valores padrão.
  const [versaoBusca, setVersaoBusca] = useState(0);

  const hoje = hojeDoPapel(papel);
  const eventos = useMemo(
    () => filtrarEventos(estado.eventos, { busca, periodo, area, ordem, hoje }),
    [estado.eventos, busca, periodo, area, ordem, hoje],
  );

  const temFiltro =
    periodo !== "todos" || area !== "Todas" || buscaParaUrl(busca) !== buscaParaUrl(BUSCA_B1);

  function buscar(v: ValoresBusca) {
    setBusca(v);
    router.replace(`${pathname}?${buscaParaUrl(v)}`, { scroll: false });
  }

  function limpar() {
    setBusca(BUSCA_B1);
    setPeriodo("todos");
    setArea("Todas");
    setVersaoBusca((n) => n + 1);
    router.replace(pathname, { scroll: false });
  }

  const n = eventos.length;

  return (
    <div className="container pagina">
      <h1 className={styles.titulo}>Eventos</h1>

      <BuscaSegmentada key={versaoBusca} inicial={busca} aoBuscar={buscar} rotuloFiltros="Nenhum" />

      <div className={styles.filtros}>
        <Segmentado opcoes={PERIODOS} valor={periodo} aoMudar={setPeriodo} rotulo="Período" />
        <BlocosArea areas={AREAS_B1} valor={area} aoMudar={setArea} />
        <button type="button" className={styles.limpar} onClick={limpar} disabled={!temFiltro}>
          Limpar filtros
        </button>
      </div>

      <div className={styles.resumo}>
        <p aria-live="polite">
          <strong className="tabular">
            {n} {n === 1 ? "evento" : "eventos"}
          </strong>{" "}
          {n === 1 ? "encontrado" : "encontrados"}
        </p>
        <label className={styles.ordem}>
          <span>Ordenar por:</span>
          <select value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)}>
            {ORDENS.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </select>
        </label>
      </div>

      {n > 0 ? (
        <ul className={`grade-cards ${styles.grade}`}>
          {eventos.map((e) => (
            <li key={e.slug}>
              <CardEvento evento={e} />
            </li>
          ))}
        </ul>
      ) : (
        <div className={`card ${styles.vazio}`}>
          <SearchX size={40} aria-hidden="true" />
          <h2 className="h3">Nenhum evento com esses filtros</h2>
          <p className="corpo-apoio">Tente outro período, outra área ou um termo de busca mais amplo.</p>
          <Botao variante="secundario" onClick={limpar}>
            Limpar filtros
          </Botao>
        </div>
      )}
    </div>
  );
}
