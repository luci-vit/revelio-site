"use client";

import { Download, Ticket } from "lucide-react";
import Link from "next/link";
import { CabecalhoPagina } from "@/components/Basicos";
import { Botao } from "@/components/Botao";
import { Aviso, Estado, IconesEstado } from "@/components/Estado";
import { useToast } from "@/components/Toast";
import { useEstado } from "@/data/estado";
import { eventoPorSlug, inscricoesDaPessoa } from "@/data/selectors";
import type { Evento, Inscricao } from "@/data/tipos";
import { periodoCurto } from "@/lib/formato";
import { doEvento } from "./apoio";
import styles from "./MinhasInscricoes.module.css";

export function MinhasInscricoes() {
  const { estado, usuario } = useEstado();
  const mostrar = useToast();

  const cabecalho = <CabecalhoPagina titulo="Minhas inscrições" descricao="Crachás e certificados de todos os seus eventos." />;

  if (!usuario) {
    return (
      <div className="container pagina pilha-3">
        {cabecalho}
        <div className={styles.estreito}>
          <Aviso
            tom="pessego"
            acao={
              <Botao href="/criar-conta" variante="primario">
                Criar conta
              </Botao>
            }
          >
            <strong>Entre na sua conta para ver suas inscrições.</strong> Ainda não tem conta? Crie uma, é grátis.
          </Aviso>
        </div>
      </div>
    );
  }

  const linhas = inscricoesDaPessoa(estado, usuario.id)
    .map((inscricao) => ({ inscricao, evento: eventoPorSlug(estado, inscricao.eventoSlug) }))
    .filter((l): l is { inscricao: Inscricao; evento: Evento } => Boolean(l.evento))
    .map((l) => ({ ...l, encerrado: l.inscricao.situacao === "encerrado" || l.evento.encerrado }))
    // Eventos por vir primeiro, depois os encerrados (ordem estável).
    .sort((a, b) => Number(a.encerrado) - Number(b.encerrado));

  function baixarCertificado(evento: Evento) {
    mostrar({
      mensagem: (
        <>
          Certificado {doEvento(evento.nome).split(" ")[0]} <strong>{evento.nome}</strong> baixado (simulação).
        </>
      ),
    });
  }

  return (
    <div className="container pagina pilha-3">
      {cabecalho}

      {linhas.length === 0 ? (
        <div className={styles.estreito}>
          <Aviso
            tom="info"
            acao={
              <Botao href="/eventos" variante="primario">
                Buscar eventos
              </Botao>
            }
          >
            <strong>Você ainda não se inscreveu em nenhum evento.</strong> Quando se inscrever, o crachá aparece aqui.
          </Aviso>
        </div>
      ) : (
        <div className="tabela-envoltorio">
          <table className={`tabela ${styles.tabela}`}>
            <caption className="sr-only">Suas inscrições em eventos</caption>
            <thead>
              <tr>
                <th scope="col">Evento</th>
                <th scope="col">Período</th>
                <th scope="col">Situação</th>
                <th scope="col">Ação</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map(({ inscricao, evento, encerrado }) => (
                <tr key={inscricao.id}>
                  <td className={styles.evento}>
                    <Link href={`/eventos/${evento.slug}`}>{evento.nome}</Link>
                    <span className="apoio tabular">Ingresso {inscricao.ingresso}</span>
                  </td>
                  <td className={styles.periodo}>{periodoCurto(evento.dataInicio, evento.dataFim)}</td>
                  <td>
                    {encerrado ? (
                      <Estado tom="neutro" icone={IconesEstado.calendario}>
                        Encerrado
                      </Estado>
                    ) : (
                      <Estado tom="sucesso">Inscrita</Estado>
                    )}
                  </td>
                  <td>
                    {encerrado ? (
                      inscricao.certificadoDisponivel ? (
                        <Botao
                          variante="secundario"
                          tamanho="pequeno"
                          icone={<Download size={18} aria-hidden="true" />}
                          onClick={() => baixarCertificado(evento)}
                          aria-label={`Baixar certificado ${doEvento(evento.nome)}`}
                        >
                          Baixar certificado
                        </Botao>
                      ) : (
                        <span className="apoio">Certificado ainda não emitido</span>
                      )
                    ) : (
                      <Botao
                        variante="secundario"
                        tamanho="pequeno"
                        href={`/eventos/${evento.slug}/inscricao/confirmada`}
                        icone={<Ticket size={18} aria-hidden="true" />}
                        aria-label={`Ver crachá ${doEvento(evento.nome)}`}
                      >
                        Ver crachá
                      </Botao>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="apoio">
        O certificado fica disponível ao fim do evento, se a sua presença for registrada no check-in.
      </p>
    </div>
  );
}
