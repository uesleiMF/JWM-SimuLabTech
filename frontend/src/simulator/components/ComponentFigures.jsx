import { COMPONENT_TYPES } from "./componentTypes";

/**
 * Figurinhas / símbolos visuais dos componentes
 * (estilo ilustração técnica — mais realista que ícones genéricos)
 */

/** Cores padrão das faixas de resistor (aproximação educativa) */
const RESISTOR_BAND_PALETTE = [
  "#0f172a", // 0 preto
  "#7c2d12", // 1 marrom
  "#dc2626", // 2 vermelho
  "#ea580c", // 3 laranja
  "#eab308", // 4 amarelo
  "#22c55e", // 5 verde
  "#2563eb", // 6 azul
  "#7c3aed", // 7 violeta
  "#94a3b8", // 8 cinza
  "#f8fafc", // 9 branco
];

function getResistorBandColors(ohms) {
  const R = Math.max(Number(ohms) || 0, 0);
  if (R <= 0) {
    return ["#64748b", "#64748b", "#64748b", "#b45309"];
  }
  // Normaliza em escala log para 1 Ω … 1 MΩ
  const log = Math.log10(Math.max(R, 1));
  const clamped = Math.min(Math.max(log, 0), 6); // 1 Ω a 1 MΩ
  const d1 = Math.min(9, Math.floor(clamped));
  const frac = clamped - d1;
  const d2 = Math.min(9, Math.floor(frac * 10));
  const mult = Math.min(9, Math.max(0, Math.round(clamped - 1)));
  return [
    RESISTOR_BAND_PALETTE[d1] || "#0f172a",
    RESISTOR_BAND_PALETTE[d2] || "#7c2d12",
    RESISTOR_BAND_PALETTE[mult] || "#dc2626",
    "#b45309", // tolerância dourada
  ];
}

