"use client";

import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Trilha } from "@/components/Basicos";
import { Botao, BotaoBloqueado } from "@/components/Botao";
import { Aviso } from "@/components/Estado";
import { Etapas, etapasAte } from "@/components/Etapas";
import { useToast } from "@/components/Toast";
import { useEstado } from "@/data/estado";
import { eventoPorSlug, inscricaoNoEvento, proximoCodigo, trabalhoPorCodigo } from "@/data/selectors";
import type { Autor, EtapaSubmissao, Evento, Pessoa, Trabalho } from "@/data/tipos";
import { prazo } from "@/lib/formato";
import { EtapaArquivo } from "./EtapaArquivo";
import { EtapaAutores } from "./EtapaAutores";
import { EtapaConferir } from "./EtapaConferir";
import { EtapaDados } from "./EtapaDados";
import { ETAPAS, horaAgora, indiceEtapa, limitePaginas, modalidadesDoEvento, pendencias, validarDados } from "./util";
import styles from "./submissao.module.css";

function novoTrabalho(evento: Evento, usuario: Pessoa, codigo: string): Trabalho {
  const responsavel: Autor = {
    nome: usuario.nome,
    email: usuario.email,
    instituicao: usuario.instituicao,
    temConta: true,
    inscrito: true,
    pessoaId: usuario.id,
    apresentador: true,
  };
  return {
    codigo,
    eventoSlug: evento.slug,
    titulo: "",
    resumo: "",
    palavrasChave: [],
    area: "",
    modalidade: modalidadesDoEvento(evento)[0],
    autores: [responsavel],
    responsavelId: usuario.id,
    situacao: "rascunho",
    etapa: "dados",
    revisores: [null, null],
  };
}

function Bloqueio({ evento, children }: { evento: Evento; children: React.ReactNode }) {
  return (
    <div className="container pagina">
      <div className={`pilha-3 ${styles.bloqueio}`}>
        <Trilha
          itens={[
            { rotulo: evento.nome, href: `/eventos/${evento.slug}?aba=chamada` },
            { rotulo: "Novo trabalho" },
          ]}
        />
        <h1 className="h2">Enviar trabalho</h1>
        {children}
      </div>
    </div>
  );
}

