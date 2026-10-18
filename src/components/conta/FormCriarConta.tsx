"use client";

import { XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { Botao } from "@/components/Botao";
import { Campo } from "@/components/Campo";
import { useEstado } from "@/data/estado";
import styles from "./FormCriarConta.module.css";

interface Valores {
  nome: string;
  email: string;
  instituicao: string;
  senha: string;
  confirmar: string;
  aceite: boolean;
}

type Erros = Partial<Record<keyof Valores, string>>;

const VAZIO: Valores = { nome: "", email: "", instituicao: "", senha: "", confirmar: "", aceite: false };
const ORDEM: (keyof Valores)[] = ["nome", "email", "instituicao", "senha", "confirmar", "aceite"];
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validar(v: Valores): Erros {
  const e: Erros = {};
  if (!v.nome.trim()) e.nome = "Complete o nome. Ex.: Ana Ribeiro";
  else if (v.nome.trim().split(/\s+/).length < 2) e.nome = "Escreva nome e sobrenome. Ex.: Ana Ribeiro";
  if (!v.email.trim()) e.email = "Complete o e-mail. Ex.: nome@instituicao.br";
  else if (!EMAIL_VALIDO.test(v.email.trim())) e.email = "Confira o e-mail. Ex.: nome@instituicao.br";
  if (!v.instituicao.trim()) e.instituicao = "Complete a instituição. Ex.: Universidade Federal da Bahia";
  if (!v.senha) e.senha = "Crie uma senha com pelo menos 8 caracteres.";
  else if (v.senha.length < 8) e.senha = `Use pelo menos 8 caracteres (faltam ${8 - v.senha.length}).`;
  if (!v.confirmar) e.confirmar = "Repita a senha para confirmar.";
  else if (v.senha && v.confirmar !== v.senha) e.confirmar = "As senhas não são iguais. Digite a mesma senha nos dois campos.";
  if (!v.aceite) e.aceite = "Marque o aceite dos termos para criar a conta.";
  return e;
}

/** A2 — Criar conta, sem escolher papel. Nada é enviado: é tudo fictício. */
export function FormCriarConta() {
  const router = useRouter();
  const params = useSearchParams();
  const { estado, despachar } = useEstado();
  const [v, setV] = useState<Valores>(VAZIO);
  const [erros, setErros] = useState<Erros>({});
  const [tentou, setTentou] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const eventoOrigem = estado.eventos.find((e) => e.slug === params.get("evento"));

  function mudar<K extends keyof Valores>(campo: K, valor: Valores[K]) {
    const novo = { ...v, [campo]: valor };
    setV(novo);
    // Depois da primeira tentativa, os erros acompanham a digitação.
    if (tentou) setErros(validar(novo));
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    setTentou(true);
    const encontrados = validar(v);
    setErros(encontrados);
    const primeiro = ORDEM.find((c) => encontrados[c]);
    if (primeiro) {
      formRef.current?.querySelector<HTMLElement>(`[name="${primeiro}"]`)?.focus();
      return;
    }
    despachar({ tipo: "criarConta", nome: v.nome.trim(), email: v.email.trim() });
    const destino = eventoOrigem
      ? `/criar-conta/proximo-passo?evento=${eventoOrigem.slug}`
      : "/criar-conta/proximo-passo";
    router.push(destino);
  }

  function entrar() {
    despachar({ tipo: "definirPapel", papel: "participante" });
    router.push(eventoOrigem ? `/eventos/${eventoOrigem.slug}` : "/eventos");
  }

  const qtdErros = Object.keys(erros).length;

  return (
    <div className="container pagina">
      <div className={styles.grade}>
        <div className="pilha-3">
          <header className="pilha-1">
            <h1 className="h2">Criar conta no Revelio</h1>
            <p className="corpo-apoio">Você só faz isso uma vez. Depois, inscreve-se em quantos eventos quiser.</p>
          </header>

          <form ref={formRef} className={styles.form} noValidate onSubmit={enviar} aria-describedby={qtdErros ? "resumo-erros" : undefined}>
            {tentou && qtdErros > 0 ? (
              <p id="resumo-erros" className={styles.resumoErros} role="alert">
                <XCircle size={20} aria-hidden="true" />
                {qtdErros === 1 ? "Falta corrigir 1 campo." : `Faltam corrigir ${qtdErros} campos.`}
              </p>
            ) : null}

            <Campo
              rotulo="Nome completo"
              obrigatorio
              name="nome"
              autoComplete="name"
              placeholder="Ex.: Ana Ribeiro"
              value={v.nome}
              onChange={(e) => mudar("nome", e.target.value)}
              erro={erros.nome}
            />

            <div className={styles.dupla}>
              <Campo
                rotulo="E-mail"
                obrigatorio
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="nome@instituicao.br"
                value={v.email}
                onChange={(e) => mudar("email", e.target.value)}
                ajuda="Usado para entrar e para receber convites."
                erro={erros.email}
              />
              <Campo
                rotulo="Instituição"
                obrigatorio
                name="instituicao"
                autoComplete="organization"
                placeholder="Ex.: Universidade Federal da Bahia"
                value={v.instituicao}
                onChange={(e) => mudar("instituicao", e.target.value)}
                erro={erros.instituicao}
              />
            </div>

            <div className={styles.dupla}>
              <Campo
                rotulo="Senha"
                obrigatorio
                name="senha"
                type="password"
                autoComplete="new-password"
                value={v.senha}
                onChange={(e) => mudar("senha", e.target.value)}
                ajuda="Mínimo de 8 caracteres."
                erro={erros.senha}
              />
              <Campo
                rotulo="Confirmar senha"
                obrigatorio
                name="confirmar"
                type="password"
                autoComplete="new-password"
                value={v.confirmar}
                onChange={(e) => mudar("confirmar", e.target.value)}
                erro={erros.confirmar}
              />
            </div>

            <div className="pilha-1">
              <label className={styles.aceite}>
                <input
                  type="checkbox"
                  name="aceite"
                  checked={v.aceite}
                  onChange={(e) => mudar("aceite", e.target.checked)}
                  aria-invalid={erros.aceite ? true : undefined}
                  aria-describedby={erros.aceite ? "erro-aceite" : undefined}
                />
                <span>Li e aceito os termos de uso e a política de privacidade.</span>
              </label>
              {erros.aceite ? (
                <p id="erro-aceite" className="campo-erro">
                  <XCircle size={16} aria-hidden="true" />
                  {erros.aceite}
                </p>
              ) : null}
            </div>

            <div className={styles.acoes}>
              <Botao type="submit">Criar conta</Botao>
              <p>
                Já tem conta?{" "}
                <button type="button" className={styles.link} onClick={entrar}>
                  Entrar
                </button>
              </p>
            </div>
          </form>
        </div>

        <aside className="pilha-3">
          <div className="dica">
            <p>
              <strong>Você não escolhe um papel aqui.</strong> Participante e autor surgem quando você se inscreve em um
              evento. Revisor surge só por convite da organização de um evento.
            </p>
          </div>
          <div className="card-suave pilha-1">
            <h2 className={styles.lateralTitulo}>Veio de um evento?</h2>
            {eventoOrigem ? (
              <p>
                Depois de criar a conta, você volta para a página do <strong>{eventoOrigem.nome}</strong> para concluir a
                inscrição.
              </p>
            ) : (
              <p>
                Se você chegou aqui pela página de um evento, depois de criar a conta você volta para ela para concluir a
                inscrição.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
