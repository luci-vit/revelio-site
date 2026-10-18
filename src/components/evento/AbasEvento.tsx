"use client";

import { AlertTriangle, MapPin, UserRound } from "lucide-react";
import { Aviso, Estado, Etiqueta, IconesEstado } from "@/components/Estado";
import { hojeDoPapel } from "@/data/demo";
import { useEstado } from "@/data/estado";
import { pessoa } from "@/data/pessoas";
import { trabalhosSubmetidos } from "@/data/selectors";
import type { Evento, Sessao } from "@/data/tipos";
import * as f from "@/lib/formato";
import styles from "./PaginaEvento.module.css";

/** Aba Sobre: descrição, público e formatos. */
export function AbaSobre({ evento }: { evento: Evento }) {
  return (
    <div className="pilha-3">
      <p className={styles.descricao}>{evento.descricao}</p>
      <div className={styles.duasColunas}>
        <section className="card-suave pilha-1">
          <h2 className="h4">Público</h2>
          <p className="corpo-apoio">{evento.publico}</p>
        </section>
        <section className="card-suave pilha-1">
          <h2 className="h4">Formatos</h2>
          <p className="corpo-apoio">{evento.formatosAceitos}</p>
        </section>
      </div>
    </div>
  );
}

const DIAS_SEMANA = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

function diasDoEvento(inicio: string, fim: string) {
  const [a, m, d] = inicio.split("-").map(Number);
  const dias: string[] = [];
  for (let i = 0; i < 14; i++) {
    const iso = new Date(Date.UTC(a, m - 1, d + i)).toISOString().slice(0, 10);
    if (iso > fim) break;
    dias.push(iso);
  }
  return dias;
}

function diaDaSemana(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return DIAS_SEMANA[new Date(Date.UTC(a, m - 1, d)).getUTCDay()];
}

/** Aba Programação: sessões por dia, agrupadas por horário, com conflitos destacados. */
export function AbaProgramacao({ evento }: { evento: Evento }) {
  if (evento.programacao.length === 0) {
    return (
      <Aviso tom="neutro" icone={IconesEstado.calendario}>
        A programação ainda não foi publicada pela organização.
      </Aviso>
    );
  }
  const porId = new Map(evento.programacao.map((s) => [s.id, s]));

  return (
    <div className="pilha-3">
      {diasDoEvento(evento.dataInicio, evento.dataFim).map((dia) => {
        const sessoes = evento.programacao
          .filter((s) => s.dia === dia)
          .sort((a, b) => a.inicio.localeCompare(b.inicio) || a.fim.localeCompare(b.fim));
        const horarios = [...new Set(sessoes.map((s) => s.inicio))];
        const idDia = `dia-${dia}`;
        return (
          <section key={dia} className="pilha" aria-labelledby={idDia}>
            <h2 id={idDia} className="h4">
              {diaDaSemana(dia)}, <span className="tabular">{f.diaMes(dia)}</span>
            </h2>
            {sessoes.length === 0 ? (
              <p className="corpo-apoio">Programação deste dia em definição.</p>
            ) : (
              <ol className={styles.grade}>
                {horarios.map((h) => (
                  <li key={h} className={styles.horario}>
                    <time className={styles.hora} dateTime={`${dia}T${h}`}>
                      {h}
                    </time>
                    <ul className={styles.sessoes}>
                      {sessoes
                        .filter((s) => s.inicio === h)
                        .map((s) => (
                          <CardSessao key={s.id} sessao={s} conflitos={(s.conflitaCom ?? []).map((id) => porId.get(id)).filter(Boolean) as Sessao[]} />
                        ))}
                    </ul>
                  </li>
                ))}
              </ol>
            )}
          </section>
        );
      })}
    </div>
  );
}

function CardSessao({ sessao: s, conflitos }: { sessao: Sessao; conflitos: Sessao[] }) {
  return (
    <li className={`${styles.sessao} ${conflitos.length ? styles.sessaoConflito : ""}`}>
      <div className="linha-1 entre">
        <Etiqueta>{s.tipo}</Etiqueta>
        <span className="apoio tabular">
          {s.inicio}–{s.fim}
        </span>
      </div>
      <h3 className={styles.tituloSessao}>{s.titulo}</h3>
      <p className={styles.metaSessao}>
        <span className="linha-1">
          <MapPin size={16} aria-hidden="true" />
          {s.sala}
        </span>
        {s.responsavel ? (
          <span className="linha-1">
            <UserRound size={16} aria-hidden="true" />
            {s.responsavel}
          </span>
        ) : null}
      </p>
      {s.cancelada ? <Estado tom="erro">Sessão cancelada</Estado> : null}
      {conflitos.map((c) => (
        <p key={c.id} className={styles.conflito}>
          <AlertTriangle size={18} aria-hidden="true" />
          <span>
            Conflito de horário com “{c.titulo}” ({c.inicio}–{c.fim}, {c.sala})
          </span>
        </p>
      ))}
    </li>
  );
}

