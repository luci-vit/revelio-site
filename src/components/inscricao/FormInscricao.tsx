"use client";

import { ArrowLeft, CheckCircle2, Info, QrCode as IconeQr, Receipt, Ticket, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { Trilha } from "@/components/Basicos";
import { Botao } from "@/components/Botao";
import { Campo } from "@/components/Campo";
import { Aviso } from "@/components/Estado";
import { useEstado } from "@/data/estado";
import { cupom as buscarCupom } from "@/data/eventos";
import { eventoPorSlug, inscricaoNoEvento, proximoCodigo } from "@/data/selectors";
import type { Categoria, Cupom, Evento, Pessoa } from "@/data/tipos";
import { dinheiro, periodoCurto } from "@/lib/formato";
import { categoriaSugerida, localCurto, nomeInstituicao } from "./apoio";
import styles from "./FormInscricao.module.css";

type Modalidade = "Presencial" | "On-line";
type FormaPagamento = "pix" | "boleto";

const ROTULO_PAGAMENTO: Record<FormaPagamento, string> = {
  pix: "Pix (simulado)",
  boleto: "Boleto (simulado)",
};

export function FormInscricao() {
  const { slug } = useParams<{ slug: string }>();
  const { estado, usuario } = useEstado();
  const evento = eventoPorSlug(estado, slug);

  if (!evento) {
    return (
      <div className="container pagina pilha" style={{ maxWidth: 640 }}>
        <h1 className="h2">Evento não encontrado</h1>
        <p className="corpo-apoio">O endereço pode ter mudado ou o evento não existe mais.</p>
        <div>
          <Botao href="/eventos" variante="secundario">
            Ver eventos
          </Botao>
        </div>
      </div>
    );
  }

  const trilha = (
    <Trilha
      itens={[
        { rotulo: evento.nome, href: `/eventos/${evento.slug}` },
        { rotulo: "Inscrição" },
      ]}
    />
  );

  if (!usuario) {
    return (
      <div className="container pagina pilha-3">
        {trilha}
        <h1 className="h2">Inscrição no evento</h1>
        <div className={styles.estreito}>
          <Aviso
            tom="pessego"
            acao={
              <Botao href="/criar-conta" variante="primario">
                Criar conta
              </Botao>
            }
          >
            <strong>Para se inscrever, crie sua conta.</strong> É grátis e leva um minuto. Depois você volta
            para esta inscrição com seus dados já preenchidos.
          </Aviso>
        </div>
      </div>
    );
  }

  return <Formulario key={`${evento.slug}-${usuario.id}`} evento={evento} usuario={usuario} trilha={trilha} />;
}

function Formulario({ evento, usuario, trilha }: { evento: Evento; usuario: Pessoa; trilha: ReactNode }) {
  const { estado, despachar } = useEstado();
  const router = useRouter();
  const idCupom = useId();

  const gratuito = evento.categorias.every((c) => c.preco === 0);
  const soOnline = evento.local.online;

  const [nomeCracha, setNomeCracha] = useState(usuario.nome);
  const [erroNome, setErroNome] = useState<string>();
  const [modalidade, setModalidade] = useState<Modalidade>(soOnline ? "On-line" : "Presencial");
  const [categoriaId, setCategoriaId] = useState<Categoria["id"]>(() => categoriaSugerida(evento, usuario));
  const [textoCupom, setTextoCupom] = useState("");
  const [cupomAplicado, setCupomAplicado] = useState<Cupom>();
  const [erroCupom, setErroCupom] = useState<string>();
  const [etapa, setEtapa] = useState<"dados" | "pagamento">("dados");
  const [pagamento, setPagamento] = useState<FormaPagamento>("pix");
  const [concluindo, setConcluindo] = useState(false);

  const existente = inscricaoNoEvento(estado, usuario.id, evento.slug);
  if (existente && !concluindo) {
    return (
      <div className="container pagina pilha-3">
        {trilha}
        <h1 className="h2">Inscrição no evento</h1>
        <div className={styles.estreito}>
          <Aviso
            tom="sucesso"
            acao={
              <Botao href={`/eventos/${evento.slug}/inscricao/confirmada`} variante="secundario" icone={<Ticket size={20} aria-hidden="true" />}>
                Ver crachá
              </Botao>
            }
          >
            <strong>Você já tem inscrição neste evento.</strong> Ingresso{" "}
            <span className="tabular forte">{existente.ingresso}</span>. Não é preciso se inscrever de novo.
          </Aviso>
        </div>
      </div>
    );
  }

  const categoria = evento.categorias.find((c) => c.id === categoriaId) ?? evento.categorias[0];
  const desconto = cupomAplicado ? Math.round(categoria.preco * cupomAplicado.desconto * 100) / 100 : 0;
  const total = Math.max(0, categoria.preco - desconto);

  function aplicarCupom() {
    const codigo = textoCupom.trim();
    if (!codigo) {
      setCupomAplicado(undefined);
      setErroCupom("Digite o código do cupom. Ex.: UFBA10");
      return;
    }
    const achado = buscarCupom(codigo, evento.slug);
    if (!achado) {
      setCupomAplicado(undefined);
      setErroCupom(
        `O cupom ${codigo.toUpperCase()} não vale para este evento. Confira o código com quem divulgou ou continue sem cupom.`,
      );
      return;
    }
    setErroCupom(undefined);
    setTextoCupom(achado.codigo);
    setCupomAplicado(achado);
  }

  function removerCupom() {
    setCupomAplicado(undefined);
    setTextoCupom("");
    setErroCupom(undefined);
  }

  function irParaPagamento(e: FormEvent) {
    e.preventDefault();
    if (!nomeCracha.trim()) {
      setErroNome("Escreva o nome que vai no crachá. Ex.: Ana Ribeiro");
      return;
    }
    if (gratuito || total === 0) {
      confirmar();
      return;
    }
    setEtapa("pagamento");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function confirmar() {
    const ingresso = proximoCodigo(
      estado.inscricoes.map((i) => i.ingresso),
      evento.sigla,
      1188,
    );
    setConcluindo(true);
    despachar({
      tipo: "inscrever",
      eventoSlug: evento.slug,
      pessoaId: usuario.id,
      categoriaId: categoria.id,
      cupom: cupomAplicado?.codigo,
      valorPago: total,
      ingresso,
      modalidade,
      nomeCracha: nomeCracha.trim(),
    });
    despachar({
      tipo: "adicionarNotificacao",
      notificacao: {
        id: `n-inscricao-${evento.slug}-${usuario.id}-${Date.now()}`,
        pessoaId: usuario.id,
        tipo: "inscricao",
        titulo: "Inscrição confirmada",
        descricao: evento.nome,
        quando: "agora",
        acao: { rotulo: "Ver crachá", href: `/eventos/${evento.slug}/inscricao/confirmada` },
        lida: false,
      },
    });
    router.push(`/eventos/${evento.slug}/inscricao/confirmada`);
  }

  const resumo = (
    <aside className={`pilha ${styles.lateral}`} aria-label="Resumo da inscrição">
      <section className={`card-suave ${styles.resumo}`} aria-live="polite">
        <h2 className={styles.resumoTitulo}>Resumo</h2>
        <p>{evento.nome}</p>
        <p className="tabular">
          {periodoCurto(evento.dataInicio, evento.dataFim)} · {localCurto(evento)}
        </p>
        {gratuito ? (
          <p className={styles.total}>Inscrição gratuita</p>
        ) : (
          <>
            <p className="tabular">
              {categoria.nome}: {dinheiro(categoria.preco, true)}
            </p>
            {cupomAplicado ? (
              <p className="tabular">
                Cupom {cupomAplicado.codigo}: − {dinheiro(desconto, true)}
              </p>
            ) : null}
            <p className={`tabular ${styles.total}`}>Total: {dinheiro(total, true)}</p>
          </>
        )}
      </section>
      <p className="dica">
        Depois da inscrição você recebe o crachá. O certificado fica disponível ao fim do evento, se a
        participação for confirmada.
      </p>
    </aside>
  );

  if (etapa === "pagamento") {
    return (
      <div className="container pagina pilha-3">
        {trilha}
        <div className="com-lateral">
          <div className="pilha-3">
            <header className="pilha-1">
              <h1 className="h2">Pagamento</h1>
              <p className="corpo-apoio">Escolha como pagar {dinheiro(total, true)} e confirme a inscrição.</p>
            </header>
            <Aviso tom="info" icone={<Info size={18} aria-hidden="true" />}>
              <strong>Pagamento simulado.</strong> Este é um protótipo: nenhum valor é cobrado e nenhum dado
              bancário é pedido.
            </Aviso>
            <fieldset className={styles.grupo}>
              <legend className={styles.legenda}>
                Forma de pagamento <span className="obrigatorio">*</span>
              </legend>
              <div className={styles.opcoesPagamento}>
                {(Object.keys(ROTULO_PAGAMENTO) as FormaPagamento[]).map((f) => (
                  <label key={f} className={`${styles.opcaoPagamento} ${pagamento === f ? styles.opcaoMarcada : ""}`}>
                    <input
                      type="radio"
                      name="pagamento"
                      value={f}
                      checked={pagamento === f}
                      onChange={() => setPagamento(f)}
                      className={styles.radio}
                    />
                    {f === "pix" ? <IconeQr size={22} aria-hidden="true" /> : <Receipt size={22} aria-hidden="true" />}
                    <span className="pilha-1">
                      <span className="forte">{ROTULO_PAGAMENTO[f]}</span>
                      <span className="apoio">
                        {f === "pix" ? "Confirmação na hora." : "Na demonstração, o boleto já aparece como pago."}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="linha">
              <Botao variante="primario" onClick={confirmar} disabled={concluindo}>
                Confirmar inscrição
              </Botao>
              <Botao variante="secundario" icone={<ArrowLeft size={20} aria-hidden="true" />} onClick={() => setEtapa("dados")}>
                Voltar
              </Botao>
            </div>
          </div>
          {resumo}
        </div>
      </div>
    );
  }

  return (
    <div className="container pagina pilha-3">
      {trilha}
      <div className="com-lateral">
        <form className="pilha-3" onSubmit={irParaPagamento} noValidate>
          <header className="pilha-1">
            <h1 className="h2">Inscrição no evento</h1>
            <p className="corpo-apoio">Seus dados vêm da conta. Confira e escolha como vai participar.</p>
          </header>

          <div className="pilha-1">
            <div className={styles.duasColunas}>
              <div className="campo">
                <label htmlFor="insc-nome">Nome</label>
                <input id="insc-nome" className={`entrada ${styles.somenteLeitura}`} value={usuario.nome} readOnly aria-describedby="insc-perfil" />
              </div>
              <div className="campo">
                <label htmlFor="insc-inst">Instituição</label>
                <input
                  id="insc-inst"
                  className={`entrada ${styles.somenteLeitura}`}
                  value={nomeInstituicao(usuario.instituicao)}
                  readOnly
                  aria-describedby="insc-perfil"
                />
              </div>
            </div>
            <p id="insc-perfil" className="campo-ajuda">
              Para alterar, edite seu perfil.
            </p>
          </div>

          <Campo
            rotulo="Nome no crachá"
            obrigatorio
            value={nomeCracha}
            onChange={(e) => {
              setNomeCracha(e.target.value);
              if (erroNome) setErroNome(undefined);
            }}
            ajuda="Como deve aparecer impresso."
            erro={erroNome}
            autoComplete="name"
          />

          <fieldset className={styles.grupo}>
            <legend className={styles.legenda}>
              Modalidade <span className="obrigatorio">*</span>
            </legend>
            <div className={styles.opcoes}>
              {(soOnline ? (["On-line"] as Modalidade[]) : (["Presencial", "On-line"] as Modalidade[])).map((m) => (
                <label key={m} className={styles.opcao}>
                  <input
                    type="radio"
                    name="modalidade"
                    value={m}
                    checked={modalidade === m}
                    onChange={() => setModalidade(m)}
                    className={styles.radio}
                  />
                  {m}
                </label>
              ))}
            </div>
            {soOnline ? <p className="campo-ajuda">Este evento acontece só on-line.</p> : null}
          </fieldset>

          <fieldset className={styles.grupo}>
            <legend className={styles.legenda}>
              Categoria <span className="obrigatorio">*</span>
            </legend>
            <div className={styles.opcoes}>
              {evento.categorias.map((c) => (
                <label key={c.id} className={styles.opcao}>
                  <input
                    type="radio"
                    name="categoria"
                    value={c.id}
                    checked={categoria.id === c.id}
                    onChange={() => setCategoriaId(c.id)}
                    className={styles.radio}
                  />
                  <span className="tabular">
                    {c.preco === 0 ? c.nome : `${c.nome} · ${dinheiro(c.preco)}`}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {gratuito ? null : (
            <div className="campo">
              <label htmlFor={idCupom}>Cupom de desconto</label>
              <div className={styles.linhaCupom}>
                <input
                  id={idCupom}
                  className={`entrada ${styles.entradaCupom}`}
                  value={textoCupom}
                  onChange={(e) => {
                    setTextoCupom(e.target.value);
                    if (cupomAplicado) setCupomAplicado(undefined);
                    if (erroCupom) setErroCupom(undefined);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      aplicarCupom();
                    }
                  }}
                  placeholder="Ex.: UFBA10"
                  autoCapitalize="characters"
                  aria-invalid={erroCupom ? true : undefined}
                  aria-describedby={`${idCupom}-retorno`}
                />
                <Botao variante="secundario" onClick={aplicarCupom}>
                  Aplicar
                </Botao>
              </div>
              <div id={`${idCupom}-retorno`} aria-live="polite">
                {erroCupom ? (
                  <p className="campo-erro">
                    <XCircle size={16} aria-hidden="true" />
                    {erroCupom}
                  </p>
                ) : cupomAplicado ? (
                  <p className={styles.cupomOk}>
                    <CheckCircle2 size={16} aria-hidden="true" />
                    <span>
                      Cupom aplicado: {Math.round(cupomAplicado.desconto * 100)}% de desconto, oferecido por{" "}
                      {cupomAplicado.divulgador}.
                    </span>
                    <button type="button" className={styles.remover} onClick={removerCupom}>
                      Remover
                    </button>
                  </p>
                ) : (
                  <p className="campo-ajuda">Recebeu um código de quem divulgou o evento? Digite e toque em Aplicar.</p>
                )}
              </div>
            </div>
          )}

          <div className="linha">
            <Botao variante="primario" type="submit" disabled={concluindo}>
              {gratuito ? "Confirmar inscrição" : "Ir para o pagamento"}
            </Botao>
            <Botao variante="secundario" href={`/eventos/${evento.slug}`}>
              Cancelar
            </Botao>
          </div>
        </form>
        {resumo}
      </div>
    </div>
  );
}
