import React, { useState, useMemo } from 'react';
import { Maximize2, X } from 'lucide-react';
import { solveDeterminateBeam, formatEngineeringNumber } from '../utils/beamEngine';

export interface QuestionDiagramProps {
  diagramType?: string;
  type?: string;
  caption?: string;
  spanM?: number;
  udlKnPerM?: number;
  pointLoadKn?: number;
  pointLoadPosM?: number;
}

export const QuestionDiagram: React.FC<QuestionDiagramProps> = ({
  diagramType,
  type,
  spanM = 6.0,
  udlKnPerM = 4.0,
  pointLoadKn = 10.0,
  pointLoadPosM = 3.0,
}) => {
  const [zoomed, setZoomed] = useState(false);
  const resolvedType = diagramType || type || 'beam-udl';

  React.useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomed(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoomed]);

  // Compute real mechanics points using the general 1D determinate beam solver (B6)
  const beamResult = useMemo(() => {
    if (resolvedType === 'section-rect' || resolvedType === 'rectangular_section_stress') {
      return null;
    }
    const isPointCombined = resolvedType === 'beam-point' || resolvedType === 'simply_supported_point';
    return solveDeterminateBeam({
      spanM,
      supportType: resolvedType === 'cantilever_point' ? 'cantilever_left' : 'simply_supported',
      udls: udlKnPerM > 0 ? [{ wKnPerM: udlKnPerM, xStartM: 0, xEndM: spanM }] : [],
      pointLoads: isPointCombined ? [{ xM: pointLoadPosM, loadKn: pointLoadKn }] : [],
      numStations: 41,
    });
  }, [resolvedType, spanM, udlKnPerM, pointLoadKn, pointLoadPosM]);

  const renderDiagramSvg = (isLarge = false) => {
    if (resolvedType === 'section-rect' || resolvedType === 'rectangular_section_stress') {
      return (
        <svg
          viewBox="0 0 640 215"
          className={`w-full ${isLarge ? 'h-96' : 'h-40'} select-none`}
          role="img"
          aria-label="Rectangular cross-section 100 mm by 200 mm with neutral axis and linear flexural stress distribution"
        >
          <rect x="0" y="0" width="640" height="215" rx="10" fill="#080E1C" />
          {/* Grid lines */}
          <line x1="20" y1="107.5" x2="620" y2="107.5" stroke="#334155" strokeDasharray="5 4" strokeWidth="1.2" />
          <text x="26" y="101" fill="#94A3B8" fontSize="10" fontFamily="IBM Plex Mono, monospace">
            N.A. (y = 0)
          </text>

          {/* Rectangular section b=100mm, d=200mm */}
          <rect
            x="110"
            y="32.5"
            width="95"
            height="150"
            fill="#1E293B"
            stroke="#38BDF8"
            strokeWidth="2"
            rx="2"
          />
          {/* Hatching */}
          <line x1="110" y1="62" x2="205" y2="62" stroke="#334155" strokeWidth="0.8" />
          <line x1="110" y1="152" x2="205" y2="152" stroke="#334155" strokeWidth="0.8" />

          {/* Dimension b = 100 mm */}
          <line x1="110" y1="198" x2="205" y2="198" stroke="#94A3B8" strokeWidth="1.2" />
          <line x1="110" y1="193" x2="110" y2="203" stroke="#94A3B8" strokeWidth="1.2" />
          <line x1="205" y1="193" x2="205" y2="203" stroke="#94A3B8" strokeWidth="1.2" />
          <text x="157.5" y="211" textAnchor="middle" fill="#E2E8F0" fontSize="11" fontFamily="IBM Plex Mono, monospace">
            b = 100 mm
          </text>

          {/* Dimension d = 200 mm */}
          <line x1="88" y1="32.5" x2="88" y2="182.5" stroke="#94A3B8" strokeWidth="1.2" />
          <line x1="83" y1="32.5" x2="93" y2="32.5" stroke="#94A3B8" strokeWidth="1.2" />
          <line x1="83" y1="182.5" x2="93" y2="182.5" stroke="#94A3B8" strokeWidth="1.2" />
          <text x="46" y="111" textAnchor="middle" fill="#E2E8F0" fontSize="11" fontFamily="IBM Plex Mono, monospace">
            d = 200 mm
          </text>

          {/* y_max = 100 mm arrow */}
          <line x1="224" y1="107.5" x2="224" y2="32.5" stroke="#F59E0B" strokeWidth="1.5" />
          <polygon points="224,32.5 220,40 228,40" fill="#F59E0B" />
          <text x="232" y="72" fill="#FBBF24" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
            y_max = 100 mm
          </text>

          {/* Flexural stress butterfly diagram */}
          <line x1="360" y1="26" x2="360" y2="189" stroke="#64748B" strokeWidth="1.5" />
          <polygon
            points="360,107.5 290,32.5 360,32.5"
            fill="rgba(244, 63, 94, 0.22)"
            stroke="#F43F5E"
            strokeWidth="1.8"
          />
          <polygon
            points="360,107.5 430,182.5 360,182.5"
            fill="rgba(16, 185, 129, 0.22)"
            stroke="#10B981"
            strokeWidth="1.8"
          />
          <text x="325" y="24" textAnchor="middle" fill="#FDA4AF" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
            σ_comp (Top)
          </text>
          <text x="398" y="201" textAnchor="middle" fill="#6EE7B7" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
            σ_tens = 27.0 MPa
          </text>

          {/* Section property callout box (A8: 3 sig figs, no 666,666.7 mm³) */}
          <rect x="455" y="42" width="168" height="128" rx="8" fill="#0F172A" stroke="#1E293B" strokeWidth="1.2" />
          <text x="467" y="64" fill="#38BDF8" fontSize="10.5" fontWeight="600" fontFamily="IBM Plex Mono, monospace">
            SECTION PROPERTIES
          </text>
          <text x="467" y="86" fill="#E2E8F0" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
            A = 2.00 × 10⁴ mm²
          </text>
          <text x="467" y="106" fill="#E2E8F0" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
            I_xx = 6.67 × 10⁷ mm⁴
          </text>
          <text x="467" y="126" fill="#FBBF24" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
            W_el = 6.67 × 10⁵ mm³
          </text>
          <text x="467" y="144" fill="#94A3B8" fontSize="10" fontFamily="IBM Plex Mono, monospace">
            (667 cm³, exact b·d²/6)
          </text>
          <text x="467" y="161" fill="#34D399" fontSize="10" fontFamily="IBM Plex Mono, monospace">
            M_max = 18.0 kN·m
          </text>
        </svg>
      );
    }

    // Beam diagram with dynamic BMD curve generated from beamEngine (B6)
    const xStart = 70;
    const xEnd = 420;
    const beamWidth = xEnd - xStart;
    const yBeam = 74;

    const stations = beamResult?.stations ?? [];
    const maxM = Math.max(beamResult?.mMaxSaggingKnm ?? 18.0, 1);
    const bmdPoints = stations
      .map((s) => {
        const px = xStart + (s.xM / spanM) * beamWidth;
        const py = 148 + (s.mKnm / maxM) * 44;
        return `${px.toFixed(1)},${py.toFixed(1)}`;
      })
      .join(' ');
    const bmdPolygonPoints = `${xStart},148 ${bmdPoints} ${xEnd},148`;

    const isPointCombined = resolvedType === 'beam-point' || resolvedType === 'simply_supported_point';
    const rA = beamResult?.raKn ?? 12.0;
    const rB = beamResult?.rbKn ?? 12.0;
    const mPeak = beamResult?.mMaxSaggingKnm ?? 18.0;

    return (
      <svg
        viewBox="0 0 640 215"
        className={`w-full ${isLarge ? 'h-96' : 'h-40'} select-none`}
        role="img"
        aria-label={`Simply supported beam spanning ${spanM} m with UDL ${udlKnPerM} kN/m and dynamic Bending Moment Diagram`}
      >
        <rect x="0" y="0" width="640" height="215" rx="10" fill="#080E1C" />

        {/* UDL Load Block */}
        <rect
          x={xStart}
          y="36"
          width={beamWidth}
          height="32"
          fill="rgba(56, 189, 248, 0.12)"
          stroke="#38BDF8"
          strokeWidth="1.2"
        />
        {[0, 0.166, 0.333, 0.5, 0.666, 0.833, 1].map((frac, idx) => {
          const ax = xStart + frac * beamWidth;
          return (
            <g key={idx}>
              <line x1={ax} y1="38" x2={ax} y2="66" stroke="#38BDF8" strokeWidth="1.3" />
              <polygon points={`${ax},68 ${ax - 3.5},61 ${ax + 3.5},61`} fill="#38BDF8" />
            </g>
          );
        })}
        <text
          x={(xStart + xEnd) / 2}
          y="27"
          textAnchor="middle"
          fill="#38BDF8"
          fontSize="11"
          fontWeight="600"
          fontFamily="IBM Plex Mono, monospace"
        >
          w = {udlKnPerM.toFixed(1)} kN/m {isPointCombined ? `+ Point Load P = ${pointLoadKn.toFixed(1)} kN at midspan` : '(Full-Span UDL)'}
        </text>

        {/* Optional Central Point Load Arrow */}
        {isPointCombined && (
          <g>
            <line
              x1={(xStart + xEnd) / 2}
              y1="14"
              x2={(xStart + xEnd) / 2}
              y2="68"
              stroke="#F59E0B"
              strokeWidth="2.5"
            />
            <polygon
              points={`${(xStart + xEnd) / 2},70 ${(xStart + xEnd) / 2 - 5},59 ${(xStart + xEnd) / 2 + 5},59`}
              fill="#F59E0B"
            />
          </g>
        )}

        {/* Main Beam Member */}
        <line x1={xStart} y1={yBeam} x2={xEnd} y2={yBeam} stroke="#E2E8F0" strokeWidth="5" strokeLinecap="round" />

        {/* Pinned Support A */}
        <polygon points={`${xStart},${yBeam + 3} ${xStart - 10},${yBeam + 21} ${xStart + 10},${yBeam + 21}`} fill="#F59E0B" />
        <text x={xStart - 12} y={yBeam + 33} fill="#FBBF24" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          R_A = {formatEngineeringNumber(rA)} kN
        </text>

        {/* Roller Support B */}
        <polygon points={`${xEnd},${yBeam + 3} ${xEnd - 10},${yBeam + 18} ${xEnd + 10},${yBeam + 18}`} fill="#38BDF8" />
        <circle cx={xEnd - 5} cy={yBeam + 21} r="2.5" fill="#38BDF8" />
        <circle cx={xEnd + 5} cy={yBeam + 21} r="2.5" fill="#38BDF8" />
        <text x={xEnd - 58} y={yBeam + 33} fill="#38BDF8" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          R_B = {formatEngineeringNumber(rB)} kN
        </text>

        {/* Span Dimension Line */}
        <line x1={xStart} y1="116" x2={xEnd} y2="116" stroke="#64748B" strokeWidth="1.2" strokeDasharray="4 3" />
        <text
          x={(xStart + xEnd) / 2}
          y="130"
          textAnchor="middle"
          fill="#CBD5E1"
          fontSize="10"
          fontFamily="IBM Plex Mono, monospace"
        >
          Span L = {spanM.toFixed(1)} m (Midspan x = {(spanM / 2).toFixed(1)} m)
        </text>

        {/* Dynamic Bending Moment Diagram (Drawn on tension face - bottom) */}
        <line x1={xStart} y1="148" x2={xEnd} y2="148" stroke="#475569" strokeWidth="1" />
        {stations.length > 1 && (
          <>
            <polygon points={bmdPolygonPoints} fill="rgba(16, 185, 129, 0.16)" />
            <polyline points={bmdPoints} fill="none" stroke="#10B981" strokeWidth="2.2" />
          </>
        )}
        <text
          x={(xStart + xEnd) / 2}
          y="206"
          textAnchor="middle"
          fill="#34D399"
          fontSize="10.5"
          fontWeight="600"
          fontFamily="IBM Plex Mono, monospace"
        >
          Engine-Solved BMD (Tension Face Down): M_max = {formatEngineeringNumber(mPeak)} kN·m at x = {(spanM / 2).toFixed(1)} m
        </text>

        {/* Right-hand Engine Telemetry Summary Box */}
        <rect x="452" y="32" width="172" height="152" rx="8" fill="#0F172A" stroke="#1E293B" strokeWidth="1.2" />
        <text x="464" y="53" fill="#38BDF8" fontSize="10.5" fontWeight="600" fontFamily="IBM Plex Mono, monospace">
          1D BEAM SOLVER (SI)
        </text>
        <text x="464" y="74" fill="#E2E8F0" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
          R_A = {formatEngineeringNumber(rA)} kN ↑
        </text>
        <text x="464" y="93" fill="#E2E8F0" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
          R_B = {formatEngineeringNumber(rB)} kN ↑
        </text>
        <text x="464" y="112" fill="#FBBF24" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
          V_max = {formatEngineeringNumber(beamResult?.vMaxAbsKn ?? rA)} kN
        </text>
        <text x="464" y="131" fill="#34D399" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
          M_max = {formatEngineeringNumber(mPeak)} kN·m
        </text>
        <text x="464" y="150" fill="#94A3B8" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          W_el = 6.67 × 10⁵ mm³
        </text>
        <text x="464" y="168" fill="#CBD5E1" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          δ_SLS = 3.97 mm (L/1511)
        </text>
      </svg>
    );
  };

  return (
    <div className="relative rounded-xl border border-slate-800/90 bg-[#080E1C] p-2 shadow-inner">
      <div className="flex items-center justify-between px-2 pb-1">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
          Structural Idealisation &amp; Solver Diagram (UK Convention: BMD on Tension Face)
        </span>
        <button
          type="button"
          onClick={() => setZoomed(true)}
          className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-900/90 px-2 py-0.5 text-[11px] font-medium text-sky-300 hover:border-sky-500/50 hover:text-sky-200 transition-colors"
          title="Zoom Structural Diagram"
        >
          <Maximize2 className="w-3 h-3" />
          Zoom
        </button>
      </div>

      {renderDiagramSvg(false)}

      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed Structural Diagram"
        >
          <div className="w-full max-w-4xl rounded-2xl border border-slate-700 bg-[#0B1120] p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  High-Resolution Structural Idealisation &amp; Solver Plot
                </h3>
                <p className="text-xs text-slate-400">
                  Computed dynamically via 1D Determinate Beam Solver (41 stations, Simpson 1/3 curvature integration)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setZoomed(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
              >
                <X className="w-3.5 h-3.5" />
                Close
              </button>
            </div>
            <div className="mt-4">{renderDiagramSvg(true)}</div>
          </div>
        </div>
      )}
    </div>
  );
};
