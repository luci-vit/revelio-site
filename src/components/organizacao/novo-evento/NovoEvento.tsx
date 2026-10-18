"use client";

import { XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Trilha } from "@/components/Basicos";
import { Botao } from "@/components/Botao";
import { Campo, CampoSelecao } from "@/components/Campo";
import { Etapas, etapasAte } from "@/components/Etapas";
import { useToast } from "@/components/Toast";
import { hojeDoPapel } from "@/data/demo";
import { useEstado } from "@/data/estado";
import type { Evento, Formato, GrupoArea, SituacaoSubmissoes } from "@/data/tipos";
import { dinheiro, periodoExtenso, prazo } from "@/lib/formato";
import { AcessoOrganizacao } from "../comum/AcessoOrganizacao";
import styles from "./NovoEvento.module.css";
import {
  RASCUNHO_VAZIO,
  VALIDADORES,
  isoBrt,
  listaAreas,
  slugDe,
  type Erros,
  type Rascunho,
} from "./validacao";

const ETAPAS = ["Dados do evento", "Prazos", "Inscrição", "Chamada de trabalhos", "Publicar página"];

const TITULOS = [
  "Dados do evento",
  "Prazos do processo científico",
  "Inscrição",
  "Chamada de trabalhos",
  "Conferir e publicar",
];

const DICAS: ReactNode[] = [
  "O nome e a sigla aparecem no card da busca. A sigla também forma os códigos de ingressos e trabalhos (ex.: SBDA-0042).",
  "A distribuição de trabalhos só é liberada depois do fim das submissões, e a seleção só depois do fim da revisão.",
  "O card da busca mostra o menor valor como “a partir de”. Cupons de divulgador ficam com a organização depois da publicação.",
  "Revisores entram só por convite, na seção Comitê científico do painel, e precisam estar inscritos no evento.",
  "Depois de publicada, a página aparece na busca de eventos. Prazos sempre aparecem com dia, hora e fuso.",
];

const GRUPOS: GrupoArea[] = ["Ciência de Dados", "Computação", "Saúde", "Educação", "Ambiente"];
const FORMATOS: Formato[] = ["Presencial", "On-line", "Híbrido"];

const CAPA = "linear-gradient(135deg, #ff9a6b 0%, #ff5c8a 60%, #d9407a 100%)";
const CHAVE_RASCUNHO = "revelio-novo-evento";

/** Situação das submissões e fase do painel na data de hoje da demonstração. */
function situacaoNaData(r: Rascunho, hoje: string): { situacao: SituacaoSubmissoes; fase: Evento["fase"] } {
  const agora = `${hoje}T12:00`;
  if (agora < r.submissoesAbrem) return { situacao: "em-breve", fase: "inscricoes" };
  if (agora <= r.submissoes) return { situacao: "aberta", fase: "submissoes" };
  if (agora <= r.revisao) return { situacao: "encerrada", fase: "revisao" };
  return { situacao: "encerrada", fase: "selecao" };
}