/** Fluxo de submissão em 4 etapas (C2 autores, C3 conferir e enviar). */
export function Submissao() {
  const { slug } = useParams<{ slug: string }>();
  const busca = useSearchParams();
  const router = useRouter();
  const mostrarToast = useToast();
  const { estado, despachar, usuario } = useEstado();
  const [mostrarErros, setMostrarErros] = useState(false);
  const [semNomesLocal, setSemNomes] = useState<boolean | null>(null);

  const evento = eventoPorSlug(estado, slug);
  if (!evento) {
    return (
      <div className="container pagina">
        <Aviso tom="erro" acao={<Link href="/eventos">Ver eventos</Link>}>
          Evento não encontrado.
        </Aviso>
      </div>
    );
  }

  const linkChamada = `/eventos/${evento.slug}?aba=chamada`;
  const linkInscricao = `/eventos/${evento.slug}/inscricao`;

  if (!usuario) {
    return (
      <Bloqueio evento={evento}>
        <BotaoBloqueado
          id="bloqueio-visitante"
          explicacao={
            <>
              Entre na sua conta e faça a inscrição no evento para enviar trabalhos.{" "}
              <Link href="/criar-conta">Criar conta</Link>
            </>
          }
        >
          Enviar trabalho
        </BotaoBloqueado>
      </Bloqueio>
    );
  }

  if (!inscricaoNoEvento(estado, usuario.id, evento.slug)) {
    return (
      <Bloqueio evento={evento}>
        <BotaoBloqueado
          id="bloqueio-inscricao"
          explicacao={
            <>
              Faça sua inscrição no evento para enviar trabalhos. <Link href={linkInscricao}>Inscrever-se</Link>
            </>
          }
        >
          Enviar trabalho
        </BotaoBloqueado>
      </Bloqueio>
    );
  }

  if (evento.situacaoSubmissoes !== "aberta") {
    const emBreve = evento.situacaoSubmissoes === "em-breve";
    return (
      <Bloqueio evento={evento}>
        <Aviso tom="neutro" icone={<Lock size={18} aria-hidden="true" />} acao={<Link href={linkChamada}>Ver chamada</Link>}>
          {emBreve && evento.prazos.submissoesAbrem
            ? `Submissões em breve: abrem em ${prazo(evento.prazos.submissoesAbrem)}.`
            : `Submissões encerradas${evento.prazos.submissoes ? ` em ${prazo(evento.prazos.submissoes)}` : ""}.`}
        </Aviso>
      </Bloqueio>
    );
  }

  // Qual rascunho editar: ?codigo=, senão o rascunho da pessoa no evento, senão um novo.
  const codigoUrl = busca.get("codigo");
  const doUsuario = (t: Trabalho) => t.eventoSlug === evento.slug && t.responsavelId === usuario.id;
  const existente = codigoUrl
    ? trabalhoPorCodigo(estado, codigoUrl)
    : estado.trabalhos.find((t) => doUsuario(t) && t.situacao === "rascunho");

  if (codigoUrl && (!existente || !doUsuario(existente))) {
    return (
      <Bloqueio evento={evento}>
        <Aviso tom="erro" acao={<Link href="/meus-trabalhos">Meus trabalhos</Link>}>
          Não encontramos o rascunho {codigoUrl} entre os seus trabalhos neste evento.
        </Aviso>
      </Bloqueio>
    );
  }

  if (existente && existente.situacao !== "rascunho") {
    return (
      <Bloqueio evento={evento}>
        <Aviso tom="sucesso" acao={<Link href={`/meus-trabalhos/${existente.codigo}`}>Ver trabalho</Link>}>
          O trabalho {existente.codigo} já foi enviado.
        </Aviso>
      </Bloqueio>
    );
  }

  const trabalho =
    existente ??
    novoTrabalho(
      evento,
      usuario,
      proximoCodigo(
        estado.trabalhos.map((t) => t.codigo),
        evento.sigla,
      ),
    );

  const etapa: EtapaSubmissao = trabalho.etapa ?? "dados";
  const indice = indiceEtapa(etapa);
  const semNomes = semNomesLocal ?? Boolean(trabalho.arquivo);
  const prazoSubmissao = evento.prazos.submissoes ? prazo(evento.prazos.submissoes) : null;

  function salvar(parcial: Partial<Trabalho>) {
    despachar({ tipo: "salvarTrabalho", trabalho: { ...trabalho, ...parcial } });
  }

  function irPara(nova: EtapaSubmissao) {
    setMostrarErros(false);
    salvar({ etapa: nova });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function etapaValida() {
    if (etapa === "dados") return Object.keys(validarDados(trabalho)).length === 0;
    if (etapa === "autores") return trabalho.autores.length > 0;
    if (etapa === "arquivo")
      return Boolean(trabalho.arquivo) && trabalho.arquivo!.paginas <= limitePaginas(evento!, trabalho.modalidade) && semNomes;
    return true;
  }

  function continuar() {
    if (!etapaValida()) {
      setMostrarErros(true);
      return;
    }
    setMostrarErros(false);
    salvar({ etapa: ETAPAS[indice + 1].id, salvoEm: horaAgora() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function salvarRascunho() {
    const hora = horaAgora();
    salvar({ salvoEm: hora });
    mostrarToast({
      mensagem: (
        <>
          Rascunho salvo às <strong>{hora}</strong>. Número: <strong>{trabalho.codigo}</strong>.
        </>
      ),
      acao: { rotulo: "Meus trabalhos", href: "/meus-trabalhos" },
    });
  }

  const faltando = pendencias(trabalho, evento);
  if (etapa === "conferir" && !semNomes && trabalho.arquivo)
    faltando.push({ texto: "Confirme que o arquivo não tem os nomes dos autores.", etapa: "arquivo" });

  function enviar() {
    if (faltando.length) return;
    despachar({
      tipo: "salvarTrabalho",
      trabalho: { ...trabalho, arquivo: { ...trabalho.arquivo!, enviadoEm: new Date().toISOString() } },
    });
    despachar({ tipo: "enviarTrabalho", codigo: trabalho.codigo });
    const temCoautores = trabalho.autores.length > 1;
    mostrarToast({
      mensagem: (
        <>
          Trabalho enviado. Número da submissão: <strong>{trabalho.codigo}</strong>.
          {temCoautores ? " Os coautores foram avisados por e-mail." : ""}
        </>
      ),
    });
    router.push(`/meus-trabalhos?enviado=${encodeURIComponent(trabalho.codigo)}`);
  }

  const lateral =
    etapa === "conferir" ? (
      <aside className={`card-destaque ${styles.envio}`} aria-labelledby="titulo-envio">
        <h2 id="titulo-envio">Envio</h2>
        {prazoSubmissao ? (
          <p>
            Você poderá editar este trabalho até <strong className="tabular">{prazoSubmissao}</strong>. Depois disso, ele
            segue para revisão.
          </p>
        ) : null}
        {faltando.length ? (
          <>
            <Aviso tom="atencao">
              Falta pouco para enviar:
              <ul className={styles.pendencias}>
                {faltando.map((f) => (
                  <li key={f.texto}>
                    {f.texto}{" "}
                    <button type="button" className={styles.botaoTexto} onClick={() => irPara(f.etapa)}>
                      Corrigir
                    </button>
                  </li>
                ))}
              </ul>
            </Aviso>
            <BotaoBloqueado id="bloqueio-envio" explicacao="Resolva os itens acima para liberar o envio.">
              Enviar trabalho
            </BotaoBloqueado>
          </>
        ) : (
          <Botao onClick={enviar}>
            Enviar trabalho
          </Botao>
        )}
        <button type="button" className={styles.botaoTexto} onClick={() => irPara("arquivo")}>
          Voltar para o arquivo
        </button>
      </aside>
    ) : etapa === "autores" ? (
      <aside className="dica">
        Se o coautor já tiver conta, nome e instituição são preenchidos pelo e-mail. Nenhum coautor precisa estar inscrito.
      </aside>
    ) : etapa === "arquivo" ? (
      <aside className="dica">
        A revisão é cega: os revisores não veem os nomes dos autores. Você pode trocar o arquivo até{" "}
        {prazoSubmissao ? <strong className="tabular">{prazoSubmissao}</strong> : "o fim das submissões"}.
      </aside>
    ) : (
      <aside className="dica">
        {evento.formatosAceitos} O rascunho fica salvo em Meus trabalhos e pode ser retomado depois.
        {prazoSubmissao ? (
          <>
            {" "}
            Submissões até <strong className="tabular">{prazoSubmissao}</strong>.
          </>
        ) : null}
      </aside>
    );

  return (
    <div className="container pagina">
      <div className={styles.topo}>
        <div className={styles.trilhaLinha}>
          <Trilha
            itens={[
              { rotulo: evento.nome, href: linkChamada },
              { rotulo: "Novo trabalho" },
            ]}
          />
          <span className={styles.salvo} aria-live="polite">
            · {trabalho.salvoEm ? `Rascunho salvo às ${trabalho.salvoEm}` : "Rascunho ainda não salvo"}
          </span>
        </div>
        <Etapas
          rotulo="Etapas da submissão"
          etapas={etapasAte(
            ETAPAS.map((e) => e.rotulo),
            indice,
          )}
        />
      </div>

      <div className="com-lateral">
        <div>
          {etapa === "dados" ? (
            <EtapaDados key={trabalho.codigo} trabalho={trabalho} evento={evento} alterar={salvar} mostrarErros={mostrarErros} />
          ) : etapa === "autores" ? (
            <EtapaAutores trabalho={trabalho} alterar={salvar} />
          ) : etapa === "arquivo" ? (
            <EtapaArquivo
              trabalho={trabalho}
              evento={evento}
              alterar={salvar}
              semNomes={semNomes}
              definirSemNomes={setSemNomes}
              mostrarErros={mostrarErros}
            />
          ) : (
            <EtapaConferir trabalho={trabalho} irPara={irPara} semNomes={semNomes} />
          )}
          {mostrarErros && etapa === "autores" && trabalho.autores.length === 0 ? (
            <div style={{ marginTop: 16 }}>
              <Aviso tom="erro">Inclua ao menos um autor para continuar.</Aviso>
            </div>
          ) : null}
        </div>
        {lateral}
      </div>

      {etapa !== "conferir" ? (
        <div className={styles.rodape}>
          {indice === 0 ? (
            <Link href={linkChamada} className={styles.botaoTexto}>
              <ArrowLeft size={18} aria-hidden="true" />
              Voltar
            </Link>
          ) : (
            <button type="button" className={styles.botaoTexto} onClick={() => irPara(ETAPAS[indice - 1].id)}>
              Voltar
            </button>
          )}
          <div className={styles.rodapeAcoes}>
            <Botao variante="secundario" onClick={salvarRascunho}>
              Salvar rascunho
            </Botao>
            <Botao onClick={continuar}>Continuar</Botao>
          </div>
        </div>
      ) : null}
    </div>
  );
}
