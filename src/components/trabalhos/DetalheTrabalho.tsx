"use client";

import { CalendarDays, FileText } from "lucide-react";
import { Trilha } from "@/components/Basicos";
import { Botao } from "@/components/Botao";
import { Aviso, Estado, IconesEstado } from "@/components/Estado";
import { useEstado } from "@/data/estado";
import { eventoPorSlug, pareceresDoTrabalho, trabalhoPorCodigo } from "@/data/selectors";
import type { Evento, Parecer, Trabalho } from "@/data/tipos";
import { data, diaMes, prazo } from "@/lib/formato";
import { EnvioVersao } from "./EnvioVersao";
import { RECOMENDACAO, SituacaoTrabalho, temResultado } from "./situacao";
import styles from "./DetalheTrabalho.module.css";

const NOTAS: { chave: keyof NonNullable<Parecer["notas"]>; rotulo: string }[] = [
  { chave: "originalidade", rotulo: "Originalidade" },
  { chave: "relevancia", rotulo: "Relevância" },
  { chave: "metodologia", rotulo: "Metodologia" },
  { chave: "clareza", rotulo: "Clareza" },
];

/** "14:00" → "14h"; "10:30" → "10h30" */
function horaCurta(h: string) {
  const [hh, mm] = h.split(":");
  return mm === "00" ? `${Number(hh)}h` : `${Number(hh)}h${mm}`;
}

/** C5 — resultado, pareceres e versão ajustada de um trabalho. */
export function DetalheTrabalho({ codigo }: { codigo: string }) {
  const { estado, usuario } = useEstado();
  const trabalho = trabalhoPorCodigo(estado, codigo);
  const ehAutora =
    trabalho && usuario
      ? trabalho.responsavelId === usuario.id || trabalho.autores.some((a) => a.pessoaId === usuario.id)
      : false;

  const trilha = <Trilha itens={[{ rotulo: "Meus trabalhos", href: "/meus-trabalhos" }, { rotulo: codigo.toUpperCase() }]} />;

  if (!usuario || !trabalho || !ehAutora) {
    return (
      <div className="container pagina pilha-3">
        {trilha}
        <h1 className="h2">Trabalho não encontrado</h1>
        <Aviso
          tom="atencao"
          acao={
            <Botao href="/meus-trabalhos" variante="secundario" tamanho="pequeno">
              Ver meus trabalhos
            </Botao>
          }
        >
          {!usuario
            ? "Entre na sua conta para ver seus trabalhos."
            : `Não há trabalho com o número ${codigo.toUpperCase()} entre os seus. Confira o número em Meus trabalhos.`}
        </Aviso>
      </div>
    );
  }

  const evento = eventoPorSlug(estado, trabalho.eventoSlug);
  const resultado = temResultado(trabalho);
  const pareceres = pareceresDoTrabalho(estado, trabalho.codigo).filter((p) => p.situacao === "concluido");
  const podeEnviarVersao =
    trabalho.situacao === "aprovado-com-ajustes" || (trabalho.situacao === "aprovado" && Boolean(evento?.prazos.versaoFinal));
  const apresenta = trabalho.apresentacao && trabalho.situacao !== "rascunho" && trabalho.situacao !== "rejeitado";

  return (
    <div className="container pagina pilha-3">
      <header className="pilha-1">
        {trilha}
        <div className={styles.tituloLinha}>
          <h1 className="h2">{trabalho.titulo}</h1>
          <SituacaoTrabalho trabalho={trabalho} evento={evento} />
        </div>
        <p className="corpo-apoio tabular">
          {evento?.nome ?? trabalho.eventoSlug} ·{" "}
          {resultado && evento?.prazos.resultado
            ? `Resultado publicado em ${data(evento.prazos.resultado)}`
            : `Submissão ${trabalho.codigo}`}
        </p>
      </header>

      <div className="com-lateral">
        <div className="pilha">
          {resultado ? (
            <>
              {trabalho.orientacaoComissao ? (
                <section className="card-suave pilha-1" aria-labelledby="orientacao">
                  <h2 id="orientacao" className={styles.tituloCaixa}>
                    Orientação da comissão
                  </h2>
                  <p>{trabalho.orientacaoComissao}</p>
                </section>
              ) : null}
              {pareceres.length ? (
                pareceres.map((p, i) => <CartaoParecer key={p.id} parecer={p} numero={i + 1} />)
              ) : (
                <Aviso tom="info">A comissão decidiu sem pareceres detalhados para este trabalho.</Aviso>
              )}
            </>
          ) : (
            <ProximosPassos trabalho={trabalho} evento={evento} />
          )}
          <DadosSubmissao trabalho={trabalho} />
        </div>

        <aside className="pilha" aria-label="Ações e prazos">
          {podeEnviarVersao ? <EnvioVersao trabalho={trabalho} evento={evento} /> : null}
          {trabalho.situacao === "rascunho" ? (
            <section className="card-destaque pilha" aria-labelledby="titulo-rascunho">
              <h2 id="titulo-rascunho" className={styles.tituloCaixa}>
                Envio não concluído
              </h2>
              {evento?.prazos.submissoes ? (
                <p>
                  Prazo: <strong className="tabular">{prazo(evento.prazos.submissoes)}</strong>. O rascunho
                  {trabalho.salvoEm ? ` foi salvo às ${trabalho.salvoEm}` : " está salvo"}; o trabalho só entra na
                  avaliação depois de enviado.
                </p>
              ) : null}
              <Botao href={`/eventos/${trabalho.eventoSlug}/submissao?codigo=${trabalho.codigo}`}>Continuar envio</Botao>
            </section>
          ) : null}
          {apresenta && trabalho.apresentacao ? (
            <section className="card pilha-1" aria-labelledby="titulo-apresentacao">
              <h2 id="titulo-apresentacao" className={styles.tituloCaixa}>
                Apresentação
              </h2>
              <p className={`${styles.apresentacao} tabular`}>
                <CalendarDays size={20} aria-hidden="true" />
                {diaMes(trabalho.apresentacao.dia)} às {horaCurta(trabalho.apresentacao.inicio)} ·{" "}
                {trabalho.apresentacao.sala}
              </p>
              <p className="apoio">
                Quem apresenta: {trabalho.autores.find((a) => a.apresentador)?.nome ?? trabalho.autores[0]?.nome}
              </p>
            </section>
          ) : null}
          {!resultado && evento ? <PrazosTrabalho evento={evento} /> : null}
        </aside>
      </div>
    </div>
  );
}

