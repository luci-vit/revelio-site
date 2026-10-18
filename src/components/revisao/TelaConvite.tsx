"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { CabecalhoPagina, Trilha } from "@/components/Basicos";
import { Botao } from "@/components/Botao";
import { Aviso, Estado } from "@/components/Estado";
import { useToast } from "@/components/Toast";
import { useEstado } from "@/data/estado";
import { pessoa } from "@/data/pessoas";
import { eventoPorSlug, inscricaoNoEvento } from "@/data/selectors";
import type { ConviteRevisao } from "@/data/tipos";
import { prazo } from "@/lib/formato";
import { Confirmacao } from "./Confirmacao";
import styles from "./Revisao.module.css";

const TRILHA = [{ rotulo: "Notificações" }, { rotulo: "Convite" }];

/** D1 — Convite para o comitê científico. */
export function TelaConvite() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const mostrarToast = useToast();
  const { estado, despachar, usuario } = useEstado();
  const [confirmarRecusa, setConfirmarRecusa] = useState(false);

  const convite = estado.convites.find((c) => c.id === id);
  const evento = convite ? eventoPorSlug(estado, convite.eventoSlug) : undefined;

  if (!convite || !evento) {
    return (
      <Moldura>
        <Aviso tom="erro" acao={<Botao variante="secundario" tamanho="pequeno" href="/eventos">Ver eventos</Botao>}>
          <strong>Convite não encontrado.</strong> Confira o link recebido na notificação ou no e-mail.
        </Aviso>
      </Moldura>
    );
  }

  const convidada = pessoa(convite.pessoaId);
  if (!usuario || usuario.id !== convite.pessoaId) {
    return (
      <Moldura>
        <Aviso tom="info">
          <strong>Este convite foi enviado para outra conta.</strong> Só {convidada?.nome ?? "a pessoa convidada"} pode
          responder. Na demonstração, escolha o papel <strong>Revisor</strong> no seletor do canto inferior direito.
        </Aviso>
      </Moldura>
    );
  }

  const organizadora = pessoa(convite.convidadoPorId);
  const inscricao = inscricaoNoEvento(estado, usuario.id, evento.slug);
  const hrefInscricao = `/eventos/${evento.slug}/inscricao?retorno=/revisoes`;

  function avisarOrganizacao(c: ConviteRevisao, resposta: "aceito" | "recusado") {
    // Marca como lida a notificação do convite e avisa quem convidou.
    for (const n of estado.notificacoes) {
      if (n.pessoaId === usuario!.id && n.acao?.href === `/convites/${c.id}` && !n.lida) {
        despachar({ tipo: "marcarLida", notificacaoId: n.id });
      }
    }
    despachar({
      tipo: "adicionarNotificacao",
      notificacao: {
        id: `n-${c.convidadoPorId}-resposta-${c.id}`,
        pessoaId: c.convidadoPorId,
        tipo: "convite",
        titulo: resposta === "aceito" ? "Convite aceito" : "Convite recusado",
        descricao: `${usuario!.nome} ${resposta === "aceito" ? "aceitou" : "recusou"} o convite para o comitê científico (${c.area}).`,
        quando: "agora",
        acao: { rotulo: "Ver comitê", href: `/organizacao/${c.eventoSlug}/comite` },
        lida: false,
      },
    });
  }

  function aceitar() {
    despachar({ tipo: "responderConvite", conviteId: convite!.id, resposta: "aceito" });
    avisarOrganizacao(convite!, "aceito");
    if (!inscricao) {
      mostrarToast({ mensagem: <>Convite aceito. Agora conclua sua inscrição no <strong>{evento!.sigla}</strong>.</> });
      router.push(hrefInscricao);
    } else {
      mostrarToast({
        mensagem: <>Convite aceito. <strong>Revisões</strong> já aparece no seu menu.</>,
        acao: { rotulo: "Abrir revisões", href: "/revisoes" },
      });
    }
  }

  function recusar() {
    setConfirmarRecusa(false);
    despachar({ tipo: "responderConvite", conviteId: convite!.id, resposta: "recusado" });
    avisarOrganizacao(convite!, "recusado");
    mostrarToast({ mensagem: <>Convite recusado. A organização foi avisada.</> });
  }

  return (
    <Moldura
      lateral={
        <aside className="card pilha-1" aria-labelledby="por-que-convite">
          <h2 id="por-que-convite" className="h4">
            Por que convite?
          </h2>
          <p className="corpo-apoio">
            O comitê é formado pela organização. Não existe cadastro como revisor: o papel aparece no seu menu só depois
            do aceite, e só para este evento.
          </p>
        </aside>
      }
    >
      <p className={styles.texto}>
        <strong>{organizadora?.nome ?? evento.organizacao}</strong>, da organização do <strong>{evento.nome}</strong>,
        convidou você para o comitê científico na área <strong>{convite.area}</strong>.
      </p>

      <dl className={`pares card-suave ${styles.pares}`}>
        <div>
          <dt>Trabalhos previstos</dt>
          <dd className="forte">até {convite.trabalhosPrevistos}</dd>
        </div>
        {evento.prazos.submissoes ? (
          <div>
            <dt>Distribuição</dt>
            <dd>após {prazo(evento.prazos.submissoes)}</dd>
          </div>
        ) : null}
        {evento.prazos.revisao ? (
          <div>
            <dt>Prazo dos pareceres</dt>
            <dd className="forte">{prazo(evento.prazos.revisao)}</dd>
          </div>
        ) : null}
      </dl>

      {convite.situacao === "pendente" ? (
        <>
          {inscricao ? (
            <Aviso tom="info">
              <strong>Você já está inscrito no evento</strong> (ingresso <span className="tabular">{inscricao.ingresso}</span>).
              Ao aceitar, a fila de revisões aparece no seu menu.
            </Aviso>
          ) : (
            <Aviso tom="pessego">
              <strong>Revisores precisam estar inscritos no evento.</strong> Você ainda não está: ao aceitar, abriremos a
              inscrição e você volta para cá em seguida.
            </Aviso>
          )}
          <div className={styles.acoes}>
            <Botao onClick={aceitar}>{inscricao ? "Aceitar convite" : "Aceitar e fazer inscrição"}</Botao>
            <Botao variante="destrutivo" onClick={() => setConfirmarRecusa(true)}>
              Recusar convite
            </Botao>
          </div>
        </>
      ) : convite.situacao === "aceito" ? (
        <>
          <div>
            <Estado tom="sucesso" grande>
              Convite aceito
            </Estado>
          </div>
          {inscricao ? (
            <>
              <p className="corpo-apoio">
                Você está inscrito (ingresso <span className="tabular forte">{inscricao.ingresso}</span>). Os trabalhos da
                área {convite.area} aparecem na sua fila depois da distribuição.
              </p>
              <div className={styles.acoes}>
                <Botao href="/revisoes">Abrir fila de revisões</Botao>
              </div>
            </>
          ) : (
            <>
              <Aviso tom="pessego">
                <strong>Falta a sua inscrição.</strong> Revisores precisam estar inscritos no evento para registrar
                pareceres.
              </Aviso>
              <div className={styles.acoes}>
                <Botao href={hrefInscricao}>Fazer inscrição</Botao>
                <Botao variante="secundario" href="/revisoes">
                  Abrir fila de revisões
                </Botao>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div>
            <Estado tom="erro" grande>
              Convite recusado
            </Estado>
          </div>
          <p className="corpo-apoio">
            A organização foi avisada e pode convidar outra pessoa. Se mudar de ideia, escreva para{" "}
            {organizadora ? <a href={`mailto:${organizadora.email}`}>{organizadora.email}</a> : "a organização"}.
          </p>
          <div className={styles.acoes}>
            <Botao variante="secundario" href={`/eventos/${evento.slug}`}>
              Ver página do evento
            </Botao>
          </div>
        </>
      )}

      <Confirmacao
        aberto={confirmarRecusa}
        titulo="Recusar o convite?"
        rotuloConfirmar="Recusar convite"
        variante="destrutivo"
        aoConfirmar={recusar}
        aoCancelar={() => setConfirmarRecusa(false)}
      >
        <p>
          A organização do {evento.nomeCurto} será avisada e poderá convidar outra pessoa para a área {convite.area}.
        </p>
      </Confirmacao>
    </Moldura>
  );
}

function Moldura({ children, lateral }: { children: ReactNode; lateral?: ReactNode }) {
  return (
    <div className="container pagina">
      <div className="com-lateral">
        <div className="pilha-3">
          <CabecalhoPagina antes={<Trilha itens={TRILHA} />} titulo="Convite para revisar" />
          <div className="pilha">{children}</div>
        </div>
        {lateral ? <div className={styles.lateral}>{lateral}</div> : null}
      </div>
    </div>
  );
}