/** Aba Prazos: lista completa, com dia, hora e fuso. */
export function AbaPrazos({ evento }: { evento: Evento }) {
  const { papel } = useEstado();
  const hoje = hojeDoPapel(papel);
  const p = evento.prazos;
  const itens: { rotulo: string; descricao: string; iso: string; prefixo?: string }[] = [];
  if (p.submissoesAbrem) itens.push({ rotulo: "Abertura das submissões", descricao: "A partir desta data é possível enviar trabalhos.", iso: p.submissoesAbrem });
  if (p.submissoes) itens.push({ rotulo: "Fim das submissões", descricao: "Último momento para enviar trabalhos.", iso: p.submissoes, prefixo: "até " });
  if (p.revisao) itens.push({ rotulo: "Revisão", descricao: "O comitê científico conclui os pareceres.", iso: p.revisao, prefixo: "até " });
  if (p.resultado) itens.push({ rotulo: "Resultado", descricao: "Lista de trabalhos aprovados publicada na aba Aprovados.", iso: p.resultado });
  if (p.versaoFinal) itens.push({ rotulo: "Versão final", descricao: "Envio da versão ajustada dos trabalhos aprovados.", iso: p.versaoFinal, prefixo: "até " });

  const proximo = itens.find((i) => f.diasEntre(hoje, i.iso) >= 0);

  return (
    <ol className={styles.prazos}>
      {itens.map((i) => {
        const passou = f.diasEntre(hoje, i.iso) < 0;
        return (
          <li key={i.rotulo} className={styles.prazo}>
            <div className="pilha-1">
              <h2 className="h4">{i.rotulo}</h2>
              <p className="corpo-apoio">{i.descricao}</p>
            </div>
            <div className={styles.prazoValor}>
              <span className="forte tabular">
                {i.prefixo}
                {f.prazo(i.iso)}
              </span>
              {passou ? (
                <Estado tom="neutro" icone={IconesEstado.ok}>
                  Concluído
                </Estado>
              ) : i === proximo ? (
                <Estado tom="info" icone={IconesEstado.relogio}>
                  Próximo prazo
                </Estado>
              ) : null}
            </div>
          </li>
        );
      })}
      <li className={styles.prazo}>
        <div className="pilha-1">
          <h2 className="h4">Evento</h2>
          <p className="corpo-apoio">{evento.horario ? `Das ${evento.horario}.` : "Horário a confirmar."}</p>
        </div>
        <div className={styles.prazoValor}>
          <span className="forte tabular">{f.periodoExtenso(evento.dataInicio, evento.dataFim)}</span>
          {evento.encerrado ? (
            <Estado tom="neutro" icone={IconesEstado.cadeado}>
              Encerrado
            </Estado>
          ) : null}
        </div>
      </li>
    </ol>
  );
}

/** Aba Aprovados: lista pública depois que a organização publica o resultado. */
export function AbaAprovados({ evento }: { evento: Evento }) {
  const { estado } = useEstado();
  if (!evento.resultadoPublicado) {
    return (
      <Aviso tom="neutro" icone={IconesEstado.calendario}>
        {evento.prazos.resultado
          ? `O resultado sai em ${f.data(evento.prazos.resultado)}.`
          : "A data do resultado ainda não foi definida."}
      </Aviso>
    );
  }
  const aprovados = trabalhosSubmetidos(estado, evento.slug)
    .filter((t) => {
      const d = estado.decisoes[t.codigo] ?? t.situacao;
      return d === "aprovado" || d === "aprovado-com-ajustes";
    })
    .sort((a, b) => a.codigo.localeCompare(b.codigo));

  if (aprovados.length === 0) {
    return <Aviso tom="neutro">O resultado foi publicado, mas nenhum trabalho foi aprovado.</Aviso>;
  }

  return (
    <div className="pilha">
      <p className="corpo-apoio">
        <span className="tabular">{aprovados.length}</span> {aprovados.length === 1 ? "trabalho aprovado" : "trabalhos aprovados"}.
      </p>
      <ul className={styles.aprovados}>
        {aprovados.map((t) => (
          <li key={t.codigo} className="card pilha-1">
            <div className="linha-1 entre">
              <span className="apoio tabular">{t.codigo}</span>
              <Estado tom="sucesso">Aprovado</Estado>
            </div>
            <h2 className="h4">{t.titulo}</h2>
            <p className="corpo-apoio">{t.autores.map((a) => a.nome || pessoa(a.pessoaId ?? "")?.nome).filter(Boolean).join(", ")}</p>
            <div className="linha-1">
              <Etiqueta>{t.area}</Etiqueta>
              <Etiqueta>{t.modalidade}</Etiqueta>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
