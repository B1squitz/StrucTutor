import React, { useState } from 'react';
import { ZoomIn, X } from 'lucide-react';
import { QuestionSpec } from '../utils/tutorEngine';

interface QuestionDiagramProps {
  diagramType: QuestionSpec['diagramType'];
  caption: string;
}

export const QuestionDiagram: React.FC<QuestionDiagramProps> = ({
  diagramType,
  caption,
}) => {
  const [zoomed, setZoomed] = useState(false);

  const renderSvg = (isModal: boolean) => {
    const heightClass = isModal ? 'w-full max-h-[460px]' : 'w-full max-h-[230px]';

    switch (diagramType) {
      case 'unit-bridge':
        return (
          <svg
            viewBox="0 0 640 220"
            className={heightClass}
            role="img"
            aria-label="Bending moment unit conversion bridge from 5 kN·m to 5,000,000 N·mm"
          >
            <rect x="8" y="8" width="624" height="204" rx="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* Left Box: 5 kN·m */}
            <rect x="36" y="55" width="160" height="96" rx="10" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2" />
            <text x="116" y="88" textAnchor="middle" fill="#1E3A8A" fontSize="13" fontWeight="600">
              APPLIED MOMENT
            </text>
            <text x="116" y="122" textAnchor="middle" fill="#1D4ED8" fontSize="22" fontWeight="700" fontFamily="monospace">
              M = 5 kN·m
            </text>

            {/* Top & Bottom Multiplier Bridges */}
            <path d="M 196 82 C 255 35, 365 35, 424 82" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeDasharray="5 3" />
            <rect x="242" y="24" width="140" height="32" rx="6" fill="#DBEAFE" stroke="#3B82F6" />
            <text x="312" y="45" textAnchor="middle" fill="#1E40AF" fontSize="13" fontWeight="700" fontFamily="monospace">
              1 kN = 1,000 N (×10³)
            </text>

            <path d="M 196 125 C 255 172, 365 172, 424 125" fill="none" stroke="#059669" strokeWidth="2.5" strokeDasharray="5 3" />
            <rect x="242" y="152" width="140" height="32" rx="6" fill="#D1FAE5" stroke="#10B981" />
            <text x="312" y="173" textAnchor="middle" fill="#065F46" fontSize="13" fontWeight="700" fontFamily="monospace">
              1 m = 1,000 mm (×10³)
            </text>

            {/* Right Box: Target N·mm */}
            <rect x="424" y="55" width="180" height="96" rx="10" fill="#ECFDF5" stroke="#059669" strokeWidth="2" />
            <text x="514" y="88" textAnchor="middle" fill="#065F46" fontSize="13" fontWeight="600">
              BASE (mm, N) SYSTEM
            </text>
            <text x="514" y="120" textAnchor="middle" fill="#047857" fontSize="18" fontWeight="700" fontFamily="monospace">
              5 × 10⁶ N·mm
            </text>
          </svg>
        );

      case 'pressure-pad':
        return (
          <svg
            viewBox="0 0 640 220"
            className={heightClass}
            role="img"
            aria-label="Floor slab panel 1m by 1m under 25 kN/m² surface pressure"
          >
            <rect x="8" y="8" width="624" height="204" rx="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* Isometric Slab Panel */}
            <polygon
              points="190,65 340,40 440,95 290,120"
              fill="#DBEAFE"
              stroke="#2563EB"
              strokeWidth="2.2"
            />
            <polygon
              points="190,65 290,120 290,145 190,90"
              fill="#93C5FD"
              stroke="#2563EB"
              strokeWidth="2"
            />
            <polygon
              points="290,120 440,95 440,120 290,145"
              fill="#60A5FA"
              stroke="#2563EB"
              strokeWidth="2"
            />
            {/* Downward Pressure Arrows */}
            {[240, 290, 340, 385].map((x, idx) => (
              <g key={idx}>
                <line x1={x} y1={22} x2={x} y2={62} stroke="#DC2626" strokeWidth="2.5" />
                <polygon points={`${x - 5},58 ${x + 5},58 ${x},68`} fill="#DC2626" />
              </g>
            ))}
            <text x="315" y="20" textAnchor="middle" fill="#B91C1C" fontSize="13" fontWeight="700" fontFamily="monospace">
              q = 25 kN/m² = 25,000 N per (1,000 mm × 1,000 mm)
            </text>
            <text x="210" y="172" fill="#1E293B" fontSize="13" fontWeight="600" fontFamily="monospace">
              Area = 1 m × 1 m = 1,000,000 mm² (10⁶ mm²)
            </text>
            <text x="210" y="194" fill="#047857" fontSize="13" fontWeight="700" fontFamily="monospace">
              Stress in N/mm² = 25,000 N ÷ 1,000,000 mm²
            </text>
          </svg>
        );

      case 'beam-bending-2a':
      case 'beam-bending-remedial': {
        const isRem = diagramType === 'beam-bending-remedial';
        const mLabel = isRem ? 'M = 10 kN·m' : 'M = 18 kN·m';
        const wLabel = isRem ? 'Wₑₗ = 500,000 mm³' : 'Wₑₗ = 666,666.7 mm³';
        return (
          <svg
            viewBox="0 0 640 230"
            className={heightClass}
            role="img"
            aria-label={`Simply supported steel beam with ${mLabel} and I-section ${wLabel}`}
          >
            <rect x="8" y="8" width="624" height="214" rx="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />

            {/* Left Zone: Simply Supported Beam in Sagging Bending */}
            <text x="195" y="34" textAnchor="middle" fill="#0F172A" fontSize="13" fontWeight="700">
              1. Positive Sagging Moment ({mLabel})
            </text>
            {/* Beam body */}
            <rect x="55" y="86" width="280" height="24" rx="3" fill="#CBD5E1" stroke="#334155" strokeWidth="2" />
            {/* Dashed deflected curve */}
            <path d="M 55 110 Q 195 148 335 110" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeDasharray="6 4" />
            {/* Pin Support Left */}
            <polygon points="55,110 43,132 67,132" fill="#475569" />
            <line x1="37" y1="134" x2="73" y2="134" stroke="#64748B" strokeWidth="2" />
            {/* Roller Support Right */}
            <polygon points="335,110 323,128 347,128" fill="#475569" />
            <circle cx="329" cy="133" r="3.5" fill="#475569" />
            <circle cx="341" cy="133" r="3.5" fill="#475569" />
            <line x1="317" y1="138" x2="353" y2="138" stroke="#64748B" strokeWidth="2" />

            {/* Moment arrows & labels */}
            <path d="M 40 72 A 24 24 0 0 1 70 72" fill="none" stroke="#DC2626" strokeWidth="2.5" />
            <polygon points="70,72 63,66 66,76" fill="#DC2626" />
            <path d="M 350 72 A 24 24 0 0 0 320 72" fill="none" stroke="#DC2626" strokeWidth="2.5" />
            <polygon points="320,72 327,66 324,76" fill="#DC2626" />

            <text x="195" y="75" textAnchor="middle" fill="#B91C1C" fontSize="15" fontWeight="700" fontFamily="monospace">
              {mLabel}
            </text>
            <text x="195" y="162" textAnchor="middle" fill="#1D4ED8" fontSize="12" fontWeight="600">
              Bottom flange in tension (+σ) • Top flange in compression (−σ)
            </text>
            <text x="195" y="185" textAnchor="middle" fill="#64748B" fontSize="11" fontStyle="italic">
              Not drawn to scale
            </text>

            {/* Divider */}
            <line x1="388" y1="26" x2="388" y2="200" stroke="#E2E8F0" strokeWidth="1.5" />

            {/* Right Zone: Steel I-Section */}
            <text x="510" y="34" textAnchor="middle" fill="#0F172A" fontSize="13" fontWeight="700">
              2. Steel I-Section Modulus
            </text>
            {/* Top Flange */}
            <rect x="462" y="54" width="96" height="14" fill="#1E40AF" />
            {/* Web */}
            <rect x="503" y="68" width="14" height="72" fill="#3B82F6" />
            {/* Bottom Flange */}
            <rect x="462" y="140" width="96" height="14" fill="#1E40AF" />
            {/* Neutral Axis */}
            <line x1="442" y1="104" x2="578" y2="104" stroke="#059669" strokeWidth="1.8" strokeDasharray="4 3" />
            <text x="584" y="108" fill="#065F46" fontSize="11" fontWeight="700" fontFamily="monospace">
              N.A.
            </text>

            <rect x="424" y="168" width="172" height="34" rx="6" fill="#EFF6FF" stroke="#93C5FD" />
            <text x="510" y="190" textAnchor="middle" fill="#1E3A8A" fontSize="13" fontWeight="700" fontFamily="monospace">
              {wLabel}
            </text>
          </svg>
        );
      }

      case 'beam-bending-2b':
        return (
          <svg
            viewBox="0 0 640 220"
            className={heightClass}
            role="img"
            aria-label="Cantilever steel beam with fixed support hogging moment M = 45 kN·m and W_el = 250,000 mm³"
          >
            <rect x="8" y="8" width="624" height="204" rx="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* Fixed wall on left */}
            <rect x="64" y="42" width="18" height="136" fill="#475569" />
            {/* Cantilever beam */}
            <rect x="82" y="92" width="280" height="24" fill="#CBD5E1" stroke="#334155" strokeWidth="2" />
            {/* Tip point load */}
            <line x1="354" y1="42" x2="354" y2="88" stroke="#DC2626" strokeWidth="3" />
            <polygon points="348,84 360,84 354,92" fill="#DC2626" />
            <text x="354" y="36" textAnchor="middle" fill="#B91C1C" fontSize="13" fontWeight="700" fontFamily="monospace">
              Root Hogging M = 45 kN·m
            </text>
            {/* Hogging curve */}
            <path d="M 82 104 Q 230 106 360 144" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeDasharray="5 3" />
            {/* Right text box */}
            <rect x="410" y="60" width="196" height="100" rx="10" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.8" />
            <text x="508" y="92" textAnchor="middle" fill="#1E3A8A" fontSize="13" fontWeight="700">
              CANTILEVER ROOT CHECK
            </text>
            <text x="508" y="118" textAnchor="middle" fill="#1D4ED8" fontSize="15" fontWeight="700" fontFamily="monospace">
              M = 45 kN·m
            </text>
            <text x="508" y="142" textAnchor="middle" fill="#047857" fontSize="14" fontWeight="700" fontFamily="monospace">
              Wₑₗ = 250,000 mm³
            </text>
          </svg>
        );

      case 'beam-section-2c':
        return (
          <svg
            viewBox="0 0 640 220"
            className={heightClass}
            role="img"
            aria-label="Timber beam cross-section sizing with M = 24 kN·m and allowable stress 16 MPa"
          >
            <rect x="8" y="8" width="624" height="204" rx="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* Rectangular Timber Section */}
            <rect x="110" y="42" width="90" height="136" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="2.5" />
            <line x1="90" y1="110" x2="220" y2="110" stroke="#059669" strokeWidth="1.8" strokeDasharray="4 3" />
            <text x="155" y="104" textAnchor="middle" fill="#92400E" fontSize="12" fontWeight="700">
              Timber Section
            </text>
            <text x="155" y="128" textAnchor="middle" fill="#B45309" fontSize="13" fontWeight="700" fontFamily="monospace">
              Wₑₗ = bd²/6
            </text>

            {/* Formula Rearrangement Box */}
            <rect x="265" y="50" width="330" height="120" rx="10" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1.8" />
            <text x="430" y="82" textAnchor="middle" fill="#1E3A8A" fontSize="14" fontWeight="700">
              SECTION SIZING EQUATION
            </text>
            <text x="430" y="114" textAnchor="middle" fill="#1D4ED8" fontSize="17" fontWeight="700" fontFamily="monospace">
              Wₑₗ,req = M ÷ σₘₐₓ
            </text>
            <text x="430" y="144" textAnchor="middle" fill="#065F46" fontSize="13" fontWeight="700" fontFamily="monospace">
              M = 24 kN·m • σₘₐₓ = 16 N/mm²
            </text>
          </svg>
        );

      case 'axial-tie-3':
        return (
          <svg
            viewBox="0 0 640 220"
            className={heightClass}
            role="img"
            aria-label="Steel tie bar under axial tension F = 180 kN with cross-sectional area A = 1,200 mm²"
          >
            <rect x="8" y="8" width="624" height="204" rx="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* Steel Tie Bar */}
            <rect x="150" y="82" width="340" height="44" rx="4" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="2.2" />
            {/* Left Pull Arrow */}
            <line x1="150" y1="104" x2="72" y2="104" stroke="#DC2626" strokeWidth="3.5" />
            <polygon points="76,97 76,111 62,104" fill="#DC2626" />
            <text x="105" y="72" textAnchor="middle" fill="#B91C1C" fontSize="15" fontWeight="700" fontFamily="monospace">
              F = 180 kN
            </text>
            {/* Right Pull Arrow */}
            <line x1="490" y1="104" x2="568" y2="104" stroke="#DC2626" strokeWidth="3.5" />
            <polygon points="564,97 564,111 578,104" fill="#DC2626" />
            <text x="535" y="72" textAnchor="middle" fill="#B91C1C" fontSize="15" fontWeight="700" fontFamily="monospace">
              F = 180 kN
            </text>
            {/* Section Cut */}
            <line x1="320" y1="64" x2="320" y2="144" stroke="#059669" strokeWidth="2.5" strokeDasharray="5 3" />
            <text x="320" y="168" textAnchor="middle" fill="#065F46" fontSize="14" fontWeight="700" fontFamily="monospace">
              Net Area A = 1,200 mm² • σ = F / A
            </text>
          </svg>
        );

      case 'line-load-4':
        return (
          <svg
            viewBox="0 0 640 220"
            className={heightClass}
            role="img"
            aria-label="Uniform distributed line load w = 12.5 kN/m equals 12.5 N/mm"
          >
            <rect x="8" y="8" width="624" height="204" rx="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* UDL block */}
            <rect x="90" y="58" width="460" height="36" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1.5" />
            {[110, 180, 250, 320, 390, 460, 530].map((x) => (
              <g key={x}>
                <line x1={x} y1={58} x2={x} y2={92} stroke="#DC2626" strokeWidth="2" />
                <polygon points={`${x - 4},88 ${x + 4},88 ${x},95`} fill="#DC2626" />
              </g>
            ))}
            <text x="320" y="46" textAnchor="middle" fill="#B91C1C" fontSize="15" fontWeight="700" fontFamily="monospace">
              Uniform Line Load w = 12.5 kN/m
            </text>
            {/* Beam */}
            <rect x="90" y="96" width="460" height="20" fill="#CBD5E1" stroke="#334155" strokeWidth="2" />
            <polygon points="90,116 78,136 102,136" fill="#475569" />
            <line x1="72" y1="138" x2="108" y2="138" stroke="#64748B" strokeWidth="2" />
            <polygon points="550,116 538,136 562,136" fill="#475569" />
            <line x1="532" y1="138" x2="568" y2="138" stroke="#64748B" strokeWidth="2" />
            <text x="320" y="168" textAnchor="middle" fill="#1E3A8A" fontSize="14" fontWeight="700" fontFamily="monospace">
              1 kN / 1 m = 1,000 N ÷ 1,000 mm = 1 N/mm
            </text>
          </svg>
        );

      case 'combined-stress-5a':
        return (
          <svg
            viewBox="0 0 640 220"
            className={heightClass}
            role="img"
            aria-label="Simply supported beam span L = 4.0 m under w = 9.0 kN/m with midspan M = 18.0 kN·m and W_el = 400,000 mm³"
          >
            <rect x="8" y="8" width="624" height="204" rx="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* UDL on beam */}
            <rect x="60" y="48" width="300" height="26" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1.5" />
            <text x="210" y="38" textAnchor="middle" fill="#B91C1C" fontSize="13" fontWeight="700" fontFamily="monospace">
              w = 9.0 kN/m over Span L = 4.0 m
            </text>
            <rect x="60" y="74" width="300" height="18" fill="#CBD5E1" stroke="#334155" strokeWidth="2" />
            {/* Parabola BMD */}
            <path d="M 60 112 Q 210 182 360 112 Z" fill="#DBEAFE" fillOpacity="0.65" stroke="#2563EB" strokeWidth="2.2" />
            <text x="210" y="166" textAnchor="middle" fill="#1E3A8A" fontSize="13" fontWeight="700" fontFamily="monospace">
              Mₘₐₓ = wL²/8 = 18.0 kN·m
            </text>

            {/* Right Section Properties Card */}
            <rect x="396" y="48" width="212" height="132" rx="10" fill="#ECFDF5" stroke="#059669" strokeWidth="1.8" />
            <text x="502" y="78" textAnchor="middle" fill="#065F46" fontSize="13" fontWeight="700">
              MIDSPAN STRESS CHECK
            </text>
            <text x="502" y="108" textAnchor="middle" fill="#047857" fontSize="14" fontWeight="700" fontFamily="monospace">
              Mₘₐₓ = 18.0 kN·m
            </text>
            <text x="502" y="134" textAnchor="middle" fill="#047857" fontSize="14" fontWeight="700" fontFamily="monospace">
              Wₑₗ = 400,000 mm³
            </text>
            <text x="502" y="160" textAnchor="middle" fill="#1E3A8A" fontSize="13" fontWeight="700" fontFamily="monospace">
              Find σ = Mₘₐₓ / Wₑₗ
            </text>
          </svg>
        );

      case 'simply-supported-point-load': {
        const beamLeft = 110;
        const beamRight = 510;
        const beamY = 115;
        const loadX = beamLeft + ((beamRight - beamLeft) * 2) / 6;
        return (
          <svg
            viewBox="0 0 640 230"
            className={heightClass}
            role="img"
            aria-label="Simply supported beam span L = 6.0 m with point load P = 24 kN at x = 2.0 m"
          >
            <rect x="8" y="8" width="624" height="214" rx="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            <rect x={beamLeft} y={beamY - 7} width={beamRight - beamLeft} height="14" rx="2" fill="#CBD5E1" stroke="#334155" strokeWidth="2" />
            <polygon points={`${beamLeft},${beamY + 7} ${beamLeft - 14},${beamY + 32} ${beamLeft + 14},${beamY + 32}`} fill="#475569" />
            <line x1={beamLeft - 20} y1={beamY + 34} x2={beamLeft + 20} y2={beamY + 34} stroke="#64748B" strokeWidth="2" />
            <text x={beamLeft} y={beamY + 50} textAnchor="middle" fill="#0F172A" fontSize="12" fontWeight="700" fontFamily="monospace">
              A (Pin)
            </text>
            <circle cx={beamRight} cy={beamY + 18} r="10" fill="#475569" />
            <line x1={beamRight - 20} y1={beamY + 30} x2={beamRight + 20} y2={beamY + 30} stroke="#64748B" strokeWidth="2" />
            <text x={beamRight} y={beamY + 50} textAnchor="middle" fill="#0F172A" fontSize="12" fontWeight="700" fontFamily="monospace">
              B (Roller)
            </text>
            <line x1={loadX} y1={beamY - 58} x2={loadX} y2={beamY - 12} stroke="#DC2626" strokeWidth="3" />
            <polygon points={`${loadX - 6},${beamY - 18} ${loadX},${beamY - 8} ${loadX + 6},${beamY - 18}`} fill="#DC2626" />
            <text x={loadX} y={beamY - 66} textAnchor="middle" fill="#B91C1C" fontSize="13" fontWeight="700" fontFamily="monospace">
              P = 24 kN
            </text>
            <line x1={beamLeft} y1={beamY + 72} x2={loadX} y2={beamY + 72} stroke="#64748B" strokeWidth="1.5" />
            <text x={(beamLeft + loadX) / 2} y={beamY + 88} textAnchor="middle" fill="#334155" fontSize="12" fontFamily="monospace">
              2.0 m
            </text>
            <line x1={loadX} y1={beamY + 72} x2={beamRight} y2={beamY + 72} stroke="#64748B" strokeWidth="1.5" />
            <text x={(loadX + beamRight) / 2} y={beamY + 88} textAnchor="middle" fill="#334155" fontSize="12" fontFamily="monospace">
              4.0 m
            </text>
          </svg>
        );
      }

      case 'wall-roller-support':
        return (
          <svg
            viewBox="0 0 640 220"
            className={heightClass}
            role="img"
            aria-label="Ideal roller resting against a smooth vertical wall"
          >
            <rect x="8" y="8" width="624" height="204" rx="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            <line x1="440" y1="45" x2="440" y2="185" stroke="#334155" strokeWidth="3" />
            {[55, 75, 95, 115, 135, 155, 175].map((y) => (
              <line key={y} x1="440" y1={y} x2="456" y2={y - 12} stroke="#64748B" strokeWidth="1.5" />
            ))}
            <text x="468" y="118" fill="#334155" fontSize="12" fontWeight="600" fontFamily="monospace">
              Smooth Vertical Wall
            </text>
            <rect x="140" y="108" width="274" height="16" rx="2" fill="#CBD5E1" stroke="#2563EB" strokeWidth="2" />
            <circle cx="426" cy="116" r="12" fill="#FEF3C7" stroke="#D97706" strokeWidth="2.5" />
            <line x1="340" y1="162" x2="425" y2="162" stroke="#059669" strokeWidth="2.5" />
            <polygon points="348,157 336,162 348,167" fill="#059669" />
            <text x="270" y="185" fill="#065F46" fontSize="12" fontWeight="600" fontFamily="monospace">
              Rₓ normal to wall (Horizontal only)
            </text>
          </svg>
        );
    }
  };

  return (
    <div className="my-4">
      <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 flex flex-col items-center">
        {renderSvg(false)}
        <div className="mt-2.5 w-full flex flex-wrap items-center justify-between gap-2 px-1">
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {caption}
          </span>
          <button
            type="button"
            onClick={() => setZoomed(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Zoom</span>
          </button>
        </div>
      </div>

      {/* Sparx-style Diagram Zoom Lightbox Modal */}
      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged structural engineering diagram"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-6"
          onClick={() => setZoomed(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Structural Diagram Inspector
              </h3>
              <button
                type="button"
                onClick={() => setZoomed(false)}
                aria-label="Close diagram zoom modal"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
            <div className="p-2">{renderSvg(true)}</div>
            <p className="text-sm text-center text-slate-600 dark:text-slate-300">
              {caption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