function CartaoParecer({ parecer, numero }: { parecer: Parecer; numero: number }) {
  const rec = parecer.recomendacao ? RECOMENDACAO[parecer.recomendacao] : null;
  return (
    <section className="card pilha" aria-labelledby={`parecer-${numero}`}>
      <div className="linha entre">
        {/* Revisão anônima: o autor nunca vê quem revisou. */}
        <h2 id={`parecer-${numero}`} className={styles.tituloCaixa}>
          Parecer {numero}
        </h2>
        {rec ? <Estado tom={rec.tom}>{rec.rotulo}</Estado> : null}
      </div>
      {parecer.comentarioAutores ? <p>{parecer.comentarioAutores}</p> : null}
      {parecer.notas ? (
        <dl className={styles.notas}>
          {NOTAS.filter((n) => parecer.notas?.[n.chave] !== undefined).map((n) => (
            <div key={n.chave}>
              <dt>{n.rotulo}</dt>
              <dd className="tabular">
                {parecer.notas?.[n.chave]}
                <span className="apoio"> de 5</span>
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}

function ProximosPassos({ trabalho, evento }: { trabalho: Trabalho; evento?: Evento }) {
  const p = evento?.prazos;
  let texto: string;
  if (trabalho.situacao === "rascunho") {
    texto = p?.submissoes
      ? `Conclua o envio até ${prazo(p.submissoes)}. Depois disso, o trabalho passa pela revisão do comitê científico.`
      : "Conclua o envio para que o trabalho passe pela revisão do comitê científico.";
  } else if (trabalho.situacao === "enviado") {
    texto = `Você pode editar o envio até ${p?.submissoes ? prazo(p.submissoes) : "o fim das submissões"}. Depois, dois revisores avaliam o trabalho sem saber quem são os autores.`;
  } else {
    texto = "Dois revisores do comitê científico estão avaliando o trabalho sem saber quem são os autores.";
  }
  return (
    <section className="card pilha" aria-labelledby="proximos">
      <h2 id="proximos" className={styles.tituloCaixa}>
        O que acontece a seguir
      </h2>
      <p>{texto}</p>
      {p?.resultado ? (
        <div>
          <Estado tom="info" icone={IconesEstado.calendario}>
            Os pareceres saem em {data(p.resultado)}
          </Estado>
        </div>
      ) : null}
    </section>
  );
}

function DadosSubmissao({ trabalho }: { trabalho: Trabalho }) {
  return (
    <section className="card pilha-1" aria-labelledby="dados">
      <h2 id="dados" className={styles.tituloCaixa}>
        Dados da submissão
      </h2>
      <dl className="pares">
        <div>
          <dt>Número</dt>
          <dd className="forte">{trabalho.codigo}</dd>
        </div>
        <div>
          <dt>Modalidade</dt>
          <dd>{trabalho.modalidade}</dd>
        </div>
        <div>
          <dt>Área</dt>
          <dd>{trabalho.area}</dd>
        </div>
        <div>
          <dt>Autores</dt>
          <dd>
            {trabalho.autores.map((a) => `${a.nome} (${a.instituicao})${a.apresentador ? " · apresenta" : ""}`).join("; ")}
          </dd>
        </div>
        <div>
          <dt>Arquivo</dt>
          <dd>
            {trabalho.arquivo ? (
              <span className={styles.arquivoLinha}>
                <FileText size={16} aria-hidden="true" />
                {trabalho.arquivo.nome} · {trabalho.arquivo.tamanho}
              </span>
            ) : (
              "Ainda não anexado"
            )}
          </dd>
        </div>
        {trabalho.arquivo?.enviadoEm ? (
          <div>
            <dt>Enviado em</dt>
            <dd>{prazo(trabalho.arquivo.enviadoEm)}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}

function PrazosTrabalho({ evento }: { evento: Evento }) {
  const p = evento.prazos;
  const linhas = [
    { rotulo: "Submissões até", valor: p.submissoes },
    { rotulo: "Revisão até", valor: p.revisao },
    { rotulo: "Resultado", valor: p.resultado },
    { rotulo: "Versão final até", valor: p.versaoFinal },
  ].filter((l): l is { rotulo: string; valor: string } => Boolean(l.valor));
  return (
    <section className="card pilha-1" aria-labelledby="prazos">
      <h2 id="prazos" className={styles.tituloCaixa}>
        Prazos do {evento.nomeCurto}
      </h2>
      <dl className="pares">
        {linhas.map((l) => (
          <div key={l.rotulo}>
            <dt>{l.rotulo}</dt>
            <dd>{prazo(l.valor)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
