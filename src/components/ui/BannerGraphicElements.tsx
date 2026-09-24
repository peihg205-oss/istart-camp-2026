'use client';

import React from 'react';

// 3D Golden Star from the center of "iST★RT"
export function GoldenStar3D({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`${className} filter drop-shadow-[0_8px_16px_rgba(245,158,11,0.5)]`}>
      <defs>
        <linearGradient id="starGoldMain" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="35%" stopColor="#fde047" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="starGoldShade" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="starGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* 3D Star Shadow */}
      <polygon
        points="50,5 64,36 98,36 70,57 81,89 50,70 19,89 30,57 2,36 36,36"
        fill="#0f2b5c"
        transform="translate(0, 6)"
        opacity="0.8"
      />
      {/* 3D Bevel Facets */}
      <polygon points="50,5 64,36 50,50" fill="url(#starGoldMain)" />
      <polygon points="64,36 98,36 50,50" fill="url(#starGoldShade)" />
      <polygon points="98,36 70,57 50,50" fill="url(#starGoldMain)" />
      <polygon points="70,57 81,89 50,50" fill="url(#starGoldShade)" />
      <polygon points="81,89 50,70 50,50" fill="url(#starGoldMain)" />
      <polygon points="50,70 19,89 50,50" fill="url(#starGoldShade)" />
      <polygon points="19,89 30,57 50,50" fill="url(#starGoldMain)" />
      <polygon points="30,57 2,36 50,50" fill="url(#starGoldShade)" />
      <polygon points="2,36 36,36 50,50" fill="url(#starGoldMain)" />
      <polygon points="36,36 50,5 50,50" fill="url(#starGoldShade)" />
      {/* Center Shine */}
      <circle cx="50" cy="45" r="4" fill="#ffffff" opacity="0.9" filter="url(#starGlow)" />
    </svg>
  );
}

// 3D Yellow Puzzle Piece (from top-left of banner)
export function YellowPuzzlePiece({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`${className} filter drop-shadow-[0_10px_20px_rgba(234,179,8,0.45)]`}>
      <defs>
        <linearGradient id="puzzleYellow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>
      {/* 3D Depth Base */}
      <path
        d="M20,20 H40 C40,10 50,10 50,20 C50,20 60,10 60,20 H80 V40 C90,40 90,50 80,50 C90,50 90,60 80,60 V80 H60 C60,70 50,70 50,80 C50,70 40,70 40,80 H20 V60 C10,60 10,50 20,50 C10,50 10,40 20,40 Z"
        fill="#ca8a04"
        transform="translate(4, 6)"
      />
      {/* Main Jigsaw Face */}
      <path
        d="M20,20 H40 C40,10 50,10 50,20 C50,20 60,10 60,20 H80 V40 C90,40 90,50 80,50 C90,50 90,60 80,60 V80 H60 C60,70 50,70 50,80 C50,70 40,70 40,80 H20 V60 C10,60 10,50 20,50 C10,50 10,40 20,40 Z"
        fill="url(#puzzleYellow)"
        stroke="#fef9c3"
        strokeWidth="2.5"
      />
      {/* Gloss Highlight */}
      <path
        d="M23,24 H40 C42,15 48,15 48,22"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
    </svg>
  );
}

// 3D Blue Puzzle Piece (from bottom-right of banner)
export function BluePuzzlePiece({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`${className} filter drop-shadow-[0_10px_20px_rgba(29,78,216,0.35)]`}>
      <defs>
        <linearGradient id="puzzleBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      {/* 3D Depth */}
      <path
        d="M20,20 H40 C40,30 50,30 50,20 C50,30 60,30 60,20 H80 V40 C70,40 70,50 80,50 C70,50 70,60 80,60 V80 H60 C60,90 50,90 50,80 C50,90 40,90 40,80 H20 V60 C30,60 30,50 20,50 C30,50 30,40 20,40 Z"
        fill="#0c214d"
        transform="translate(4, 6)"
      />
      {/* Main Jigsaw */}
      <path
        d="M20,20 H40 C40,30 50,30 50,20 C50,30 60,30 60,20 H80 V40 C70,40 70,50 80,50 C70,50 70,60 80,60 V80 H60 C60,90 50,90 50,80 C50,90 40,90 40,80 H20 V60 C30,60 30,50 20,50 C30,50 30,40 20,40 Z"
        fill="url(#puzzleBlue)"
        stroke="#dbeafe"
        strokeWidth="2.5"
      />
      {/* Gloss Highlight */}
      <path
        d="M23,24 H38"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
    </svg>
  );
}

