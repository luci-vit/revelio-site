"use client";

import { Download, FileText, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { CabecalhoPagina, Trilha } from "@/components/Basicos";
import { Botao, BotaoBloqueado } from "@/components/Botao";
import { Campo } from "@/components/Campo";
import { Aviso, Etiqueta } from "@/components/Estado";
import { useToast } from "@/components/Toast";
import { HOJE_REVISAO } from "@/data/demo";
import { useEstado } from "@/data/estado";
import { pessoa } from "@/data/pessoas";
import { convitesDaPessoa, eventoPorSlug, inscricaoNoEvento, trabalhoPorCodigo } from "@/data/selectors";
import type { Evento, Parecer, Recomendacao, Trabalho } from "@/data/tipos";
import { data, hora, prazo } from "@/lib/formato";
import { Confirmacao } from "./Confirmacao";
import { Situacao, textoFaltam } from "./TelaFila";
import styles from "./Revisao.module.css";

type Criterio = "originalidade" | "relevancia" | "metodologia" | "clareza";

const CRITERIOS: { id: Criterio; rotulo: string }[] = [
  { id: "originalidade", rotulo: "Originalidade" },
  { id: "relevancia", rotulo: "Relevância" },
  { id: "metodologia", rotulo: "Metodologia" },
  { id: "clareza", rotulo: "Clareza" },
];

const RECOMENDACOES: { id: Recomendacao; rotulo: string }[] = [
  { id: "aceitar", rotulo: "Aprovar" },
  { id: "aceitar-com-ajustes", rotulo: "Aprovar com ajustes" },
  { id: "rejeitar", rotulo: "Não aprovar" },
];

const rotuloRecomendacao = (r?: Recomendacao) => RECOMENDACOES.find((x) => x.id === r)?.rotulo ?? "—";

/** D3 — Registrar parecer (ou ver parecer concluído). */
export function TelaParecer() {
  const { codigo } = useParams<{ codigo: string }>();
  const { estado, usuario } = useEstado();
  const trabalho = trabalhoPorCodigo(estado, decodeURIComponent(codigo));
  const evento = trabalho ? eventoPorSlug(estado, trabalho.eventoSlug) : undefined;
  const parecer =
    trabalho && usuario
      ? estado.pareceres.find((p) => p.trabalhoCodigo === trabalho.codigo && p.revisorId === usuario.id)
      : undefined;
  const convite =
    trabalho && usuario
      ? convitesDaPessoa(estado, usuario.id).find((c) => c.eventoSlug === trabalho.eventoSlug)
      : undefined;

  const cod = trabalho?.codigo ?? decodeURIComponent(codigo).toUpperCase();
  const trilha = <Trilha itens={[{ rotulo: "Revisões", href: "/revisoes" }, { rotulo: cod }]} />;

  if (!trabalho || !evento || !parecer || parecer.conflito || convite?.situacao !== "aceito") {
    return (
      <div className="container pagina">
        <CabecalhoPagina antes={trilha} titulo="Parecer indisponível" />
        <Aviso tom="info" acao={<Botao variante="secundario" tamanho="pequeno" href="/revisoes">Voltar para revisões</Botao>}>
          {!trabalho ? (
            <>
              <strong>Trabalho não encontrado.</strong> Confira o número na sua fila de revisões.
            </>
          ) : parecer?.conflito ? (
            <>
              <strong>Você declarou conflito de interesse.</strong> O trabalho voltou para a organização.
            </>
          ) : parecer && convite?.situacao !== "aceito" ? (
            <>
              <strong>Responda ao convite primeiro.</strong> Os pareceres ficam disponíveis depois do aceite.
            </>
          ) : (
            <>
              <strong>Este trabalho não foi atribuído a você.</strong> Você vê apenas os trabalhos da sua fila.
            </>
          )}
        </Aviso>
      </div>
    );
  }

  return (
    <div className="container pagina">
      <CabecalhoPagina
        antes={trilha}
        titulo={trabalho.titulo}
        acoes={<Situacao parecer={parecer} />}
      />
      <div className={styles.parecer}>
        <DadosTrabalho trabalho={trabalho} />
        {parecer.situacao === "concluido" ? (
          <ParecerLeitura parecer={parecer} evento={evento} />
        ) : (
          // A chave refaz o formulário quando o estado é restaurado do sessionStorage.
          <FormularioParecer key={JSON.stringify(parecer)} parecer={parecer} trabalho={trabalho} evento={evento} />
        )}
      </div>
    </div>
  );
}

function CaixaPrazo({ evento }: { evento: Evento }) {
  if (!evento.prazos.revisao) return null;
  return (
    <p className={styles.caixaPrazo}>
      <span>
        Prazo: <strong>{prazo(evento.prazos.revisao)}</strong>
      </span>
      <span aria-hidden="true">·</span>
      <span>{textoFaltam(evento.prazos.revisao)}</span>
    </p>
  );
}

function DadosTrabalho({ trabalho }: { trabalho: Trabalho }) {
  const mostrarToast = useToast();
  const arquivo = trabalho.arquivo ?? { nome: `${trabalho.codigo.toLowerCase()}.pdf`, paginas: 12, tamanho: "1,8 MB" };
  return (
    <section className={styles.trabalho} aria-labelledby="titulo-arquivo">
      <h2 id="titulo-arquivo" className="sobrelinha">
        Arquivo do trabalho (sem autoria)
      </h2>
      <div className={styles.arquivo}>
        <span className={styles.arquivoIcone}>
          <FileText size={32} aria-hidden="true" />
        </span>
        <div className="pilha-1">
          <strong className="tabular">{trabalho.codigo}.pdf</strong>
          <span className="apoio tabular">
            {arquivo.paginas} páginas · {arquivo.tamanho} · nomes dos autores removidos
          </span>
        </div>
        <Botao
          variante="secundario"
          tamanho="pequeno"
          icone={<Download size={18} aria-hidden="true" />}
          onClick={() =>
            mostrarToast({
              mensagem: (
                <>
                  Download simulado: <strong>{trabalho.codigo}.pdf</strong> (sem autoria).
                </>
              ),
            })
          }
        >
          Baixar PDF
        </Botao>
      </div>
      <dl className="pares">
        <div>
          <dt>Área</dt>
          <dd>{trabalho.area}</dd>
        </div>
        <div>
          <dt>Modalidade</dt>
          <dd>{trabalho.modalidade}</dd>
        </div>
      </dl>
      <div className="pilha-1">
        <h3 className="h4">Resumo</h3>
        <p className="corpo-apoio">{trabalho.resumo}</p>
      </div>
      {trabalho.palavrasChave.length ? (
        <ul className="linha-1" aria-label="Palavras-chave" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {trabalho.palavrasChave.map((p) => (
            <li key={p}>
              <Etiqueta>{p}</Etiqueta>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function ParecerLeitura({ parecer, evento }: { parecer: Parecer; evento: Evento }) {
  return (
    <section className={`card ${styles.leitura}`} aria-labelledby="titulo-parecer">
      <h2 id="titulo-parecer" className="h3">
        Seu parecer
      </h2>
      {parecer.concluidoEm ? (
        <p className="apoio tabular">
          Enviado em {data(parecer.concluidoEm)}, {hora(parecer.concluidoEm)} (BRT). Não é possível editar depois do
          envio.
        </p>
      ) : null}
      <dl className="pares">
        {CRITERIOS.map((c) => (
          <div key={c.id}>
            <dt>{c.rotulo}</dt>
            <dd className="forte">{parecer.notas?.[c.id] ?? "—"} de 5</dd>
          </div>
        ))}
        <div>
          <dt>Recomendação</dt>
          <dd className="forte">{rotuloRecomendacao(parecer.recomendacao)}</dd>
        </div>
      </dl>
      <div className="pilha-1">
        <h3 className="h4">Parecer aos autores</h3>
        <blockquote>{parecer.comentarioAutores}</blockquote>
      </div>
      {parecer.comentarioOrganizacao ? (
        <div className="pilha-1">
          <h3 className="h4">Comentário só para a comissão</h3>
          <blockquote>{parecer.comentarioOrganizacao}</blockquote>
        </div>
      ) : null}
      <div className={styles.acoes}>
        <Botao variante="secundario" href="/revisoes">
          Voltar para revisões
        </Botao>
        <CaixaPrazo evento={evento} />
      </div>
    </section>
  );
}

interface Erros {
  conflito?: string;
  notas?: string;
  recomendacao?: string;
  comentarioAutores?: string;
}

function agoraBrt() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return { iso: `${HOJE_REVISAO}T${hh}:${mm}:00-03:00`, hora: `${hh}:${mm}` };
}

function FormularioParecer({ parecer, trabalho, evento }: { parecer: Parecer; trabalho: Trabalho; evento: Evento }) {
  const router = useRouter();
  const mostrarToast = useToast();
  const { estado, despachar, usuario } = useEstado();
  const inscrito = Boolean(inscricaoNoEvento(estado, usuario?.id, evento.slug));

  const [conflito, setConflito] = useState<"nao" | "sim" | "">(parecer.situacao === "rascunho" ? "nao" : "");
  const [notas, setNotas] = useState<Partial<Record<Criterio, number>>>(parecer.notas ?? {});
  const [recomendacao, setRecomendacao] = useState<Recomendacao | "">(parecer.recomendacao ?? "");
  const [comentarioAutores, setComentarioAutores] = useState(parecer.comentarioAutores ?? "");
  const [comentarioOrganizacao, setComentarioOrganizacao] = useState(parecer.comentarioOrganizacao ?? "");
  const [erros, setErros] = useState<Erros>({});
  const [confirmar, setConfirmar] = useState<"enviar" | "conflito" | null>(null);
  const resumoErros = useRef<HTMLDivElement>(null);

  const temConflito = conflito === "sim";

  function montar(situacao: Parecer["situacao"], concluidoEm?: string): Parecer {
    return {
      ...parecer,
      situacao,
      notas,
      recomendacao: recomendacao || undefined,
      comentarioAutores: comentarioAutores.trim() || undefined,
      comentarioOrganizacao: comentarioOrganizacao.trim() || undefined,
      concluidoEm,
    };
  }

  function validar(): Erros {
    const e: Erros = {};
    if (!conflito) e.conflito = "Informe se você tem conflito de interesse com este trabalho.";
    if (temConflito) return e;
    const faltam = CRITERIOS.filter((c) => !notas[c.id]).map((c) => c.rotulo.toLowerCase());
    if (faltam.length) e.notas = `Dê uma nota de 1 a 5 para ${faltam.join(", ")}.`;
    if (!recomendacao) e.recomendacao = "Escolha uma recomendação: aprovar, aprovar com ajustes ou não aprovar.";
    if (comentarioAutores.trim().length < 20)
      e.comentarioAutores = "Escreva o parecer aos autores (mínimo 20 caracteres). Ex.: o que manter e o que ajustar.";
    return e;
  }

  function aoEnviar(ev: FormEvent) {
    ev.preventDefault();
    const e = validar();
    setErros(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => resumoErros.current?.focus());
      return;
    }
    setConfirmar(temConflito ? "conflito" : "enviar");
  }

  function salvarRascunho() {
    const { hora: h } = agoraBrt();
    despachar({ tipo: "salvarParecer", parecer: montar("rascunho") });
    mostrarToast({
      mensagem: (
        <>
          Rascunho salvo às {h}. Parecer de <strong>{trabalho.codigo}</strong>.
        </>
      ),
      acao: { rotulo: "Continuar", href: `/revisoes/${trabalho.codigo}` },
    });
    router.push("/revisoes");
  }

  function enviar() {
    setConfirmar(null);
    const { iso } = agoraBrt();
    despachar({ tipo: "salvarParecer", parecer: montar("concluido", iso) });
    mostrarToast({
      mensagem: (
        <>
          Parecer enviado. Trabalho <strong>{trabalho.codigo}</strong>.
        </>
      ),
      acao: { rotulo: "Ver parecer", href: `/revisoes/${trabalho.codigo}` },
    });
    router.push("/revisoes");
  }

  function declararConflito() {
    setConfirmar(null);
    despachar({ tipo: "salvarParecer", parecer: { ...parecer, conflito: true, comentarioOrganizacao: comentarioOrganizacao.trim() || undefined } });
    const posicao = trabalho.revisores.indexOf(parecer.revisorId);
    if (posicao === 0 || posicao === 1) {
      despachar({ tipo: "atribuirRevisor", codigo: trabalho.codigo, posicao, revisorId: null });
    }
    if (evento.organizadorId) {
      despachar({
        tipo: "adicionarNotificacao",
        notificacao: {
          id: `n-${evento.organizadorId}-conflito-${trabalho.codigo}-${parecer.revisorId}`,
          pessoaId: evento.organizadorId,
          tipo: "parecer",
          titulo: "Conflito de interesse declarado",
          descricao: `${pessoa(parecer.revisorId)?.nome ?? "Um revisor"} não pode avaliar ${trabalho.codigo}. Indique outro revisor.`,
          quando: "agora",
          acao: { rotulo: "Distribuir", href: `/organizacao/${evento.slug}/trabalhos` },
          lida: false,
        },
      });
    }
    mostrarToast({
      mensagem: (
        <>
          Conflito declarado. <strong>{trabalho.codigo}</strong> voltou para a organização.
        </>
      ),
    });
    router.push("/revisoes");
  }

  const listaErros = Object.values(erros).filter(Boolean) as string[];

  return (
    <form className={`card ${styles.formulario}`} onSubmit={aoEnviar} noValidate aria-labelledby="titulo-form">
      <h2 id="titulo-form" className="sr-only">
        Registrar parecer
      </h2>
      <CaixaPrazo evento={evento} />

      {listaErros.length ? (
        <div ref={resumoErros} tabIndex={-1}>
          <Aviso tom="erro">
            <strong>Faltam {listaErros.length === 1 ? "1 item" : `${listaErros.length} itens`} para enviar:</strong>
            <ul style={{ margin: "4px 0 0", paddingLeft: 20 }}>
              {listaErros.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </Aviso>
        </div>
      ) : null}

      <Grupo legenda="Conflito de interesse" obrigatorio erro={erros.conflito} caixa>
        <div className={styles.opcoes}>
          <Opcao nome="conflito" valor="nao" atual={conflito} aoMudar={() => setConflito("nao")}>
            Não tenho conflito com este trabalho
          </Opcao>
          <Opcao nome="conflito" valor="sim" atual={conflito} aoMudar={() => setConflito("sim")}>
            Tenho conflito (o trabalho volta para a organização)
          </Opcao>
        </div>
      </Grupo>

      {temConflito ? (
        <>
          <Aviso tom="pessego">
            <strong>Você não vai avaliar este trabalho.</strong> A organização indica outro revisor; suas notas não são
            registradas.
          </Aviso>
          <Campo
            rotulo="Comentário só para a comissão"
            multilinha
            placeholder="Opcional. Ex.: sou coorientador de um dos autores."
            value={comentarioOrganizacao}
            onChange={(e) => setComentarioOrganizacao(e.target.value)}
          />
        </>
      ) : (
        <>
          <Grupo legenda="Notas" obrigatorio erro={erros.notas} ajuda="1 = fraco · 5 = excelente">
            <div className={styles.notas}>
              {CRITERIOS.map((c) => (
                <fieldset key={c.id} className={styles.grupo}>
                  <legend>{c.rotulo}</legend>
                  <div className={styles.escala}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <label key={n} className={styles.nota}>
                        <input
                          type="radio"
                          name={`nota-${c.id}`}
                          value={n}
                          checked={notas[c.id] === n}
                          onChange={() => setNotas((atual) => ({ ...atual, [c.id]: n }))}
                          aria-label={`${c.rotulo}: nota ${n} de 5`}
                        />
                        <span aria-hidden="true">{n}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </Grupo>

          <Grupo
            legenda="Recomendação"
            obrigatorio
            erro={erros.recomendacao}
            ajuda="Sua recomendação é uma das entradas da comissão; não é o resultado final."
          >
            <div className={styles.opcoesLinha}>
              {RECOMENDACOES.map((r) => (
                <Opcao key={r.id} nome="recomendacao" valor={r.id} atual={recomendacao} aoMudar={() => setRecomendacao(r.id)}>
                  {r.rotulo}
                </Opcao>
              ))}
            </div>
          </Grupo>

          <Campo
            rotulo="Parecer aos autores"
            obrigatorio
            multilinha
            placeholder="O que o trabalho faz bem e o que precisa mudar. Os autores leem este texto sem saber quem você é."
            value={comentarioAutores}
            onChange={(e) => setComentarioAutores(e.target.value)}
            erro={erros.comentarioAutores}
          />
          <Campo
            rotulo="Comentário só para a comissão"
            multilinha
            placeholder="Opcional"
            ajuda="Os autores não veem este comentário."
            value={comentarioOrganizacao}
            onChange={(e) => setComentarioOrganizacao(e.target.value)}
          />
        </>
      )}

      <div className={styles.acoes}>
        {temConflito ? (
          <Botao type="submit">Declarar conflito</Botao>
        ) : inscrito ? (
          <Botao type="submit">Enviar parecer</Botao>
        ) : (
          <BotaoBloqueado
            id="enviar-parecer"
            explicacao={
              <>
                Faça sua inscrição no evento para enviar pareceres.{" "}
                <Link href={`/eventos/${evento.slug}/inscricao?retorno=/revisoes/${trabalho.codigo}`}>Inscrever-se</Link>
              </>
            }
          >
            Enviar parecer
          </BotaoBloqueado>
        )}
        {!temConflito ? (
          <Botao variante="secundario" onClick={salvarRascunho}>
            Salvar rascunho
          </Botao>
        ) : null}
      </div>

      <Confirmacao
        aberto={confirmar === "enviar"}
        titulo="Enviar o parecer?"
        rotuloConfirmar="Enviar parecer"
        aoConfirmar={enviar}
        aoCancelar={() => setConfirmar(null)}
      >
        <p>
          Recomendação: <strong>{rotuloRecomendacao(recomendacao || undefined)}</strong> · notas{" "}
          <span className="tabular">{CRITERIOS.map((c) => notas[c.id]).join(", ")}</span>.
        </p>
        <p>Depois de enviado, o parecer não pode ser editado.</p>
      </Confirmacao>
      <Confirmacao
        aberto={confirmar === "conflito"}
        titulo="Declarar conflito de interesse?"
        rotuloConfirmar="Declarar conflito"
        aoConfirmar={declararConflito}
        aoCancelar={() => setConfirmar(null)}
      >
        <p>{trabalho.codigo} sai da sua fila e volta para a organização, que indica outro revisor.</p>
      </Confirmacao>
    </form>
  );
}

function Grupo({
  legenda,
  obrigatorio,
  erro,
  ajuda,
  caixa,
  children,
}: {
  legenda: string;
  obrigatorio?: boolean;
  erro?: string;
  ajuda?: string;
  caixa?: boolean;
  children: ReactNode;
}) {
  return (
    <fieldset
      className={`${styles.grupo} ${caixa ? styles.grupoCaixa : ""} ${erro && caixa ? styles.grupoInvalido : ""}`}
      aria-invalid={erro ? true : undefined}
    >
      <legend>
        {legenda}
        {obrigatorio ? (
          <>
            {" "}
            <span className={styles.obrigatorio} aria-hidden="true">
              *
            </span>
            <span className="sr-only">(obrigatório)</span>
          </>
        ) : null}
      </legend>
      {children}
      {erro ? (
        <p className="campo-erro">
          <XCircle size={16} aria-hidden="true" />
          {erro}
        </p>
      ) : ajuda ? (
        <p className="campo-ajuda">{ajuda}</p>
      ) : null}
    </fieldset>
  );
}

function Opcao({
  nome,
  valor,
  atual,
  aoMudar,
  children,
}: {
  nome: string;
  valor: string;
  atual: string;
  aoMudar: () => void;
  children: ReactNode;
}) {
  return (
    <label className={styles.opcao}>
      <input type="radio" name={nome} value={valor} checked={atual === valor} onChange={aoMudar} />
      <span>{children}</span>
    </label>
  );
}
