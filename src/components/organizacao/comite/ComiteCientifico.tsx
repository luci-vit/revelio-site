"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { CabecalhoPagina } from "@/components/Basicos";
import { Botao } from "@/components/Botao";
import { Campo, CampoSelecao } from "@/components/Campo";
import { Estado as SeloEstado, IconesEstado } from "@/components/Estado";
import { useToast } from "@/components/Toast";
import { useEstado } from "@/data/estado";
import { PESSOAS, pessoa } from "@/data/pessoas";
import { convitesDoEvento, estaInscrito, eventoPorSlug } from "@/data/selectors";
import type { ConviteRevisao } from "@/data/tipos";
import { AcessoOrganizacao, EventoNaoEncontrado } from "../comum/AcessoOrganizacao";
import styles from "./ComiteCientifico.module.css";

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Trabalhos previstos por revisor quando o convite sai desta tela. */
const TRABALHOS_PREVISTOS = 4;

/** Id estável para quem ainda não tem conta: "convidado-joao-m-unb-br". */
function idPorEmail(email: string) {
  return `convidado-${email.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function SeloConvite({ convite, temConta }: { convite: ConviteRevisao; temConta: boolean }) {
  if (convite.situacao === "aceito") return <SeloEstado tom="sucesso">Aceito</SeloEstado>;
  if (convite.situacao === "recusado") return <SeloEstado tom="erro">Recusado</SeloEstado>;
  if (!temConta)
    return (
      <SeloEstado tom="neutro" icone={<Mail size={18} aria-hidden="true" />}>
        E-mail enviado
      </SeloEstado>
    );
  return (
    <SeloEstado tom="neutro" icone={IconesEstado.relogio}>
      Aguardando resposta
    </SeloEstado>
  );
}

export function ComiteCientifico({ slug }: { slug: string }) {
  const { estado, despachar, usuario } = useEstado();
  const mostrar = useToast();
  const evento = eventoPorSlug(estado, slug);
  const refEmail = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState("");
  const [area, setArea] = useState("");
  const [erros, setErros] = useState<{ email?: string; area?: string }>({});

  if (!evento) return <EventoNaoEncontrado slug={slug} />;

  const convites = convitesDoEvento(estado, slug);
  const areas = evento.areasTematicas;

  function focarEmail() {
    refEmail.current?.querySelector("input")?.focus();
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    const limpo = email.trim().toLowerCase();
    const novosErros: typeof erros = {};
    if (!limpo) novosErros.email = "Informe o e-mail da pessoa. Ex.: nome@instituicao.br";
    else if (!EMAIL_VALIDO.test(limpo)) novosErros.email = "Complete o e-mail. Ex.: joana.lima@ufpe.br";
    if (!area) novosErros.area = `Escolha a área do convite. Ex.: ${areas[0] ?? "Governo aberto"}`;

    const conhecida = PESSOAS.find((p) => p.email.toLowerCase() === limpo);
    const pessoaId = conhecida?.id ?? idPorEmail(limpo);
    const existente = convites.find((c) => c.pessoaId === pessoaId);
    if (!novosErros.email && existente) {
      const quem = conhecida?.nome ?? limpo;
      novosErros.email =
        existente.situacao === "recusado"
          ? `${quem} já recusou o convite deste evento. Convide outra pessoa.`
          : existente.situacao === "aceito"
            ? `${quem} já faz parte do comitê.`
            : `${quem} já foi convidada. Use “Reenviar” na lista abaixo.`;
    }
    if (!novosErros.email && conhecida && conhecida.id === evento!.organizadorId) {
      novosErros.email = "Quem organiza o evento não pode revisar trabalhos dele. Convide outra pessoa.";
    }

    setErros(novosErros);
    if (novosErros.email || novosErros.area) {
      if (novosErros.email) focarEmail();
      return;
    }

    const convite: ConviteRevisao = {
      id: `c-${pessoaId}-${slug}`,
      eventoSlug: slug,
      pessoaId,
      convidadoPorId: usuario?.id ?? "marta",
      area,
      trabalhosPrevistos: TRABALHOS_PREVISTOS,
      situacao: "pendente",
      enviadoEm: new Date().toISOString(),
      email: conhecida ? undefined : limpo,
    };
    despachar({ tipo: "convidarRevisor", convite });
    if (conhecida?.temConta) {
      despachar({
        tipo: "adicionarNotificacao",
        notificacao: {
          id: `n-${convite.id}-${convite.enviadoEm}`,
          pessoaId: conhecida.id,
          tipo: "convite",
          titulo: "Convite para revisar",
          descricao: `${evento!.nome} convidou você para o comitê científico.`,
          quando: "agora",
          acao: { rotulo: "Responder convite", href: `/convites/${convite.id}` },
          lida: false,
        },
      });
    }
    mostrar({
      mensagem: (
        <>
          Convite enviado para <strong>{conhecida?.nome ?? limpo}</strong>
          {conhecida ? "" : ". Fica guardado até o cadastro"}.
        </>
      ),
    });
    setEmail("");
    setArea("");
  }

  function reenviar(nome: string) {
    mostrar({ mensagem: <>Lembrete reenviado para <strong>{nome}</strong>.</> });
  }

  function cancelar(c: ConviteRevisao, nome: string) {
    despachar({ tipo: "cancelarConvite", conviteId: c.id });
    mostrar({ mensagem: <>Convite para <strong>{nome}</strong> cancelado.</> });
  }

  function convidarOutra(c: ConviteRevisao) {
    setArea(areas.includes(c.area) ? c.area : "");
    setEmail("");
    setErros({});
    refEmail.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    focarEmail();
  }

  return (
    <div className="pilha-3">
      <CabecalhoPagina
        titulo="Comitê científico"
        descricao="Revisores entram somente por convite. Quem aceita precisa estar inscrito no evento."
      />

      <form className={`card ${styles.formulario}`} onSubmit={enviar} noValidate aria-label="Convidar revisor">
        <div className={styles.campos}>
          <div ref={refEmail} className={styles.email}>
            <Campo
              rotulo="E-mail da pessoa convidada"
              obrigatorio
              type="email"
              autoComplete="off"
              placeholder="joana.lima@ufpe.br"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErros((x) => ({ ...x, email: undefined }));
              }}
              erro={erros.email}
            />
          </div>
          <div className={styles.area}>
            <CampoSelecao rotulo="Área" obrigatorio value={area} onChange={(e) => {
                setArea(e.target.value);
                setErros((x) => ({ ...x, area: undefined }));
              }}
              erro={erros.area}>
              <option value="">Escolha a área</option>
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </CampoSelecao>
          </div>
          <div className={styles.botao}>
            <Botao type="submit" icone={<Mail size={20} aria-hidden="true" />}>
              Enviar convite
            </Botao>
          </div>
        </div>
        <p className="apoio">Se a pessoa não tiver conta, o convite chega por e-mail e fica guardado até o cadastro.</p>
      </form>

      {convites.length === 0 ? (
        <div className="card-suave">
          <p className="corpo-apoio">Nenhum convite enviado ainda. Comece pelo formulário acima.</p>
        </div>
      ) : (
        <div className="tabela-envoltorio">
          <table className={`tabela ${styles.tabela}`}>
            <caption className="sr-only">Convites do comitê científico</caption>
            <thead>
              <tr>
                <th scope="col">Pessoa</th>
                <th scope="col">Área</th>
                <th scope="col">Convite</th>
                <th scope="col">Inscrição</th>
                <th scope="col">Ação</th>
              </tr>
            </thead>
            <tbody>
              {convites.map((c) => {
                const p = pessoa(c.pessoaId);
                const temConta = Boolean(p?.temConta);
                const nome = p?.nome ?? c.email ?? c.pessoaId;
                // Aceitar o convite inclui a inscrição no evento (D1); o seed não inscreve todos os revisores aceitos.
                const inscrito = c.situacao === "aceito" || estaInscrito(estado, c.pessoaId, slug);
                return (
                  <tr key={c.id}>
                    <td>
                      {p ? (
                        <>
                          <strong>{p.nome}</strong> · {p.instituicao}
                        </>
                      ) : (
                        <>
                          <strong>{c.email ?? c.pessoaId}</strong> (sem conta)
                        </>
                      )}
                    </td>
                    <td>{c.area}</td>
                    <td>
                      <SeloConvite convite={c} temConta={temConta} />
                    </td>
                    <td>{inscrito ? "Inscrito" : <span aria-label="Não inscrito">—</span>}</td>
                    <td>
                      {c.situacao === "aceito" ? (
                        <Link href={`/organizacao/${slug}/trabalhos`} className={styles.acao}>
                          Ver atribuições
                        </Link>
                      ) : c.situacao === "recusado" ? (
                        <button type="button" className={styles.acao} onClick={() => convidarOutra(c)}>
                          Convidar outra pessoa
                        </button>
                      ) : temConta ? (
                        <button type="button" className={styles.acao} onClick={() => reenviar(nome)}>
                          Reenviar<span className="sr-only"> convite para {nome}</span>
                        </button>
                      ) : (
                        <button type="button" className={styles.acao} onClick={() => cancelar(c, nome)}>
                          Cancelar convite<span className="sr-only"> de {nome}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function PaginaComite({ slug }: { slug: string }) {
  return (
    <AcessoOrganizacao>
      <ComiteCientifico slug={slug} />
    </AcessoOrganizacao>
  );
}
