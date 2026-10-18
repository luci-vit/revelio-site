"use client";

import { CheckCircle2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Botao } from "@/components/Botao";
import { Estado } from "@/components/Estado";
import { useToast } from "@/components/Toast";
import { conflitoDeInteresse, useEstado } from "@/data/estado";
import { pessoa } from "@/data/pessoas";
import { convitesDoEvento, eventoPorSlug, trabalhosSubmetidos } from "@/data/selectors";
import type { Trabalho } from "@/data/tipos";
import { prazo } from "@/lib/formato";
import { nomePessoa, papelDeAutoria } from "../rotulos";
import styles from "./Distribuicao.module.css";

function vagas(t: Trabalho) {
  return [0, 1].filter((i) => !t.revisores[i]).length;
}

/** E4 — distribuição dos trabalhos aos revisores. */
export function Distribuicao() {
  const { slug } = useParams<{ slug: string }>();
  const { estado, despachar } = useEstado();
  const mostrar = useToast();
  const evento = eventoPorSlug(estado, slug);
  const trabalhos = trabalhosSubmetidos(estado, slug);
  const revisoresAceitos = convitesDoEvento(estado, slug)
    .filter((c) => c.situacao === "aceito")
    .map((c) => c.pessoaId);

  // Conta quantas vagas a distribuição automática preencheu (o reducer é síncrono,
  // mas o novo estado só chega no próximo render).
  const vagasAntes = useRef<number | null>(null);
  const vagasAgora = trabalhos.reduce((s, t) => s + vagas(t), 0);
  useEffect(() => {
    if (vagasAntes.current === null) return;
    const atribuidos = vagasAntes.current - vagasAgora;
    vagasAntes.current = null;
    mostrar({
      mensagem:
        atribuidos > 0 ? (
          <>
            Distribuição feita: <strong>{atribuidos}</strong> {atribuidos === 1 ? "revisor atribuído" : "revisores atribuídos"} por área.
          </>
        ) : (
          <>Nenhum revisor disponível para as vagas restantes. Convide mais pessoas no comitê.</>
        ),
      acao: atribuidos > 0 ? undefined : { rotulo: "Ver comitê", href: `/organizacao/${slug}/comite` },
    });
  }, [vagasAgora, mostrar, slug, estado.trabalhos]);

  if (!evento) return <p>Evento não encontrado.</p>;

  function distribuir() {
    vagasAntes.current = vagasAgora;
    despachar({ tipo: "distribuirAutomaticamente", eventoSlug: slug });
  }

  return (
    <div className="pilha-3">
      <h1 className="h2">Trabalhos</h1>

      <div className={`card-suave ${styles.faixa}`}>
        <p className={styles.faixaTexto}>
          <CheckCircle2 size={22} aria-hidden="true" className={styles.faixaIcone} />
          <span>
            Submissões encerradas em <span className="tabular">{evento.prazos.submissoes ? prazo(evento.prazos.submissoes) : "—"}</span>.{" "}
            <strong>Distribuição liberada.</strong>
          </span>
        </p>
        <Botao onClick={distribuir} disabled={vagasAgora === 0}>
          Distribuir automaticamente por área
        </Botao>
      </div>

      <div className="tabela-envoltorio">
        <table className={`tabela ${styles.tabela}`}>
          <caption className="sr-only">Trabalhos submetidos e revisores atribuídos</caption>
          <thead>
            <tr>
              <th scope="col">Nº</th>
              <th scope="col">Título</th>
              <th scope="col">Área</th>
              <th scope="col">Revisor 1</th>
              <th scope="col">Revisor 2</th>
              <th scope="col">Situação</th>
            </tr>
          </thead>
          <tbody>
            {trabalhos.map((t) => {
              const faltam = vagas(t);
              return (
                <tr key={t.codigo}>
                  <td className="codigo">{t.codigo}</td>
                  <td className={styles.titulo}>{t.titulo}</td>
                  <td className={styles.area}>{t.area}</td>
                  {([0, 1] as const).map((pos) => (
                    <td key={pos} className={styles.revisor}>
                      <CelulaRevisor trabalho={t} posicao={pos} aceitos={revisoresAceitos} />
                    </td>
                  ))}
                  <td>
                    {faltam === 0 ? (
                      <Estado tom="sucesso">2 revisores</Estado>
                    ) : (
                      <Estado tom="atencao">{faltam === 1 ? "Falta 1 revisor" : "Faltam 2 revisores"}</Estado>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="apoio">Quem é autor ou coautor de um trabalho aparece como indisponível na lista de revisores desse trabalho.</p>
    </div>
  );
}

function CelulaRevisor({ trabalho: t, posicao, aceitos }: { trabalho: Trabalho; posicao: 0 | 1; aceitos: string[] }) {
  const { estado, despachar } = useEstado();
  const mostrar = useToast();
  const [trocando, setTrocando] = useState(false);
  const atual = t.revisores[posicao] ?? null;
  const outro = t.revisores[posicao === 0 ? 1 : 0] ?? null;

  // A segunda vaga só abre seletor quando a primeira já foi preenchida (como no protótipo).
  const primeiraVaga = !t.revisores[0] ? 0 : 1;

  if (atual && !trocando) {
    return (
      <div className={styles.atribuido}>
        <span>{nomePessoa(atual)}</span>
        <button type="button" className={styles.trocar} onClick={() => setTrocando(true)}>
          Trocar<span className="sr-only"> {nomePessoa(atual)} em {t.codigo}</span>
        </button>
      </div>
    );
  }

  if (!atual && posicao !== primeiraVaga) {
    return (
      <span className="apoio" aria-label="Aguardando o revisor 1">
        —
      </span>
    );
  }

  // Autores do trabalho que poderiam revisar (têm conta e atuam em alguma área ou estão no comitê).
  const autoresIndisponiveis = t.autores.filter((a) => {
    if (!a.pessoaId) return false;
    const p = pessoa(a.pessoaId);
    const noComite = estado.convites.some((c) => c.eventoSlug === t.eventoSlug && c.pessoaId === a.pessoaId);
    return Boolean(p?.temConta && (p.areas?.length || noComite));
  });
  const idsAutores = new Set(autoresIndisponiveis.map((a) => a.pessoaId));
  const opcoes = Array.from(new Set([...aceitos, ...(atual ? [atual] : [])])).filter((id) => id !== outro && !idsAutores.has(id));
  const idAjuda = `indisp-${t.codigo}-${posicao}`;

  function escolher(valor: string) {
    if (valor === "__remover") {
      despachar({ tipo: "atribuirRevisor", codigo: t.codigo, posicao, revisorId: null });
      mostrar({ mensagem: <>Revisor removido de <strong>{t.codigo}</strong>.</> });
    } else if (valor && valor !== atual) {
      despachar({ tipo: "atribuirRevisor", codigo: t.codigo, posicao, revisorId: valor });
      mostrar({
        mensagem: (
          <>
            {nomePessoa(valor)} atribuído a <strong>{t.codigo}</strong>.
          </>
        ),
      });
    }
    setTrocando(false);
  }

  return (
    <div className={styles.seletorEnvoltorio}>
      <label className="sr-only" htmlFor={`rev-${t.codigo}-${posicao}`}>
        Revisor {posicao + 1} de {t.codigo}
      </label>
      <select
        id={`rev-${t.codigo}-${posicao}`}
        className={`entrada ${styles.seletor}`}
        value={atual ?? ""}
        onChange={(e) => escolher(e.target.value)}
        aria-describedby={autoresIndisponiveis.length ? idAjuda : undefined}
        autoFocus={trocando}
      >
        {!atual ? <option value="">Escolher</option> : null}
        {opcoes.map((id) => (
          <option key={id} value={id} disabled={conflitoDeInteresse(t, id)}>
            {nomePessoa(id)}
            {conflitoDeInteresse(t, id) ? " (indisponível)" : ""}
          </option>
        ))}
        {autoresIndisponiveis.map((a) => (
          <option key={a.pessoaId} value={a.pessoaId} disabled>
            {a.nome}: indisponível ({papelDeAutoria(t, a)})
          </option>
        ))}
        {atual ? <option value="__remover">Remover revisor</option> : null}
      </select>
      {autoresIndisponiveis.length ? (
        <p id={idAjuda} className={styles.indisponivel}>
          {autoresIndisponiveis.map((a) => `${a.nome}: indisponível (${papelDeAutoria(t, a)})`).join(" · ")}
        </p>
      ) : null}
      {trocando ? (
        <button type="button" className={styles.trocar} onClick={() => setTrocando(false)}>
          Cancelar
        </button>
      ) : null}
    </div>
  );
}