// 3D Blue Chess Knight Piece (from the banner podium)
export function ChessKnightPiece({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" className={`${className} filter drop-shadow-[0_12px_24px_rgba(29,78,216,0.35)]`}>
      <defs>
        <linearGradient id="knightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="40%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#0c214d" />
        </linearGradient>
        <linearGradient id="pedestalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      {/* Pedestal Base */}
      <ellipse cx="50" cy="108" rx="36" ry="8" fill="#0f172a" opacity="0.3" />
      <path d="M22,102 C22,96 78,96 78,102 L76,108 C76,112 24,112 24,108 Z" fill="url(#pedestalGradient)" />
      <ellipse cx="50" cy="102" rx="28" ry="5" fill="#dbeafe" />
      
      {/* Knight Body */}
      <path
        d="M32,98 C30,85 26,75 22,65 C18,55 24,35 34,25 C42,17 50,15 54,16 C58,17 62,24 64,28 C68,26 74,28 76,32 C78,36 74,42 70,45 C78,48 84,55 82,62 C80,68 70,72 68,76 C66,82 66,92 68,98 Z"
        fill="url(#knightGradient)"
        stroke="#eff6ff"
        strokeWidth="1.5"
      />
      {/* Mane Detail */}
      <path d="M36,25 C30,35 28,50 32,65" stroke="#bfdbfe" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
      {/* Eye */}
      <ellipse cx="64" cy="36" rx="3.5" ry="3.5" fill="#ffffff" />
      <circle cx="65" cy="35" r="1.5" fill="#1e3a8a" />
      {/* Snout */}
      <circle cx="76" cy="58" r="2.5" fill="#1e3a8a" />
      {/* Collar Tag */}
      <path d="M30,94 C42,98 58,98 70,94 L68,98 C56,102 44,102 32,98 Z" fill="#facc15" />
    </svg>
  );
}

// 3D iSER Dice / Cube with the 4 Values
export function ISerToyCube({ className = 'w-20 h-20' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={`${className} filter drop-shadow-[0_12px_24px_rgba(245,158,11,0.4)]`}>
      <defs>
        <linearGradient id="cubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="100%" stopColor="#fde047" />
        </linearGradient>
        <linearGradient id="cubeLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
        <linearGradient id="cubeRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>
      {/* Top Face */}
      <polygon points="60,15 105,38 60,60 15,38" fill="url(#cubeTop)" stroke="#fef08a" strokeWidth="1.5" />
      <text x="60" y="42" textAnchor="middle" fill="#0c214d" fontSize="11" fontWeight="900" transform="rotate(-5, 60, 42)">
        🌐 GLOBAL
      </text>

      {/* Left Face */}
      <polygon points="15,38 60,60 60,105 15,83" fill="url(#cubeLeft)" stroke="#facc15" strokeWidth="1.5" />
      <text x="38" y="76" textAnchor="middle" fill="#0c214d" fontSize="10" fontWeight="900">
        ⚡ DYNAMIC
      </text>

      {/* Right Face */}
      <polygon points="60,60 105,38 105,83 60,105" fill="url(#cubeRight)" stroke="#ca8a04" strokeWidth="1.5" />
      <text x="82" y="76" textAnchor="middle" fill="#0c214d" fontSize="9.5" fontWeight="900">
        💡 INNOVATIVE
      </text>
    </svg>
  );
}

// Ribbon Game Track (waving path from the banner)
export function GameJourneyRibbon() {
  return (
    <div className="w-full overflow-hidden pointer-events-none opacity-90 my-2">
      <svg viewBox="0 0 1000 80" fill="none" className="w-full h-12 sm:h-16">
        <path
          d="M0,45 Q150,10 300,45 T600,45 T900,45 T1000,45"
          stroke="#1d4ed8"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M0,45 Q150,10 300,45 T600,45 T900,45 T1000,45"
          stroke="#fbbf24"
          strokeWidth="10"
          strokeDasharray="40 25"
          strokeLinecap="round"
        />
        <circle cx="300" cy="45" r="7" fill="#ffffff" stroke="#1d4ed8" strokeWidth="3" />
        <circle cx="600" cy="45" r="7" fill="#ffffff" stroke="#f59e0b" strokeWidth="3" />
        <circle cx="900" cy="45" r="7" fill="#ffffff" stroke="#1d4ed8" strokeWidth="3" />
      </svg>
    </div>
  );
}
