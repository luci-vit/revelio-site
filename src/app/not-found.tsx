import { Botao } from "@/components/Botao";

export default function NaoEncontrado() {
  return (
    <div className="container pagina pilha" style={{ maxWidth: 640 }}>
      <h1 className="h2">Página não encontrada</h1>
      <p className="corpo-apoio">O endereço pode ter mudado ou o evento não existe mais.</p>
      <div>
        <Botao href="/eventos" variante="secundario">
          Ver eventos
        </Botao>
      </div>
    </div>
  );
}