export function NovoEvento() {
  const { estado, despachar, usuario, papel } = useEstado();
  const router = useRouter();
  const mostrar = useToast();
  const [r, setR] = useState<Rascunho>(RASCUNHO_VAZIO);
  const [etapa, setEtapa] = useState(0);
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [tentou, setTentou] = useState(false);
  const refTitulo = useRef<HTMLHeadingElement>(null);

  // Retoma o rascunho salvo nesta sessão do navegador.
  useEffect(() => {
    try {
      const bruto = sessionStorage.getItem(CHAVE_RASCUNHO);
      if (bruto) {
        const salvo = JSON.parse(bruto) as { r: Rascunho; etapa: number };
        // eslint-disable-next-line react-hooks/set-state-in-effect -- restauração única depois da hidratação
        setR({ ...RASCUNHO_VAZIO, ...salvo.r });
        setEtapa(salvo.etapa ?? 0);
      }
    } catch {
      // sem storage: começa vazio
    }
  }, []);

  const erros: Erros = VALIDADORES[etapa](r);
  const mostrarErro = (campo: string) => (tentou || tocados[campo] ? erros[campo] : undefined);

  function mudar<K extends keyof Rascunho>(campo: K, valor: Rascunho[K]) {
    setR((atual) => ({ ...atual, [campo]: valor }));
  }

  function tocar(campo: string) {
    setTocados((t) => ({ ...t, [campo]: true }));
  }

  /** Props comuns de um campo de texto ligado ao rascunho. */
  function ligar(campo: keyof Rascunho & string) {
    return {
      value: r[campo] as string,
      onChange: (e: { target: { value: string } }) => mudar(campo, e.target.value as never),
      onBlur: () => tocar(campo),
      erro: mostrarErro(campo),
    };
  }

  function guardar(proxEtapa = etapa) {
    try {
      sessionStorage.setItem(CHAVE_RASCUNHO, JSON.stringify({ r, etapa: proxEtapa }));
    } catch {
      // ignora
    }
  }

  function irPara(i: number) {
    setEtapa(i);
    setTentou(false);
    setTocados({});
    guardar(i);
    requestAnimationFrame(() => refTitulo.current?.focus());
  }

  function continuar() {
    if (Object.keys(erros).length > 0) {
      setTentou(true);
      requestAnimationFrame(() => {
        const primeiro = document.querySelector<HTMLElement>(`.${styles.formulario} [aria-invalid="true"]`);
        primeiro?.focus();
      });
      return;
    }
    irPara(etapa + 1);
  }

  function salvarRascunho() {
    guardar();
    const agora = new Date();
    const hhmm = `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;
    mostrar({ mensagem: <>Rascunho salvo às <strong className="tabular">{hhmm}</strong>. Você pode continuar depois.</> });
  }

  function publicar() {
    const sigla = r.sigla.trim().toUpperCase();
    const ano = r.dataInicio.slice(0, 4);
    const base = slugDe(`${sigla}-${ano}`) || slugDe(r.nome);
    let slug = base;
    for (let i = 2; estado.eventos.some((e) => e.slug === slug); i++) slug = `${base}-${i}`;
    const areas = listaAreas(r.areasTematicas);
    const { situacao, fase } = situacaoNaData(r, hojeDoPapel(papel));
    const vagas = Number(r.vagas);
    const online = r.formato === "On-line";

    const evento: Evento = {
      slug,
      sigla,
      nome: r.nome.trim(),
      nomeCurto: `${sigla} ${ano}`,
      tituloCapa: areas[0] ?? r.grupoArea,
      area: r.grupoArea || "Ciência de Dados",
      grupoArea: (r.grupoArea || "Ciência de Dados") as GrupoArea,
      formato: r.formato,
      dataInicio: r.dataInicio,
      dataFim: r.dataFim,
      local: online
        ? { online: true }
        : {
            cidade: r.cidade.trim(),
            uf: r.uf.trim().toUpperCase(),
            instituicao: r.instituicao.trim() || undefined,
            online: r.formato === "Híbrido",
          },
      organizacao: usuario ? `${usuario.nome} e equipe ${sigla}` : `Equipe ${sigla}`,
      organizadorId: usuario?.id ?? "marta",
      vagas,
      vagasDisponiveis: vagas,
      categorias: r.gratuito
        ? [{ id: "gratuita", nome: "Gratuita", preco: 0 }]
        : r.categorias
            .filter((c) => c.ativa)
            .map((c) => ({ id: c.id, nome: c.nome, preco: Number(c.preco.replace(",", ".")) })),
      prazos: {
        submissoesAbrem: isoBrt(r.submissoesAbrem),
        submissoes: isoBrt(r.submissoes),
        revisao: isoBrt(r.revisao),
        resultado: isoBrt(r.resultado),
      },
      situacaoSubmissoes: situacao,
      encerrado: false,
      descricao: r.descricao.trim() || `${r.nome.trim()}.`,
      publico: r.publico.trim(),
      formatosAceitos: r.formatosAceitos.trim(),
      areasTematicas: areas,
      programacao: [],
      capa: CAPA,
      fase,
    };

    despachar({ tipo: "salvarEvento", evento });
    try {
      sessionStorage.removeItem(CHAVE_RASCUNHO);
    } catch {
      // ignora
    }
    mostrar({
      mensagem: (
        <>
          Página publicada: <strong>{evento.nomeCurto}</strong>. Próximo passo: convidar o comitê científico.
        </>
      ),
      acao: { rotulo: "Ver página", href: `/eventos/${slug}` },
    });
    router.push(`/organizacao/${slug}`);
  }

  const etapasVisiveis = etapasAte(ETAPAS, etapa);

  return (
    <div className="container pagina">
      <div className={styles.topo}>
        <Trilha
          itens={[
            { rotulo: "Organização", href: "/organizacao/sbda-2027" },
            { rotulo: "Novo evento · Rascunho" },
          ]}
        />
        <Etapas etapas={etapasVisiveis} rotulo="Etapas da criação do evento" />
      </div>

      <div className={styles.corpo}>
        <form
          className={styles.formulario}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (etapa === ETAPAS.length - 1) publicar();
            else continuar();
          }}
          aria-labelledby="titulo-etapa"
        >
          <h1 id="titulo-etapa" ref={refTitulo} tabIndex={-1} className={`h3 ${styles.titulo}`}>
            {TITULOS[etapa]}
          </h1>

          {etapa === 0 ? (
            <div className={styles.grade}>
              <div className={styles.dois}>
                <Campo rotulo="Nome do evento" obrigatorio {...ligar("nome")} />
              </div>
              <Campo rotulo="Sigla" obrigatorio ajuda="Forma os códigos. Ex.: SBDA" maxLength={8} {...ligar("sigla")} />
              <CampoSelecao rotulo="Área" obrigatorio {...ligar("grupoArea")}>
                <option value="">Escolha a área</option>
                {GRUPOS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </CampoSelecao>
              <CampoSelecao rotulo="Formato" obrigatorio {...ligar("formato")}>
                {FORMATOS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </CampoSelecao>
              <span aria-hidden="true" className={styles.vazio} />
              <Campo rotulo="Primeiro dia" obrigatorio type="date" {...ligar("dataInicio")} />
              <Campo rotulo="Último dia" obrigatorio type="date" {...ligar("dataFim")} />
              <span aria-hidden="true" className={styles.vazio} />
              {r.formato !== "On-line" ? (
                <>
                  <Campo rotulo="Cidade" obrigatorio {...ligar("cidade")} />
                  <Campo rotulo="Estado (UF)" obrigatorio maxLength={2} {...ligar("uf")} />
                  <Campo rotulo="Instituição ou local" ajuda="Ex.: Instituto de Computação, UFBA" {...ligar("instituicao")} />
                </>
              ) : null}
              <div className={styles.tres}>
                <Campo rotulo="Descrição" multilinha ajuda="Aparece na aba Sobre da página do evento." {...ligar("descricao")} />
              </div>
            </div>
          ) : null}

          {etapa === 1 ? (
            <div className={styles.grade}>
              <Campo rotulo="Abertura das submissões" obrigatorio type="datetime-local" {...ligar("submissoesAbrem")} />
              <Campo rotulo="Fim das submissões" obrigatorio type="datetime-local" {...ligar("submissoes")} />
              <CampoSelecao rotulo="Fuso horário" obrigatorio value={r.fuso} onChange={() => mudar("fuso", "BRT")}>
                <option value="BRT">Brasília (BRT, UTC−3)</option>
              </CampoSelecao>
              <Campo rotulo="Fim da revisão" obrigatorio type="datetime-local" {...ligar("revisao")} />
              <Campo
                rotulo="Divulgação do resultado"
                obrigatorio
                type="date"
                ajuda="Até 23:59 (BRT) do dia escolhido."
                {...ligar("resultado")}
              />
              <Campo
                rotulo="Revisores por trabalho"
                obrigatorio
                type="number"
                inputMode="numeric"
                min={2}
                max={5}
                ajuda="Mínimo: 2."
                {...ligar("revisoresPorTrabalho")}
              />
              {r.dataInicio ? (
                <p className={`apoio ${styles.tres}`}>
                  O evento acontece de <span className="tabular">{periodoExtenso(r.dataInicio, r.dataFim || r.dataInicio)}</span>.
                  O resultado precisa sair antes disso.
                </p>
              ) : null}
            </div>
          ) : null}

          {etapa === 2 ? (
            <div className="pilha-3">
              <div className={styles.grade}>
                <Campo rotulo="Vagas" obrigatorio type="number" inputMode="numeric" min={1} {...ligar("vagas")} />
              </div>
              <label className={styles.opcao}>
                <input type="checkbox" checked={r.gratuito} onChange={(e) => mudar("gratuito", e.target.checked)} />
                <span>Evento gratuito (sem categorias pagas)</span>
              </label>
              {!r.gratuito ? (
                <fieldset className={styles.categorias}>
                  <legend className="rotulo">
                    Categorias e valores <span className={styles.obrigatorio}>*</span>
                  </legend>
                  {r.categorias.map((c, i) => (
                    <div key={c.id} className={styles.categoria}>
                      <label className={styles.opcao}>
                        <input
                          type="checkbox"
                          checked={c.ativa}
                          onChange={(e) =>
                            mudar(
                              "categorias",
                              r.categorias.map((x, j) => (j === i ? { ...x, ativa: e.target.checked } : x)),
                            )
                          }
                        />
                        <span>{c.nome}</span>
                      </label>
                      {c.ativa ? (
                        <Campo
                          rotulo={`Valor para ${c.nome} (R$)`}
                          obrigatorio
                          inputMode="decimal"
                          value={c.preco}
                          onChange={(e) =>
                            mudar(
                              "categorias",
                              r.categorias.map((x, j) => (j === i ? { ...x, preco: e.target.value } : x)),
                            )
                          }
                          onBlur={() => tocar(`preco-${c.id}`)}
                          erro={mostrarErro(`preco-${c.id}`)}
                        />
                      ) : null}
                    </div>
                  ))}
                  {tentou && erros.categorias ? (
                    <p className="campo-erro">
                      <XCircle size={16} aria-hidden="true" />
                      {erros.categorias}
                    </p>
                  ) : null}
                </fieldset>
              ) : null}
            </div>
          ) : null}

          {etapa === 3 ? (
            <div className="pilha-3">
              <Campo
                rotulo="Áreas temáticas"
                obrigatorio
                ajuda="Separe por vírgula. Ex.: Governo aberto, Transparência, Qualidade de dados"
                {...ligar("areasTematicas")}
              />
              <Campo rotulo="Formatos aceitos" obrigatorio {...ligar("formatosAceitos")} />
              <Campo rotulo="Público" {...ligar("publico")} />
            </div>
          ) : null}

          {etapa === 4 ? <Resumo r={r} aoEditar={irPara} /> : null}

          <hr className="divisor" />
          <div className={styles.rodape}>
            {etapa === 0 ? (
              <Link href="/organizacao/sbda-2027" className={styles.voltar}>
                Voltar
              </Link>
            ) : (
              <button type="button" className={styles.voltar} onClick={() => irPara(etapa - 1)}>
                Voltar
              </button>
            )}
            <div className="linha">
              <Botao variante="secundario" onClick={salvarRascunho}>
                Salvar rascunho
              </Botao>
              <Botao type="submit">{etapa === ETAPAS.length - 1 ? "Publicar página" : "Continuar"}</Botao>
            </div>
          </div>
        </form>

        <aside className={`dica ${styles.dica}`}>
          <p>{DICAS[etapa]}</p>
        </aside>
      </div>
    </div>
  );
}

function Resumo({ r, aoEditar }: { r: Rascunho; aoEditar: (etapa: number) => void }) {
  const local =
    r.formato === "On-line" ? "On-line" : [r.instituicao, r.cidade && `${r.cidade} (${r.uf.toUpperCase()})`].filter(Boolean).join(", ");
  const precos = r.gratuito
    ? "Gratuito"
    : r.categorias
        .filter((c) => c.ativa)
        .map((c) => `${c.nome} ${dinheiro(Number(c.preco.replace(",", ".")))}`)
        .join(" · ");
  const blocos: { titulo: string; etapa: number; itens: [string, ReactNode][] }[] = [
    {
      titulo: "Dados do evento",
      etapa: 0,
      itens: [
        ["Nome", `${r.nome} (${r.sigla.toUpperCase()})`],
        ["Datas", r.dataInicio ? periodoExtenso(r.dataInicio, r.dataFim) : "—"],
        ["Formato e local", `${r.formato}${local && r.formato !== "On-line" ? ` · ${local}` : ""}`],
        ["Área", r.grupoArea],
      ],
    },
    {
      titulo: "Prazos",
      etapa: 1,
      itens: [
        ["Abertura das submissões", prazo(isoBrt(r.submissoesAbrem))],
        ["Fim das submissões", prazo(isoBrt(r.submissoes))],
        ["Fim da revisão", prazo(isoBrt(r.revisao))],
        ["Divulgação do resultado", prazo(isoBrt(r.resultado))],
        ["Revisores por trabalho", r.revisoresPorTrabalho],
      ],
    },
    {
      titulo: "Inscrição",
      etapa: 2,
      itens: [
        ["Vagas", r.vagas],
        ["Categorias", precos],
      ],
    },
    {
      titulo: "Chamada de trabalhos",
      etapa: 3,
      itens: [
        ["Áreas temáticas", listaAreas(r.areasTematicas).join(", ")],
        ["Formatos aceitos", r.formatosAceitos],
      ],
    },
  ];
  return (
    <div className="pilha-3">
      {blocos.map((b) => (
        <section key={b.titulo} className="card-suave pilha-1" aria-label={b.titulo}>
          <div className="linha entre">
            <h2 className="h4">{b.titulo}</h2>
            <button type="button" className={styles.editar} onClick={() => aoEditar(b.etapa)}>
              Editar<span className="sr-only"> {b.titulo}</span>
            </button>
          </div>
          <dl className="pares">
            {b.itens.map(([rotulo, valor]) => (
              <div key={rotulo}>
                <dt>{rotulo}</dt>
                <dd>{valor}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

export function PaginaNovoEvento() {
  return (
    <AcessoOrganizacaoComContainer>
      <NovoEvento />
    </AcessoOrganizacaoComContainer>
  );
}

function AcessoOrganizacaoComContainer({ children }: { children: ReactNode }) {
  const { papel } = useEstado();
  if (papel === "organizador") return <>{children}</>;
  return (
    <div className="container pagina">
      <AcessoOrganizacao>{children}</AcessoOrganizacao>
    </div>
  );
}
