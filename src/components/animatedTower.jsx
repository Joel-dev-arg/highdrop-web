// src/components/AnimatedTower.jsx
export default function AnimatedTower() {
  return (
    <svg
      width="600"
      height="600"
      viewBox="0 0 420 640"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
          <feOffset dy="4" result="off" />
          <feMerge>
            <feMergeNode in="off" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="towerGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7f9fc" />
          <stop offset="100%" stopColor="#e5e9f1" />
        </linearGradient>

        <linearGradient
          id="waterGrad"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="0"
          y2="520"
        >
          <stop offset="0%" stopColor="#79c7ff" />
          <stop offset="40%" stopColor="#3aa0ff" />
          <stop offset="60%" stopColor="#1592ff" />
          <stop offset="100%" stopColor="#0c6bd9" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            values="0,60; 0,-60; 0,60"
            dur="3.5s"
            repeatCount="indefinite"
          />
        </linearGradient>

        <g id="drop">
          <path
            d="M0,-8 C3,-5 4,-3 4,0 C4,3 2,6 0,6 C-2,6 -4,3 -4,0 C-4,-3 -3,-5 0,-8 Z"
            fill="#2aa7ff"
          />
        </g>

        <g id="leaf">
          <path
            d="M0 0 C 14 -8, 18 -2, 20 8 C 12 10, 6 10, 0 8 C -2 6, -1 3, 0 0 Z"
            fill="#62c45b"
          />
        </g>

        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#1580ff" />
        </marker>
      </defs>

      <ellipse cx="210" cy="604" rx="150" ry="18" fill="#000" opacity="0.1" />

      <g filter="url(#softShadow)">
        <path
          d="M60,500 a150,90 0 0 0 300,0 v60 a150,50 0 0 1 -300,0z"
          fill="#2b2f36"
        />
        <ellipse cx="210" cy="500" rx="150" ry="40" fill="#3a4049" />
        <ellipse cx="210" cy="492" rx="140" ry="28" fill="#e9eef5" />
      </g>

      <g>
        <rect
          x="150"
          y="110"
          width="120"
          height="390"
          rx="12"
          fill="url(#towerGrad)"
          stroke="#cfd7e3"
        />
        <ellipse cx="210" cy="110" rx="62" ry="16" fill="#dfe6f1" stroke="#c8d1de" />
        <ellipse cx="210" cy="118" rx="58" ry="12" fill="#eef3f9" stroke="#d5ddea" />

        <g fill="#dfe6f1" stroke="#c8d1de">
          {[50, 110, 170, 230, 290, 350].map((y) => (
            <g key={y} transform={`translate(0,${y})`}>
              <ellipse cx="140" cy="150" rx="26" ry="14" />
              <ellipse cx="280" cy="150" rx="26" ry="14" />
            </g>
          ))}
        </g>

        <g opacity="0.9">
          {[200, 260, 320, 380].map((y) => (
            <g key={y}>
              <g transform={`translate(140,${y}) scale(0.9)`}>
                <use href="#leaf" />
                <use href="#leaf" transform="scale(-1,1) translate(-20,0)" />
              </g>
              <g transform={`translate(280,${y}) scale(0.9)`}>
                <use href="#leaf" />
                <use href="#leaf" transform="scale(-1,1) translate(-20,0)" />
              </g>
            </g>
          ))}
        </g>

        <g>
          <rect
            x="196"
            y="126"
            width="28"
            height="360"
            rx="8"
            fill="#cfd8e6"
            stroke="#b8c3d4"
          />
          <clipPath id="tubeClip">
            <rect x="198" y="128" width="24" height="356" rx="6" />
          </clipPath>
          <g clipPath="url(#tubeClip)">
            <rect x="198" y="128" width="24" height="356" fill="url(#waterGrad)" />
            <g fill="#e6f6ff" opacity="0.9">
              <circle cx="210" cy="480" r="3">
                <animate attributeName="cy" values="480;140" dur="2.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;1;0" dur="2.6s" repeatCount="indefinite" />
              </circle>
              <circle cx="206" cy="500" r="2.4">
                <animate attributeName="cy" values="500;140" dur="3.1s" repeatCount="indefinite" begin="0.4s" />
                <animate attributeName="opacity" values="0;1;0" dur="3.1s" repeatCount="indefinite" begin="0.4s" />
              </circle>
              <circle cx="214" cy="520" r="2.9">
                <animate attributeName="cy" values="520;140" dur="2.3s" repeatCount="indefinite" begin="0.8s" />
                <animate attributeName="opacity" values="0;1;0" dur="2.3s" repeatCount="indefinite" begin="0.8s" />
              </circle>
              <circle cx="210" cy="540" r="2.2">
                <animate attributeName="cy" values="540;140" dur="2.9s" repeatCount="indefinite" begin="1.1s" />
                <animate attributeName="opacity" values="0;1;0" dur="2.9s" repeatCount="indefinite" begin="1.1s" />
              </circle>
            </g>
          </g>
        </g>

        <g transform="translate(210,128)">
          <circle r="10" fill="#cfd7e3" stroke="#b8c3d4" />
          <path id="pathL" d="M 0,0 C -35,24 -58,34 -70,46" fill="none" stroke="#1580ff" strokeWidth="2" markerEnd="url(#arrow)" opacity="0.35" />
          <path id="pathM" d="M 0,0 C 0,28 0,42 0,58" fill="none" stroke="#1580ff" strokeWidth="2" markerEnd="url(#arrow)" opacity="0.35" />
          <path id="pathR" d="M 0,0 C 35,24 58,34 70,46" fill="none" stroke="#1580ff" strokeWidth="2" markerEnd="url(#arrow)" opacity="0.35" />

          <use href="#drop">
            <animateMotion dur="1.6s" repeatCount="indefinite">
              <mpath href="#pathL" />
            </animateMotion>
          </use>
          <use href="#drop" transform="scale(0.9)">
            <animateMotion dur="1.5s" begin="0.25s" repeatCount="indefinite">
              <mpath href="#pathM" />
            </animateMotion>
          </use>
          <use href="#drop" transform="scale(1.05)">
            <animateMotion dur="1.6s" begin="0.5s" repeatCount="indefinite">
              <mpath href="#pathR" />
            </animateMotion>
          </use>
        </g>

        <g opacity="0.6">
          <path
            d="M120,462 C120,430 170,418 210,418 C250,418 300,430 300,462"
            fill="none"
            stroke="#1580ff"
            strokeWidth="3"
            markerEnd="url(#arrow)"
          >
            <animate
              attributeName="opacity"
              values="0.2;0.8;0.2"
              dur="2.8s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </g>
    </svg>
  );
}