export function ComponentFigure({
  type,
  size = 28,
  energized = false,
  switchOn = false,
  running = false,
  value = null,
  className = "",
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 48 48",
    className: `component-figure ${className}`,
    "aria-hidden": true,
  };

  switch (type) {
    case COMPONENT_TYPES.SOURCE:
      return (
        <svg {...common}>
          {/* Corpo da fonte */}
          <rect x="8" y="10" width="32" height="28" rx="4" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" />
          <rect x="11" y="13" width="26" height="10" rx="2" fill="#0f172a" />
          {/* Terminais */}
          <circle cx="16" cy="18" r="3" fill="#22c55e" />
          <circle cx="32" cy="18" r="3" fill="#ef4444" />
          <text x="16" y="20" textAnchor="middle" fontSize="5" fill="#fff" fontWeight="700">+</text>
          <text x="32" y="20" textAnchor="middle" fontSize="6" fill="#fff" fontWeight="700">−</text>
          {/* Display */}
          <rect x="14" y="28" width="20" height="7" rx="1.5" fill="#0ea5e9" opacity="0.9" />
          <text x="24" y="33.5" textAnchor="middle" fontSize="5" fill="#fff" fontWeight="700">V</text>
        </svg>
      );

    case COMPONENT_TYPES.RESISTOR: {
      const bands = getResistorBandColors(value);
      // Figura maior só para o resistor
      const resSize = Math.max(size, 40);
      const resCommon = {
        ...common,
        width: resSize,
        height: resSize,
      };
      // Corpo fica mais “quente” (alaranjado) com R baixo e mais frio (bege) com R alto
      const R = Math.max(Number(value) || 50, 1);
      const heat = 1 - Math.min(Math.log10(R) / 6, 1); // 0 = frio, 1 = quente
      const bodyR = Math.round(245 - heat * 40);
      const bodyG = Math.round(208 - heat * 80);
      const bodyB = Math.round(169 - heat * 40);
      const bodyFill = `rgb(${bodyR}, ${bodyG}, ${bodyB})`;

      return (
        <svg {...resCommon}>
          {/* Terminais */}
          <line x1="1" y1="24" x2="6" y2="24" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="42" y1="24" x2="47" y2="24" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          {/* Corpo cilíndrico */}
          <rect
            x="6"
            y="15"
            width="36"
            height="18"
            rx="5"
            fill={bodyFill}
            stroke="#92400e"
            strokeWidth="1.4"
          />
          {/* Faixas coloridas conforme o valor */}
          <rect x="11" y="15" width="4" height="18" fill={bands[0]} />
          <rect x="18" y="15" width="4" height="18" fill={bands[1]} />
          <rect x="25" y="15" width="4" height="18" fill={bands[2]} />
          <rect x="33" y="15" width="3.5" height="18" fill={bands[3]} />
          {/* Brilho */}
          <rect x="8" y="17" width="32" height="4" rx="2" fill="#fff" opacity="0.2" />
        </svg>
      );
    }

    case COMPONENT_TYPES.CAPACITOR:
      return (
        <svg {...common}>
          <line x1="4" y1="24" x2="18" y2="24" stroke="#64748b" strokeWidth="2" />
          <line x1="18" y1="12" x2="18" y2="36" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />
          <line x1="30" y1="12" x2="30" y2="36" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />
          <line x1="30" y1="24" x2="44" y2="24" stroke="#64748b" strokeWidth="2" />
          <text x="24" y="10" textAnchor="middle" fontSize="7" fill="#06b6d4" fontWeight="700">C</text>
        </svg>
      );

    case COMPONENT_TYPES.INDUCTOR:
      return (
        <svg {...common}>
          <line x1="4" y1="24" x2="10" y2="24" stroke="#64748b" strokeWidth="2" />
          <path
            d="M10 24 Q14 12 18 24 Q22 36 26 24 Q30 12 34 24 Q38 36 42 24"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line x1="42" y1="24" x2="46" y2="24" stroke="#64748b" strokeWidth="2" />
        </svg>
      );

    case COMPONENT_TYPES.SWITCH:
      return (
        <svg {...common}>
          <circle cx="12" cy="24" r="3.5" fill={switchOn ? "#22c55e" : "#94a3b8"} stroke="#334155" strokeWidth="1" />
          <circle cx="36" cy="24" r="3.5" fill="#94a3b8" stroke="#334155" strokeWidth="1" />
          <line
            x1="15"
            y1="24"
            x2={switchOn ? "33" : "30"}
            y2={switchOn ? "24" : "14"}
            stroke={switchOn ? "#22c55e" : "#f59e0b"}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line x1="2" y1="24" x2="8.5" y2="24" stroke="#64748b" strokeWidth="2" />
          <line x1="39.5" y1="24" x2="46" y2="24" stroke="#64748b" strokeWidth="2" />
        </svg>
      );

    case COMPONENT_TYPES.LAMP:
      return (
        <svg {...common}>
          {/* Bulbo */}
          <circle
            cx="24"
            cy="20"
            r="12"
            fill={energized ? "#fef08a" : "#e2e8f0"}
            stroke={energized ? "#eab308" : "#94a3b8"}
            strokeWidth="1.5"
          />
          {energized && (
            <>
              <path d="M24 12 L24 20 M19 15 L29 25 M29 15 L19 25" stroke="#f59e0b" strokeWidth="1.2" opacity="0.7" />
            </>
          )}
          {/* Base */}
          <rect x="18" y="32" width="12" height="5" rx="1" fill="#64748b" />
          <rect x="20" y="37" width="8" height="3" rx="0.5" fill="#475569" />
          <line x1="24" y1="40" x2="24" y2="46" stroke="#64748b" strokeWidth="1.5" />
        </svg>
      );

    case COMPONENT_TYPES.MOTOR:
      return (
        <svg {...common}>
          <circle
            cx="24"
            cy="24"
            r="14"
            fill={running ? "#dbeafe" : "#e2e8f0"}
            stroke={running ? "#2563eb" : "#64748b"}
            strokeWidth="2"
          />
          <circle cx="24" cy="24" r="6" fill={running ? "#3b82f6" : "#94a3b8"} />
          {/* Eixo / hélices */}
          <line x1="24" y1="10" x2="24" y2="18" stroke="#334155" strokeWidth="2" />
          <line x1="24" y1="30" x2="24" y2="38" stroke="#334155" strokeWidth="2" />
          <line x1="10" y1="24" x2="18" y2="24" stroke="#334155" strokeWidth="2" />
          <line x1="30" y1="24" x2="38" y2="24" stroke="#334155" strokeWidth="2" />
          <text x="24" y="27" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="800">M</text>
          {running && (
            <circle cx="24" cy="24" r="16" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 3" opacity="0.6">
              <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="1.2s" repeatCount="indefinite" />
            </circle>
          )}
        </svg>
      );

    case COMPONENT_TYPES.LED:
      return (
        <svg {...common}>
          {/* LED corpo */}
          <path
            d="M16 28 L16 16 Q16 10 24 10 Q32 10 32 16 L32 28 Z"
            fill={energized ? "#fca5a5" : "#fecaca"}
            stroke={energized ? "#ef4444" : "#f87171"}
            strokeWidth="1.5"
          />
          <rect x="14" y="28" width="20" height="6" rx="1" fill="#334155" />
          <line x1="20" y1="34" x2="18" y2="44" stroke="#64748b" strokeWidth="1.5" />
          <line x1="28" y1="34" x2="30" y2="44" stroke="#64748b" strokeWidth="1.5" />
          {energized && (
            <>
              <line x1="34" y1="12" x2="40" y2="6" stroke="#ef4444" strokeWidth="1.5" />
              <line x1="36" y1="18" x2="44" y2="16" stroke="#ef4444" strokeWidth="1.5" />
            </>
          )}
        </svg>
      );

    case COMPONENT_TYPES.PUSH_BUTTON_NO:
      return (
        <svg {...common}>
          <rect x="10" y="20" width="28" height="16" rx="3" fill="#1e293b" stroke="#22c55e" strokeWidth="1.5" />
          <circle cx="24" cy="16" r="8" fill={switchOn ? "#16a34a" : "#22c55e"} stroke="#14532d" strokeWidth="1" />
          <circle cx="24" cy="16" r="4" fill={switchOn ? "#bbf7d0" : "#86efac"} />
          <text x="24" y="32" textAnchor="middle" fontSize="6" fill="#86efac" fontWeight="700">NA</text>
        </svg>
      );

    case COMPONENT_TYPES.PUSH_BUTTON_NC:
      return (
        <svg {...common}>
          <rect x="10" y="20" width="28" height="16" rx="3" fill="#1e293b" stroke="#ef4444" strokeWidth="1.5" />
          <circle cx="24" cy="16" r="8" fill={switchOn ? "#dc2626" : "#f87171"} stroke="#7f1d1d" strokeWidth="1" />
          <circle cx="24" cy="16" r="4" fill={switchOn ? "#fecaca" : "#fca5a5"} />
          <text x="24" y="32" textAnchor="middle" fontSize="6" fill="#fca5a5" fontWeight="700">NF</text>
        </svg>
      );

    case COMPONENT_TYPES.CONTACTOR:
      return (
        <svg {...common}>
          <rect x="8" y="8" width="32" height="32" rx="3" fill="#1e293b" stroke="#6366f1" strokeWidth="1.5" />
          <rect x="12" y="12" width="24" height="10" rx="1" fill="#312e81" />
          <text x="24" y="19" textAnchor="middle" fontSize="6" fill="#c7d2fe" fontWeight="700">KM</text>
          {/* Contatos */}
          <line x1="14" y1="28" x2="20" y2="28" stroke="#a5b4fc" strokeWidth="1.5" />
          <line x1="28" y1="28" x2="34" y2="28" stroke="#a5b4fc" strokeWidth="1.5" />
          <line x1="14" y1="34" x2="20" y2="34" stroke="#a5b4fc" strokeWidth="1.5" />
          <line x1="28" y1="34" x2="34" y2="34" stroke="#a5b4fc" strokeWidth="1.5" />
          <circle cx="17" cy="28" r="1.5" fill="#22c55e" />
          <circle cx="31" cy="28" r="1.5" fill="#22c55e" />
        </svg>
      );

    case COMPONENT_TYPES.BREAKER:
      return (
        <svg {...common}>
          <rect x="12" y="6" width="24" height="36" rx="3" fill="#fff7ed" stroke="#ea580c" strokeWidth="1.5" />
          <rect x="16" y="10" width="16" height="8" rx="1" fill="#ea580c" />
          <text x="24" y="16" textAnchor="middle" fontSize="5" fill="#fff" fontWeight="700">Q</text>
          {/* Alavanca */}
          <rect
            x="20"
            y="22"
            width="8"
            height="14"
            rx="2"
            fill={switchOn ? "#22c55e" : "#ef4444"}
          />
          <line x1="24" y1="36" x2="24" y2="42" stroke="#9a3412" strokeWidth="1.5" />
        </svg>
      );

    case COMPONENT_TYPES.FUSE_ISOLATOR:
      return (
        <svg {...common}>
          <rect x="10" y="14" width="28" height="20" rx="3" fill="#fef2f2" stroke="#dc2626" strokeWidth="1.5" />
          {/* Fusível cartucho */}
          <rect x="16" y="18" width="16" height="12" rx="2" fill="#fecaca" stroke="#b91c1c" strokeWidth="1" />
          <line x1="18" y1="24" x2="30" y2="24" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" />
          <circle cx="18" cy="24" r="2" fill="#fca5a5" />
          <circle cx="30" cy="24" r="2" fill="#fca5a5" />
          <text x="24" y="12" textAnchor="middle" fontSize="6" fill="#dc2626" fontWeight="700">FU</text>
        </svg>
      );

    case COMPONENT_TYPES.THERMAL_RELAY:
      return (
        <svg {...common}>
          <rect x="10" y="10" width="28" height="28" rx="3" fill="#fffbeb" stroke="#b45309" strokeWidth="1.5" />
          <text x="24" y="22" textAnchor="middle" fontSize="7" fill="#b45309" fontWeight="800">RT</text>
          {/* Símbolo térmico */}
          <path d="M18 28 Q24 22 30 28" fill="none" stroke="#d97706" strokeWidth="1.5" />
          <path d="M18 32 Q24 26 30 32" fill="none" stroke="#d97706" strokeWidth="1.5" />
        </svg>
      );

    case COMPONENT_TYPES.TIMER_ON_DELAY:
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="14" fill="#ecfdf5" stroke="#0d9488" strokeWidth="2" />
          <circle cx="24" cy="24" r="2" fill="#0d9488" />
          <line x1="24" y1="24" x2="24" y2="14" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" />
          <line x1="24" y1="24" x2="32" y2="28" stroke="#0f766e" strokeWidth="1.5" strokeLinecap="round" />
          <text x="24" y="44" textAnchor="middle" fontSize="6" fill="#0d9488" fontWeight="700">TON</text>
        </svg>
      );

    case COMPONENT_TYPES.INDICATOR:
      return (
        <svg {...common}>
          <circle
            cx="24"
            cy="22"
            r="12"
            fill={energized ? "#86efac" : "#e2e8f0"}
            stroke={energized ? "#22c55e" : "#94a3b8"}
            strokeWidth="2"
          />
          <circle
            cx="24"
            cy="22"
            r="6"
            fill={energized ? "#22c55e" : "#cbd5e1"}
          />
          {energized && (
            <circle cx="24" cy="22" r="14" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.5" />
          )}
          <rect x="20" y="34" width="8" height="6" rx="1" fill="#64748b" />
        </svg>
      );

    default:
      return (
        <svg {...common}>
          <rect x="10" y="10" width="28" height="28" rx="4" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
          <text x="24" y="28" textAnchor="middle" fontSize="10" fill="#94a3b8">?</text>
        </svg>
      );
  }
}

export default ComponentFigure;
