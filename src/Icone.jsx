// Ícones de traço do design system (stroke 2px, cantos arredondados, cor do texto).
const CAMINHOS = {
  calendario: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  calendarioVazio: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4M9.5 14.5l5 3M14.5 14.5l-5 3" /></>,
  relogio: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  local: <><path d="M12 21s7-6 7-12a7 7 0 00-14 0c0 6 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></>,
  sair: <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />,
  olho: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  estudante: <><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" /></>,
  atletica: <><path d="M7 4h10v5a5 5 0 01-10 0z" /><path d="M7 6H4a3 3 0 003 4M17 6h3a3 3 0 01-3 4M12 14v4M8 21h8" /></>,
  lapis: <path d="M4 20h4L19 9l-4-4L4 16z" />,
  ingresso: <><path d="M4 7a2 2 0 012-2h12a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3a2 2 0 000-4z" /><path d="M9 12l2 2 4-4" /></>,
  lixeira: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
  mais: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
  maisSimples: <path d="M12 5v14M5 12h14" />,
  voltar: <path d="M15 6l-6 6 6 6" />,
  avancar: <path d="M9 6l6 6-6 6" />,
  abaixo: <path d="M6 9l6 6 6-6" />,
  seta: <path d="M5 12h14M13 6l6 6-6 6" />,
  alerta: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 17v.5" /></>,
  fechar: <path d="M6 6l12 12M18 6L6 18" />,
  check: <path d="M5 12l5 5L20 7" />,
};

function Icone({ nome, tamanho = 18, traco = 2 }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={traco}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {CAMINHOS[nome]}
    </svg>
  );
}

export default Icone;
