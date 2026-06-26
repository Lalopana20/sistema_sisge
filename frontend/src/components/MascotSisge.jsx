export default function MascotSisge({ size = 180 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1890ff" />
          <stop offset="100%" stopColor="#096dd9" />
        </linearGradient>
        <linearGradient id="boxGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff9a3e" />
          <stop offset="100%" stopColor="#e67e22" />
        </linearGradient>
      </defs>

      {/* Sombra */}
      <ellipse cx="100" cy="185" rx="50" ry="8" fill="rgba(0,0,0,0.08)" />

      {/* Cuerpo */}
      <rect x="72" y="105" width="56" height="60" rx="10" fill="url(#bodyGrad)" />

      {/* Brazo izquierdo */}
      <rect x="48" y="115" width="24" height="10" rx="5" fill="url(#bodyGrad)" />

      {/* Brazo derecho */}
      <rect x="128" y="115" width="24" height="10" rx="5" fill="url(#bodyGrad)" />

      {/* Cabeza */}
      <circle cx="100" cy="72" r="30" fill="url(#bodyGrad)" />

      {/* Casco */}
      <path
        d="M68 72 Q68 48 100 44 Q132 48 132 72"
        fill="#f0c040"
        stroke="#d4a820"
        strokeWidth="2"
      />
      <rect x="66" y="68" width="68" height="6" rx="3" fill="#d4a820" />

      {/* Ojos */}
      <ellipse cx="88" cy="70" rx="5" ry="6" fill="white" />
      <ellipse cx="112" cy="70" rx="5" ry="6" fill="white" />
      <circle cx="89" cy="69" r="3" fill="#2c3e50" />
      <circle cx="113" cy="69" r="3" fill="#2c3e50" />

      {/* Mejillas */}
      <circle cx="82" cy="80" r="5" fill="rgba(255,150,150,0.25)" />
      <circle cx="118" cy="80" r="5" fill="rgba(255,150,150,0.25)" />

      {/* Sonrisa */}
      <path
        d="M90 82 Q100 92 110 82"
        stroke="#2c3e50"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Caja */}
      <rect x="56" y="132" width="88" height="8" rx="4" fill="url(#boxGrad)" />
      <rect x="72" y="140" width="56" height="30" rx="4" fill="url(#boxGrad)" />
      <rect x="80" y="148" width="40" height="3" rx="1.5" fill="rgba(0,0,0,0.07)" />
      <rect x="80" y="156" width="40" height="3" rx="1.5" fill="rgba(0,0,0,0.07)" />

      {/* Etiqueta en la caja */}
      <rect x="88" y="143" width="24" height="10" rx="2" fill="#fff" opacity="0.9" />
      <text
        x="100" y="150"
        textAnchor="middle"
        fontSize="6"
        fontWeight="bold"
        fill="#e67e22"
      >
        SISGE
      </text>

      {/* Pies */}
      <ellipse cx="88" cy="167" rx="14" ry="5" fill="#096dd9" />
      <ellipse cx="112" cy="167" rx="14" ry="5" fill="#096dd9" />
    </svg>
  )
}
