// QR code ilustrativo: gerado de forma determinística a partir do código do
// ingresso. Não é um QR válido; serve para o protótipo parecer real.

const TAMANHO = 25;

function semente(texto: string) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function gerador(inicial: number) {
  let s = inicial;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Área das três marcas de posição (com a margem branca em volta). */
function naMarca(x: number, y: number) {
  const marcas = [
    [0, 0],
    [TAMANHO - 7, 0],
    [0, TAMANHO - 7],
  ];
  return marcas.some(([mx, my]) => x >= mx - 1 && x <= mx + 7 && y >= my - 1 && y <= my + 7);
}

function modulos(codigo: string) {
  const rnd = gerador(semente(codigo));
  const caminho: string[] = [];
  for (let y = 0; y < TAMANHO; y++) {
    for (let x = 0; x < TAMANHO; x++) {
      if (naMarca(x, y)) continue;
      // Linhas de sincronismo, como num QR de verdade.
      if (x === 6 || y === 6) {
        if ((x + y) % 2 === 0) caminho.push(`M${x} ${y}h1v1h-1z`);
        continue;
      }
      if (rnd() > 0.5) caminho.push(`M${x} ${y}h1v1h-1z`);
    }
  }
  return caminho.join("");
}

function Marca({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5z`} fillRule="evenodd" />
      <rect x={x + 2} y={y + 2} width={3} height={3} />
    </g>
  );
}

export function QrCode({ codigo, tamanho = 144 }: { codigo: string; tamanho?: number }) {
  return (
    <svg
      viewBox={`-2 -2 ${TAMANHO + 4} ${TAMANHO + 4}`}
      width={tamanho}
      height={tamanho}
      role="img"
      aria-label={`QR code do ingresso ${codigo}`}
      shapeRendering="crispEdges"
    >
      <rect x={-2} y={-2} width={TAMANHO + 4} height={TAMANHO + 4} fill="#ffffff" />
      <g fill="#2b1631">
        <Marca x={0} y={0} />
        <Marca x={TAMANHO - 7} y={0} />
        <Marca x={0} y={TAMANHO - 7} />
        <path d={modulos(codigo)} />
      </g>
    </svg>
  );
}
