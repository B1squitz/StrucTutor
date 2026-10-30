"""
Deterministic, GUI-independent structural mechanics solvers for Modules 0–6 worked examples.

Architectural Safeguards (Milestone 2 Requirements #3, #4, #5):
- Every solver is pure Python with zero GUI dependencies.
- Every solver states explicit physical units, engineering assumptions, and sign conventions.
- Every solver validates inputs (rejecting non-finite, zero/negative dimensions or spans, out-of-bounds
  load positions, or invalid unit strings) with clear ValueError or DimensionalError exceptions.
- Every solver performs an independent check using a genuinely different calculation method
  (e.g., moment about opposite support, shear-area integration, numerical quadrature, energy/work
  equivalence, bounding-box void subtraction, or slenderness/radius-of-gyration formulation).
- Module 4 Example 4.3 (UB Major vs Minor Axis) is explicitly flagged as
  REFERENCE_VERIFICATION_REQUIRED because exact Universal Beam section properties require a
  controlled SCI / BS EN 10365 table; mathematical relationships (Z = I / y_max, sigma = M / Z,
  and major/minor ratios) are verified from supplied or user-entered geometric properties.
"""

from __future__ import annotations

from dataclasses import dataclass, field
import math
from typing import Any, Callable, Dict, List, Optional, Tuple

from structtutor.domain.syllabus import (
    DEFAULT_EDUCATIONAL_DISCLAIMER,
    ReferenceVerificationStatus,
)
from structtutor.domain.units import DimensionalError, convert_value


@dataclass(frozen=True)
class IndependentCheckTrace:
    """Record of an independent check performed via a genuinely different calculation method."""

    method_name: str
    passed: bool
    primary_metric: float
    check_metric: float
    unit: str
    rel_discrepancy: float
    steps: Tuple[str, ...]


@dataclass(frozen=True)
class WorkedExampleSolution:
    """Complete deterministic solution trace for a syllabus worked example."""

    example_id: str
    module_number: int
    title: str
    problem_statement: str
    assumptions: Tuple[str, ...]
    sign_convention: str
    inputs: Dict[str, Any]
    intermediate_steps: Tuple[str, ...]
    results: Dict[str, float]
    result_units: Dict[str, str]
    primary_answer: float
    primary_unit: str
    independent_check: IndependentCheckTrace
    engineering_interpretation: str
    reference_verification_status: str = (
        ReferenceVerificationStatus.NOT_REQUIRED_FIRST_PRINCIPLES.value
    )
    reference_verification_note: str = (
        "Closed-form classical mechanics derivation verified via independent second method."
    )
    educational_disclaimer: str = DEFAULT_EDUCATIONAL_DISCLAIMER
    portfolio_category: str = ""


def _require_finite(name: str, val: float) -> float:
    if isinstance(val, bool) or not isinstance(val, (int, float)) or not math.isfinite(float(val)):
        raise ValueError(f"Parameter '{name}' must be a finite real number; got {val!r}.")
    return float(val)


def _require_positive(name: str, val: float) -> float:
    v = _require_finite(name, val)
    if v <= 0.0:
        raise ValueError(f"Parameter '{name}' must be strictly positive (> 0); got {v}.")
    return v


def _simpson_integrate(fn: Callable[[float], float], a: float, b: float, n: int = 200) -> float:
    """Composite Simpson's 1/3 rule numerical quadrature for independent integral checks."""
    if n <= 0 or n % 2 != 0:
        n = 200
    h = (b - a) / n
    total = fn(a) + fn(b)
    for i in range(1, n):
        x = a + i * h
        total += (4.0 if i % 2 == 1 else 2.0) * fn(x)
    return total * h / 3.0


# ==============================================================================
# MODULE 0 — Engineering Maths, Units & Physical Intuition
# ==============================================================================


def solve_ex_0_1_unit_conversions(
    e_gpa: float = 200.0,
    q_kpa: float = 25.0,
    m_knm: float = 5.0,
    w_kn_per_m: float = 7.5,
) -> WorkedExampleSolution:
    """
    Example 0.1: Convert 200 GPa to N/mm², 25 kN/m² to N/mm², 5 kNm to Nmm, and 7.5 kN/m to N/mm.
    Independent Check: Dimensional work/stress identity in base (mm, N) vs (m, kN) systems.
    """
    e_val = _require_positive("e_gpa", e_gpa)
    q_val = _require_positive("q_kpa", q_kpa)
    m_val = _require_positive("m_knm", m_knm)
    w_val = _require_positive("w_kn_per_m", w_kn_per_m)

    e_n_mm2 = convert_value(e_val, "GPa", "N/mm²")
    q_n_mm2 = convert_value(q_val, "kN/m²", "N/mm²")
    m_nmm = convert_value(m_val, "kNm", "Nmm")
    w_n_mm = convert_value(w_val, "kN/m", "N/mm")

    # Independent check: Dimensionless strain/work invariant check across SI (m, N) vs Engineering (mm, N)
    # In SI: (M [N*m] * w [N/m]) / (E [N/m^2] * q [N/m^2] * 1 m^4) must equal
    # in (mm, N): (M [N*mm] * w [N/mm]) / (E [N/mm^2] * q [N/mm^2] * (1000 mm)^4)
    si_numerator = (m_val * 1e3) * (w_val * 1e3)
    si_denominator = (e_val * 1e9) * (q_val * 1e3) * (1.0**4)
    invariant_si = si_numerator / si_denominator

    mm_numerator = m_nmm * w_n_mm
    mm_denominator = e_n_mm2 * q_n_mm2 * (1000.0**4)
    invariant_mm = mm_numerator / mm_denominator

    rel_err = abs(invariant_si - invariant_mm) / max(abs(invariant_si), 1e-30)
    check = IndependentCheckTrace(
        method_name="Dimensionless Buckingham Pi Invariant across (m, N) and (mm, N) Systems",
        passed=rel_err < 1e-12,
        primary_metric=invariant_mm,
        check_metric=invariant_si,
        unit="-",
        rel_discrepancy=rel_err,
        steps=(
            f"Construct dimensionless group Π = (M · w) / (E · q · L₀⁴) with reference L₀ = 1 m = 1000 mm.",
            f"Evaluate Π in SI (N, m): ({m_val*1e3:.3e} N·m × {w_val*1e3:.3e} N/m) / ({e_val*1e9:.3e} Pa × {q_val*1e3:.3e} Pa × 1 m⁴) = {invariant_si:.6e}.",
            f"Evaluate Π in (N, mm): ({m_nmm:.3e} N·mm × {w_n_mm:.3f} N/mm) / ({e_n_mm2:.3e} N/mm² × {q_n_mm2:.5f} N/mm² × 10¹² mm⁴) = {invariant_mm:.6e}.",
        ),
    )

    return WorkedExampleSolution(
        example_id="EX-0.1",
        module_number=0,
        title="Consistent Structural Unit Conversions (GPa, kN/m², kNm, kN/m to N-mm)",
        problem_statement=(
            f"Convert {e_val:g} GPa to N/mm², {q_val:g} kN/m² to N/mm², "
            f"{m_val:g} kNm to Nmm, and {w_val:g} kN/m to N/mm."
        ),
        assumptions=(
            "Internal base structural unit system is (mm, N, s) where 1 MPa = 1 N/mm².",
            "1 kN = 1,000 N and 1 m = 1,000 mm.",
        ),
        sign_convention="Scalar unit magnitude conversion (strictly positive physical quantities).",
        inputs={
            "e_gpa": e_val,
            "q_kpa": q_val,
            "m_knm": m_val,
            "w_kn_per_m": w_val,
        },
        intermediate_steps=(
            f"1. Elastic modulus: {e_val:g} GPa = {e_val:g} × 10³ MPa = {e_n_mm2:,.1f} N/mm².",
            f"2. Surface pressure: {q_val:g} kN/m² = ({q_val:g} × 10³ N) / (10⁶ mm²) = {q_n_mm2:.4f} N/mm².",
            f"3. Bending moment: {m_val:g} kNm = ({m_val:g} × 10³ N) × (10³ mm) = {m_nmm:,.0f} Nmm.",
            f"4. Line load: {w_val:g} kN/m = ({w_val:g} × 10³ N) / (10³ mm) = {w_n_mm:.3f} N/mm (1:1 numerical identity).",
        ),
        results={
            "e_n_mm2": e_n_mm2,
            "q_n_mm2": q_n_mm2,
            "m_nmm": m_nmm,
            "w_n_mm": w_n_mm,
        },
        result_units={
            "e_n_mm2": "N/mm²",
            "q_n_mm2": "N/mm²",
            "m_nmm": "Nmm",
            "w_n_mm": "N/mm",
        },
        primary_answer=m_nmm,
        primary_unit="Nmm",
        independent_check=check,
        engineering_interpretation=(
            "Working consistently in N and mm eliminates 10³ and 10⁶ scale errors: "
            "kN/m equals N/mm numerically (1:1), GPa × 1000 = N/mm², and kNm × 10⁶ = Nmm."
        ),
        portfolio_category="",
    )


def solve_ex_0_2_inclined_force(
    force_kn: float = 20.0,
    angle_deg: float = 35.0,
) -> WorkedExampleSolution:
    """
    Example 0.2: Resolve a 20 kN force at 35° to the horizontal into horizontal and vertical components.
    Independent Check: Euclidean vector norm reconstruction sqrt(Fx^2 + Fy^2) == F and atan2(Fy, Fx) == theta.
    """
    f_val = _require_positive("force_kn", force_kn)
    theta_deg = _require_finite("angle_deg", angle_deg)
    if theta_deg <= 0.0 or theta_deg >= 90.0:
        raise ValueError(f"Parameter 'angle_deg' must lie strictly between 0° and 90°; got {theta_deg}°.")

    theta_rad = convert_value(theta_deg, "deg", "rad")
    fx_kn = f_val * math.cos(theta_rad)
    fy_kn = f_val * math.sin(theta_rad)

    # Independent check: Reconstruct resultant magnitude and direction via Pythagorean norm & complementary angle
    f_reconstructed = math.hypot(fx_kn, fy_kn)
    comp_rad = convert_value(90.0 - theta_deg, "deg", "rad")
    fx_via_complementary = f_val * math.sin(comp_rad)
    rel_err = max(
        abs(f_reconstructed - f_val) / f_val,
        abs(fx_via_complementary - fx_kn) / fx_kn,
    )

    check = IndependentCheckTrace(
        method_name="Pythagorean Vector Norm Reconstruction & Complementary Angle Identity",
        passed=rel_err < 1e-12,
        primary_metric=f_val,
        check_metric=f_reconstructed,
        unit="kN",
        rel_discrepancy=rel_err,
        steps=(
            f"Reconstruct resultant magnitude: √(Fx² + Fy²) = √({fx_kn:.4f}² + {fy_kn:.4f}²) = {f_reconstructed:.4f} kN.",
            f"Verify complementary angle identity (α = 90° - {theta_deg:g}° = {90.0 - theta_deg:g}°): F·sin(α) = {fx_via_complementary:.4f} kN = Fx.",
        ),
    )

    return WorkedExampleSolution(
        example_id="EX-0.2",
        module_number=0,
        title="Inclined Force Resolution into Orthogonal Components",
        problem_statement=(
            f"Resolve an inclined force F = {f_val:g} kN acting at θ = {theta_deg:g}° to the horizontal "
            f"into horizontal (Fx) and vertical (Fy) components."
        ),
        assumptions=(
            "Coplanar 2D force vector acting at a single point.",
            "Angle θ is measured counterclockwise from the positive horizontal x-axis.",
        ),
        sign_convention="Rightward (+x) positive for Fx; Upward (+y) positive for Fy.",
        inputs={"force_kn": f_val, "angle_deg": theta_deg},
        intermediate_steps=(
            f"1. Convert angle to radians: θ = {theta_deg:g}° × (π / 180°) = {theta_rad:.5f} rad.",
            f"2. Horizontal component (adjacent to θ): Fx = F cos({theta_deg:g}°) = {f_val:g} × {math.cos(theta_rad):.5f} = {fx_kn:.3f} kN.",
            f"3. Vertical component (opposite to θ): Fy = F sin({theta_deg:g}°) = {f_val:g} × {math.sin(theta_rad):.5f} = {fy_kn:.3f} kN.",
        ),
        results={"fx_kn": fx_kn, "fy_kn": fy_kn},
        result_units={"fx_kn": "kN", "fy_kn": "kN"},
        primary_answer=fx_kn,
        primary_unit="kN",
        independent_check=check,
        engineering_interpretation=(
            f"Since θ = {theta_deg:g}° < 45°, the horizontal component Fx ({fx_kn:.2f} kN) must exceed "
            f"the vertical component Fy ({fy_kn:.2f} kN), and neither component can exceed F ({f_val:g} kN)."
        ),
        portfolio_category="",
    )


def solve_ex_0_3_udl_resultant(
    span_m: float = 6.0,
    w_kn_per_m: float = 8.0,
) -> WorkedExampleSolution:
    """
    Example 0.3: Find the resultant force and line of action of an 8 kN/m UDL over 6 m.
    Independent Check: Composite Simpson numerical quadrature of ∫ w(x) dx and first moment ∫ x w(x) dx.
    """
    L = _require_positive("span_m", span_m)
    w = _require_positive("w_kn_per_m", w_kn_per_m)

    resultant_kn = w * L
    centroid_m = 0.5 * L

    # Independent check: Numerical integration of w(x) and x*w(x) over [0, L]
    w_int = _simpson_integrate(lambda _x: w, 0.0, L, n=100)
    first_moment_int = _simpson_integrate(lambda x: x * w, 0.0, L, n=100)
    x_bar_int = first_moment_int / w_int
    rel_err = max(
        abs(w_int - resultant_kn) / resultant_kn,
        abs(x_bar_int - centroid_m) / centroid_m,
    )

    check = IndependentCheckTrace(
        method_name="Numerical Quadrature of Distributed Load Intensity ∫w(x)dx and First Moment ∫x·w(x)dx",
        passed=rel_err < 1e-12,
        primary_metric=resultant_kn,
        check_metric=w_int,
        unit="kN",
        rel_discrepancy=rel_err,
        steps=(
            f"Integrate total load numerically: W = ∫₀^{L:g} {w:g} dx = {w_int:.4f} kN.",
            f"Integrate static moment about x = 0: M₀ = ∫₀^{L:g} x·({w:g}) dx = {first_moment_int:.4f} kNm.",
            f"Line of action x̄ = M₀ / W = {first_moment_int:.4f} / {w_int:.4f} = {x_bar_int:.4f} m.",
        ),
    )

    return WorkedExampleSolution(
        example_id="EX-0.3",
        module_number=0,
        title="UDL Resultant Force and Centroidal Line of Action",
        problem_statement=(
            f"Find the resultant vertical force W and line of action x̄ of a uniformly distributed load "
            f"w = {w:g} kN/m acting over a span L = {L:g} m."
        ),
        assumptions=(
            "Uniform load intensity w is constant along the entire loaded length L.",
            "Resultant replacement is valid for global external equilibrium calculations.",
        ),
        sign_convention="Downward gravity load positive; x measured from left end A (x = 0).",
        inputs={"span_m": L, "w_kn_per_m": w},
        intermediate_steps=(
            f"1. Area of rectangular load diagram: W = w × L = {w:g} kN/m × {L:g} m = {resultant_kn:.3f} kN.",
            f"2. Centroid of rectangular distribution: x̄ = L / 2 = {L:g} / 2 = {centroid_m:.3f} m from left end.",
        ),
        results={"resultant_kn": resultant_kn, "centroid_m": centroid_m},
        result_units={"resultant_kn": "kN", "centroid_m": "m"},
        primary_answer=resultant_kn,
        primary_unit="kN",
        independent_check=check,
        engineering_interpretation=(
            f"For external support reaction calculations, the {w:g} kN/m UDL over {L:g} m is statically "
            f"equivalent to a {resultant_kn:g} kN point load at midspan (x = {centroid_m:g} m)."
        ),
        portfolio_category="",
    )


# ==============================================================================
# MODULE 1 — Statics, Equilibrium & Load Paths
# ==============================================================================


def solve_ex_1_1_ss_beam_udl_reactions(
    span_m: float = 6.0,
    w_kn_per_m: float = 10.0,
) -> WorkedExampleSolution:
    """
    Example 1.1: Simply supported 6 m beam with a 10 kN/m UDL -> find support reactions.
    Independent Check: Moment equilibrium about right support B (ΣM_B = 0) and midspan (ΣM_{L/2} = 0).
    """
    L = _require_positive("span_m", span_m)
    w = _require_positive("w_kn_per_m", w_kn_per_m)

    total_load_kn = w * L
    # Primary method: ΣM_A = 0 -> R_B * L - (w * L) * (L / 2) = 0, then ΣF_y = 0 -> R_A = W - R_B
    rb_kn = (total_load_kn * (0.5 * L)) / L
    ra_kn = total_load_kn - rb_kn

    # Independent check: Take moments directly about B (ΣM_B = 0) to solve R_A independently
    ra_from_mb = (total_load_kn * (0.5 * L)) / L
    # Also verify global moment about midspan x = L/2: R_A*(L/2) - R_B*(L/2) == 0
    midspan_moment_residual = ra_from_mb * (0.5 * L) - rb_kn * (0.5 * L)
    rel_err = max(
        abs(ra_kn - ra_from_mb) / ra_kn,
        abs(midspan_moment_residual) / (total_load_kn * L),
    )

    check = IndependentCheckTrace(
        method_name="Independent Moment Equilibrium about Right Support B (ΣM_B = 0) & Midspan Symmetry",
        passed=rel_err < 1e-12,
        primary_metric=ra_kn,
        check_metric=ra_from_mb,
        unit="kN",
        rel_discrepancy=rel_err,
        steps=(
            f"Take moments independently about Support B (ΣM_B = 0): R_A × {L:g} - ({total_load_kn:g} × {0.5*L:g}) = 0 ⇒ R_A = {ra_from_mb:.3f} kN.",
            f"Check rotational equilibrium about midspan (x = {0.5*L:g} m): R_A({0.5*L:g}) - R_B({0.5*L:g}) = {midspan_moment_residual:.4f} kNm = 0.",
        ),
    )

    return WorkedExampleSolution(
        example_id="EX-1.1",
        module_number=1,
        title="Simply Supported Beam Reactions under Full-Span UDL",
        problem_statement=(
            f"A simply supported beam of span L = {L:g} m carries a uniform gravity load "
            f"w = {w:g} kN/m over its full length. Determine support reactions R_A and R_B."
        ),
        assumptions=(
            "Statically determinate pin-roller support arrangement (no axial thrust H_A = 0).",
            "Self-weight is included in w; supports are rigid against vertical settlement.",
        ),
        sign_convention="Upward forces (+y) positive; counterclockwise moments (+M) positive.",
        inputs={"span_m": L, "w_kn_per_m": w},
        intermediate_steps=(
            f"1. Total resultant gravity load: W = wL = {w:g} × {L:g} = {total_load_kn:.3f} kN acting at x̄ = {0.5*L:g} m.",
            f"2. Sum moments about Support A (ΣM_A = 0): R_B × {L:g} - {total_load_kn:g} × {0.5*L:g} = 0 ⇒ R_B = {rb_kn:.3f} kN.",
            f"3. Vertical force equilibrium (ΣF_y = 0): R_A + R_B - W = 0 ⇒ R_A = {total_load_kn:g} - {rb_kn:g} = {ra_kn:.3f} kN.",
        ),
        results={"total_load_kn": total_load_kn, "ra_kn": ra_kn, "rb_kn": rb_kn},
        result_units={"total_load_kn": "kN", "ra_kn": "kN", "rb_kn": "kN"},
        primary_answer=ra_kn,
        primary_unit="kN",
        independent_check=check,
        engineering_interpretation=(
            f"By symmetry, each support carries half the total load: R_A = R_B = wL/2 = {ra_kn:g} kN."
        ),
        portfolio_category="beam_reactions",
    )


def solve_ex_1_2_ss_beam_point_load_reactions(
    span_m: float = 5.0,
    load_kn: float = 20.0,
    a_m: float = 2.0,
) -> WorkedExampleSolution:
    """
    Example 1.2: Simply supported 5 m beam with a 20 kN point load at 2 m from the left support -> find reactions.
    Independent Check: Moment equilibrium about load point x = a (R_A * a - R_B * b = 0) and vertical force sum.
    """
    L = _require_positive("span_m", span_m)
    P = _require_positive("load_kn", load_kn)
    a = _require_positive("a_m", a_m)
    if a >= L:
        raise ValueError(f"Load position 'a_m' ({a} m) must be strictly less than span 'span_m' ({L} m).")

    b = L - a
    # Primary method: Moments about A for R_B, Moments about B for R_A
    rb_kn = (P * a) / L
    ra_kn = (P * b) / L

    # Independent check: Vertical force sum R_A + R_B == P AND zero net external moment about load point x = a
    fy_sum = ra_kn + rb_kn
    moment_at_load = ra_kn * a - rb_kn * b
    rel_err = max(
        abs(fy_sum - P) / P,
        abs(moment_at_load) / (P * L),
    )

    check = IndependentCheckTrace(
        method_name="Vertical Force Sum (ΣF_y = 0) & Moment Equilibrium about Load Point x = a",
        passed=rel_err < 1e-12,
        primary_metric=P,
        check_metric=fy_sum,
        unit="kN",
        rel_discrepancy=rel_err,
        steps=(
            f"Verify vertical force equilibrium (ΣF_y = 0): R_A + R_B = {ra_kn:.3f} + {rb_kn:.3f} = {fy_sum:.3f} kN = P.",
            f"Verify moment equilibrium about load application point x = {a:g} m: R_A·a - R_B·b = {ra_kn:.3f}×{a:g} - {rb_kn:.3f}×{b:g} = {moment_at_load:.4f} kNm = 0.",
        ),
    )

    return WorkedExampleSolution(
        example_id="EX-1.2",
        module_number=1,
        title="Simply Supported Beam Reactions under Eccentric Point Load",
        problem_statement=(
            f"A simply supported beam of span L = {L:g} m carries an eccentric point load "
            f"P = {P:g} kN at distance a = {a:g} m from left support A. Find R_A and R_B."
        ),
        assumptions=(
            "Statically determinate pin-roller beam of span L = a + b.",
            "Point load acts over a negligible contact width at x = a.",
        ),
        sign_convention="Upward forces (+y) positive; counterclockwise moments (+M) positive.",
        inputs={"span_m": L, "load_kn": P, "a_m": a, "b_m": b},
        intermediate_steps=(
            f"1. Distance from load to right support B: b = L - a = {L:g} - {a:g} = {b:g} m.",
            f"2. Sum moments about A (ΣM_A = 0): R_B × {L:g} - {P:g} × {a:g} = 0 ⇒ R_B = P·a/L = {rb_kn:.3f} kN.",
            f"3. Sum moments about B (ΣM_B = 0): -R_A × {L:g} + {P:g} × {b:g} = 0 ⇒ R_A = P·b/L = {ra_kn:.3f} kN.",
        ),
        results={"ra_kn": ra_kn, "rb_kn": rb_kn, "b_m": b},
        result_units={"ra_kn": "kN", "rb_kn": "kN", "b_m": "m"},
        primary_answer=ra_kn,
        primary_unit="kN",
        independent_check=check,
        engineering_interpretation=(
            f"Because the load is closer to Support A (a = {a:g} m < b = {b:g} m), "
            f"Support A attracts the larger share of load (R_A = {ra_kn:g} kN > R_B = {rb_kn:g} kN)."
        ),
        portfolio_category="beam_reactions",
    )


def solve_ex_1_3_tributary_floor_load(
    slab_span_m: float = 4.0,
    beam_span_m: float = 5.0,
    gk_kpa: float = 1.0,
    qk_kpa: float = 1.5,
) -> WorkedExampleSolution:
    """
    Example 1.3: One-way spanning floor bay 4 m x 5 m with dead load 1.0 kN/m² and live load 1.5 kN/m² ->
    find the line load on one supporting edge beam.
    Independent Check: Total bay surface load integration (Area * q_total) vs sum of edge beam reactions.
    """
    lx = _require_positive("slab_span_m", slab_span_m)
    ly = _require_positive("beam_span_m", beam_span_m)
    gk = _require_positive("gk_kpa", gk_kpa)
    qk = _require_positive("qk_kpa", qk_kpa)

    trib_width_m = 0.5 * lx
    w_dead_kn_m = gk * trib_width_m
    w_live_kn_m = qk * trib_width_m
    w_total_kn_m = w_dead_kn_m + w_live_kn_m
    beam_total_load_kn = w_total_kn_m * ly

    # Independent check: Integrate total floor bay load over plan area (lx * ly) and divide equally between 2 edge beams
    bay_area_m2 = lx * ly
    total_bay_load_kn = (gk + qk) * bay_area_m2
    load_per_beam_from_bay = 0.5 * total_bay_load_kn
    w_from_bay_kn_m = load_per_beam_from_bay / ly
    rel_err = abs(w_from_bay_kn_m - w_total_kn_m) / w_total_kn_m

    check = IndependentCheckTrace(
        method_name="Global Floor Bay Area Load Integration vs Edge Beam Line-Load Sum",
        passed=rel_err < 1e-12,
        primary_metric=w_total_kn_m,
        check_metric=w_from_bay_kn_m,
        unit="kN/m",
        rel_discrepancy=rel_err,
        steps=(
            f"Total floor bay plan area: A_bay = {lx:g} m × {ly:g} m = {bay_area_m2:.2f} m².",
            f"Total unfactored gravity load on bay: F_bay = ({gk:g} + {qk:g}) kN/m² × {bay_area_m2:.2f} m² = {total_bay_load_kn:.2f} kN.",
            f"Load carried by one edge beam (50% of one-way bay): F_beam = {load_per_beam_from_bay:.2f} kN ⇒ w = {load_per_beam_from_bay:.2f} / {ly:g} = {w_from_bay_kn_m:.3f} kN/m.",
        ),
    )

    return WorkedExampleSolution(
        example_id="EX-1.3",
        module_number=1,
        title="One-Way Floor Bay Tributary Width and Supporting Beam Line Load",
        problem_statement=(
            f"A one-way spanning floor slab spans L_slab = {lx:g} m between supporting beams of length "
            f"L_beam = {ly:g} m. Characteristic dead load g_k = {gk:g} kN/m² and live load q_k = {qk:g} kN/m². "
            f"Find the characteristic line load w on one supporting edge beam."
        ),
        assumptions=(
            "Slab spans strictly one-way across the 4 m dimension onto the two 5 m supporting edge beams.",
            "Simply supported slab continuity assumed (tributary width = L_slab / 2 per edge beam).",
            "Unfactored (characteristic) load takedown as specified in the worked example.",
        ),
        sign_convention="Downward gravity pressures (kN/m²) and line loads (kN/m) positive.",
        inputs={
            "slab_span_m": lx,
            "beam_span_m": ly,
            "gk_kpa": gk,
            "qk_kpa": qk,
        },
        intermediate_steps=(
            f"1. Tributary width per supporting edge beam: b_trib = L_slab / 2 = {lx:g} / 2 = {trib_width_m:.2f} m.",
            f"2. Dead line load: w_g = g_k × b_trib = {gk:g} kN/m² × {trib_width_m:.2f} m = {w_dead_kn_m:.2f} kN/m.",
            f"3. Live line load: w_q = q_k × b_trib = {qk:g} kN/m² × {trib_width_m:.2f} m = {w_live_kn_m:.2f} kN/m.",
            f"4. Total characteristic line load on one beam: w = w_g + w_q = {w_total_kn_m:.2f} kN/m (Total beam load = {beam_total_load_kn:.1f} kN).",
        ),
        results={
            "tributary_width_m": trib_width_m,
            "w_dead_kn_m": w_dead_kn_m,
            "w_live_kn_m": w_live_kn_m,
            "w_total_kn_m": w_total_kn_m,
            "beam_total_load_kn": beam_total_load_kn,
        },
        result_units={
            "tributary_width_m": "m",
            "w_dead_kn_m": "kN/m",
            "w_live_kn_m": "kN/m",
            "w_total_kn_m": "kN/m",
            "beam_total_load_kn": "kN",
        },
        primary_answer=w_total_kn_m,
        primary_unit="kN/m",
        independent_check=check,
        engineering_interpretation=(
            f"Area load (kN/m²) multiplied by tributary width ({trib_width_m:g} m) yields line load ({w_total_kn_m:g} kN/m). "
            f"Both edge beams together carry 2 × {beam_total_load_kn:g} kN = {total_bay_load_kn:g} kN, matching the entire floor bay load."
        ),
        portfolio_category="",
    )


# ==============================================================================
# MODULE 2 — Internal Actions: Axial Force, Shear Force & Bending Moment
# ==============================================================================


def solve_ex_2_1_ss_beam_udl_sfd_bmd(
    span_m: float = 6.0,
    w_kn_per_m: float = 10.0,
) -> WorkedExampleSolution:
    """
    Example 2.1: Simply supported 6 m beam with 10 kN/m UDL -> V_max, M_max, SFD, BMD.
    Independent Check: Definite integration of Shear Force Diagram area ∫₀^{L/2} V(x) dx = M_max.
    """
    L = _require_positive("span_m", span_m)
    w = _require_positive("w_kn_per_m", w_kn_per_m)

    ra_kn = 0.5 * w * L
    v_max_kn = ra_kn
    x_zero_shear_m = ra_kn / w
    # Method of sections at x = L/2: M(L/2) = R_A*(L/2) - (w*L/2)*(L/4) = wL^2/8
    m_max_knm = (w * (L**2)) / 8.0

    # Independent check: Area under shear force diagram from x = 0 to x_zero_shear + numerical quadrature
    shear_triangle_area = 0.5 * v_max_kn * x_zero_shear_m
    quad_moment = _simpson_integrate(lambda x: ra_kn - w * x, 0.0, x_zero_shear_m, n=100)
    rel_err = max(
        abs(shear_triangle_area - m_max_knm) / m_max_knm,
        abs(quad_moment - m_max_knm) / m_max_knm,
    )

    check = IndependentCheckTrace(
        method_name="Definite Integration of Shear Force Diagram Area ∫₀^{L/2} V(x) dx = ΔM",
        passed=rel_err < 1e-12,
        primary_metric=m_max_knm,
        check_metric=shear_triangle_area,
        unit="kNm",
        rel_discrepancy=rel_err,
        steps=(
            f"Shear force function: V(x) = R_A - wx = {ra_kn:g} - {w:g}x kN, crossing zero at x = {x_zero_shear_m:g} m.",
            f"Since M(0) = 0 at the pin support, M_max = ∫₀^{x_zero_shear_m:g} V(x) dx = ½ × {v_max_kn:g} kN × {x_zero_shear_m:g} m = {shear_triangle_area:.3f} kNm.",
        ),
    )

    return WorkedExampleSolution(
        example_id="EX-2.1",
        module_number=2,
        title="Simply Supported Beam under UDL — SFD, BMD, V_max and M_max",
        problem_statement=(
            f"For a simply supported beam of span L = {L:g} m carrying a uniform load w = {w:g} kN/m, "
            f"find V_max, the location of zero shear, and M_max."
        ),
        assumptions=(
            "Linear elastic Euler-Bernoulli beam on simple end supports (M(0) = M(L) = 0).",
            "Uniform downward load w produces symmetric shear and parabolic sagging bending moment.",
        ),
        sign_convention=(
            "Shear V positive when left-hand exterior segment acts upward; "
            "Bending moment M positive in sagging (tension in bottom extreme fibre, BMD plotted on tension side)."
        ),
        inputs={"span_m": L, "w_kn_per_m": w},
        intermediate_steps=(
            f"1. Support reactions: R_A = R_B = wL/2 = {w:g} × {L:g} / 2 = {ra_kn:.2f} kN.",
            f"2. Shear equation by method of sections: V(x) = {ra_kn:g} - {w:g}x kN ⇒ V_max = ±{v_max_kn:.2f} kN at supports.",
            f"3. Zero shear point: V(x) = 0 ⇒ x = {ra_kn:g} / {w:g} = {x_zero_shear_m:.2f} m (midspan).",
            f"4. Maximum sagging moment at x = {x_zero_shear_m:g} m: M_max = R_A(L/2) - (wL/2)(L/4) = wL²/8 = {m_max_knm:.2f} kNm (bottom face in tension).",
        ),
        results={
            "v_max_kn": v_max_kn,
            "x_zero_shear_m": x_zero_shear_m,
            "m_max_knm": m_max_knm,
        },
        result_units={
            "v_max_kn": "kN",
            "x_zero_shear_m": "m",
            "m_max_knm": "kNm",
        },
        primary_answer=m_max_knm,
        primary_unit="kNm",
        independent_check=check,
        engineering_interpretation=(
            f"Under a UDL, V(x) is linear and crosses zero at midspan (x = {x_zero_shear_m:g} m), where the "
            f"parabolic BMD reaches its peak sagging value M_max = wL²/8 = {m_max_knm:g} kNm."
        ),
        portfolio_category="sfd_bmd",
    )


def solve_ex_2_2_cantilever_udl_sfd_bmd(
    span_m: float = 2.0,
    w_kn_per_m: float = 5.0,
) -> WorkedExampleSolution:
    """
    Example 2.2: 2 m cantilever with 5 kN/m UDL -> fixed-end shear, fixed-end moment, SFD, BMD.
    Independent Check: Integration of dV/dx = -w and dM/dx = V backward from free end (x = L) to fixed root (x = 0).
    """
    L = _require_positive("span_m", span_m)
    w = _require_positive("w_kn_per_m", w_kn_per_m)

    # Primary method: Cut at fixed root (x = 0) and sum forces/moments of entire cantilever length L
    v_fixed_kn = w * L
    m_fixed_hogging_knm = -0.5 * w * (L**2)  # negative = hogging (tension on top face)
    m_fixed_mag_knm = abs(m_fixed_hogging_knm)

    # Independent check: Integrate from free tip s = 0 (where V=0, M=0) to root s = L
    v_from_tip = _simpson_integrate(lambda _s: w, 0.0, L, n=100)
    m_from_tip = _simpson_integrate(lambda s: w * s, 0.0, L, n=100)
    rel_err = max(
        abs(v_from_tip - v_fixed_kn) / v_fixed_kn,
        abs(m_from_tip - m_fixed_mag_knm) / m_fixed_mag_knm,
    )

    check = IndependentCheckTrace(
        method_name="Free-End Boundary Integration (V(tip)=0, M(tip)=0) along Coordinate s from Tip to Root",
        passed=rel_err < 1e-12,
        primary_metric=m_fixed_mag_knm,
        check_metric=m_from_tip,
        unit="kNm",
        rel_discrepancy=rel_err,
        steps=(
            f"Define distance s from free tip (0 ≤ s ≤ {L:g} m) with boundary conditions V(0) = 0, M(0) = 0.",
            f"Integrate shear at root: V(L) = ∫₀^{L:g} {w:g} ds = {v_from_tip:.3f} kN.",
            f"Integrate hogging moment magnitude at root: |M(L)| = ∫₀^{L:g} V(s) ds = ∫₀^{L:g} {w:g}s ds = {m_from_tip:.3f} kNm.",
        ),
    )

    return WorkedExampleSolution(
        example_id="EX-2.2",
        module_number=2,
        title="Cantilever Beam under UDL — Fixed-End Shear, Hogging Moment, SFD and BMD",
        problem_statement=(
            f"A cantilever beam of span L = {L:g} m fixed at x = 0 and free at x = {L:g} m carries "
            f"a uniform downward load w = {w:g} kN/m. Find the fixed-end shear force and bending moment."
        ),
        assumptions=(
            "Fixed support at x = 0 provides full vertical and rotational restraint; free tip at x = L has V = 0, M = 0.",
            "Uniform load w acts over the full cantilever projection L.",
        ),
        sign_convention=(
            "Sagging moment positive (+), Hogging moment negative (-); "
            "hogging puts the TOP face of the cantilever in tension."
        ),
        inputs={"span_m": L, "w_kn_per_m": w},
        intermediate_steps=(
            f"1. Resultant downward load: W = wL = {w:g} × {L:g} = {v_fixed_kn:.2f} kN acting at x̄ = {0.5*L:g} m from fixed root.",
            f"2. Fixed-end shear reaction: V_fixed = wL = {v_fixed_kn:.2f} kN (linearly decreasing to 0 at free tip).",
            f"3. Fixed-end bending moment: M_fixed = -wL²/2 = -{w:g} × {L:g}² / 2 = {m_fixed_hogging_knm:.2f} kNm (|M_max| = {m_fixed_mag_knm:.2f} kNm hogging, top face in tension).",
        ),
        results={
            "v_fixed_kn": v_fixed_kn,
            "m_fixed_hogging_knm": m_fixed_hogging_knm,
            "m_fixed_magnitude_knm": m_fixed_mag_knm,
        },
        result_units={
            "v_fixed_kn": "kN",
            "m_fixed_hogging_knm": "kNm",
            "m_fixed_magnitude_knm": "kNm",
        },
        primary_answer=m_fixed_mag_knm,
        primary_unit="kNm",
        independent_check=check,
        engineering_interpretation=(
            f"A cantilever under gravity load experiences pure hogging (M = {m_fixed_hogging_knm:g} kNm at the support), "
            f"meaning the top reinforcement or top flange is in tension throughout the span."
        ),
        portfolio_category="sfd_bmd",
    )


def solve_ex_2_3_ss_beam_point_load_sfd_bmd(
    span_m: float = 5.0,
    load_kn: float = 20.0,
    a_m: float = 2.0,
) -> WorkedExampleSolution:
    """
    Example 2.3: Simply supported 5 m beam with 20 kN point load at 2 m from left -> SFD and BMD.
    Independent Check: Full-span shear-area integration closure (M(0) + A_left + A_right = M(L) = 0)
    and right-hand section cut M = R_B * b.
    """
    L = _require_positive("span_m", span_m)
    P = _require_positive("load_kn", load_kn)
    a = _require_positive("a_m", a_m)
    if a >= L:
        raise ValueError(f"Load position 'a_m' ({a} m) must be strictly less than span 'span_m' ({L} m).")

    b = L - a
    ra_kn = (P * b) / L
    rb_kn = (P * a) / L
    v_left_kn = ra_kn
    v_right_kn = ra_kn - P  # equals -rb_kn
    # Primary method: Left-hand cut just left of load at x = a -> M_max = R_A * a = P*a*b/L
    m_max_knm = ra_kn * a

    # Independent check: Right-hand cut from support B -> M(a) = R_B * b, plus full-span shear-area closure
    m_from_right = rb_kn * b
    end_moment_closure = (v_left_kn * a) + (v_right_kn * b)
    rel_err = max(
        abs(m_from_right - m_max_knm) / m_max_knm,
        abs(end_moment_closure) / m_max_knm,
    )

    check = IndependentCheckTrace(
        method_name="Right-Hand Substructure Section Cut (R_B · b) & Full-Span Shear-Area Closure",
        passed=rel_err < 1e-12,
        primary_metric=m_max_knm,
        check_metric=m_from_right,
        unit="kNm",
        rel_discrepancy=rel_err,
        steps=(
            f"Right-hand section cut at x = {a:g} m: M_max = R_B × b = {rb_kn:.3f} kN × {b:g} m = {m_from_right:.3f} kNm.",
            f"Full-span shear-area integration closure: M(L) = M(0) + V_left·a + V_right·b = 0 + ({v_left_kn:.2f}×{a:g}) + ({v_right_kn:.2f}×{b:g}) = {end_moment_closure:.4f} kNm = 0.",
        ),
    )

    return WorkedExampleSolution(
        example_id="EX-2.3",
        module_number=2,
        title="Simply Supported Beam under Eccentric Point Load — SFD and BMD",
        problem_statement=(
            f"A simply supported beam of span L = {L:g} m carries a point load P = {P:g} kN "
            f"at x = a = {a:g} m from left support A. Construct the SFD and BMD and find M_max."
        ),
        assumptions=(
            "Weightless ideal beam Segment 1 (0 < x < a) and Segment 2 (a < x < L).",
            "Point load causes an instantaneous step discontinuity of -P in the SFD and a slope change in the BMD.",
        ),
        sign_convention="Upward left shear positive (+); Sagging moment positive (+, bottom face in tension).",
        inputs={"span_m": L, "load_kn": P, "a_m": a, "b_m": b},
        intermediate_steps=(
            f"1. Support reactions: R_A = P·b/L = {ra_kn:.2f} kN; R_B = P·a/L = {rb_kn:.2f} kN.",
            f"2. Shear force diagram: V(x) = +{v_left_kn:.2f} kN for 0 < x < {a:g} m; steps down by {P:g} kN at x = {a:g} m to V(x) = {v_right_kn:.2f} kN for {a:g} < x < {L:g} m.",
            f"3. Bending moment diagram: Triangular sagging diagram peaking under the load at x = {a:g} m with M_max = P·a·b/L = {m_max_knm:.2f} kNm.",
        ),
        results={
            "v_left_kn": v_left_kn,
            "v_right_kn": v_right_kn,
            "m_max_knm": m_max_knm,
        },
        result_units={
            "v_left_kn": "kN",
            "v_right_kn": "kN",
            "m_max_knm": "kNm",
        },
        primary_answer=m_max_knm,
        primary_unit="kNm",
        independent_check=check,
        engineering_interpretation=(
            f"The step change in shear from +{v_left_kn:g} kN to {v_right_kn:g} kN at x = {a:g} m "
            f"coincides with the sharp apex M_max = {m_max_knm:g} kNm in the linear bending moment diagram."
        ),
        portfolio_category="sfd_bmd",
    )


# ==============================================================================
# MODULE 3 — Direct Stress, Strain, Hooke's Law & Material Behaviour
# ==============================================================================


def solve_ex_3_1_steel_tie(
    length_mm: float = 3000.0,
    area_mm2: float = 1000.0,
    force_kn: float = 100.0,
    e_gpa: float = 200.0,
) -> WorkedExampleSolution:
    """
    Example 3.1: 3 m steel tie of area 1000 mm² under 100 kN tension with E = 200 GPa ->
    find axial stress, strain, and elongation.
    Independent Check: External Work W_ext = 1/2 * F * dL vs Internal Strain Energy U_int = 1/2 * sigma * eps * A * L.
    """
    L_mm = _require_positive("length_mm", length_mm)
    A_mm2 = _require_positive("area_mm2", area_mm2)
    F_kn = _require_positive("force_kn", force_kn)
    E_gpa = _require_positive("e_gpa", e_gpa)

    F_n = convert_value(F_kn, "kN", "N")
    E_mpa = convert_value(E_gpa, "GPa", "N/mm²")

    # Primary method: Direct stress -> Hooke's Law strain -> kinematic extension
    sigma_mpa = F_n / A_mm2
    strain = sigma_mpa / E_mpa
    delta_l_mm = strain * L_mm

    # Independent check: Axial spring stiffness k = EA/L AND External Work vs Internal Strain Energy
    k_n_per_mm = (E_mpa * A_mm2) / L_mm
    delta_l_via_stiffness = F_n / k_n_per_mm
    work_ext_nmm = 0.5 * F_n * delta_l_mm
    energy_int_nmm = 0.5 * sigma_mpa * strain * (A_mm2 * L_mm)
    rel_err = max(
        abs(delta_l_via_stiffness - delta_l_mm) / delta_l_mm,
        abs(work_ext_nmm - energy_int_nmm) / work_ext_nmm,
    )

    check = IndependentCheckTrace(
        method_name="External Work vs Internal Strain Energy Equivalence (½·F·ΔL = ½·σ·ε·V) & Stiffness k = EA/L",
        passed=rel_err < 1e-12,
        primary_metric=delta_l_mm,
        check_metric=delta_l_via_stiffness,
        unit="mm",
        rel_discrepancy=rel_err,
        steps=(
            f"Axial stiffness: k = EA/L = ({E_mpa:,.0f} × {A_mm2:g}) / {L_mm:g} = {k_n_per_mm:,.2f} N/mm ⇒ ΔL = F/k = {delta_l_via_stiffness:.4f} mm.",
            f"External work: W_ext = ½ F ΔL = 0.5 × {F_n:,.0f} N × {delta_l_mm:.4f} mm = {work_ext_nmm:,.2f} N·mm.",
            f"Internal strain energy: U_int = ½ σ ε (A·L) = 0.5 × {sigma_mpa:.2f} × {strain:.6f} × {A_mm2*L_mm:,.0f} = {energy_int_nmm:,.2f} N·mm.",
        ),
    )

    return WorkedExampleSolution(
        example_id="EX-3.1",
        module_number=3,
        title="Steel Tie Rod Axial Stress, Strain, and Elongation",
        problem_statement=(
            f"A steel tie of length L = {L_mm/1000.0:g} m ({L_mm:g} mm) and cross-sectional area "
            f"A = {A_mm2:g} mm² carries an axial tensile load F = {F_kn:g} kN. Taking E = {E_gpa:g} GPa, "
            f"determine the axial stress σ, axial strain ε, and elongation ΔL."
        ),
        assumptions=(
            "Prismatic member under concentric axial tension (uniform normal stress across section).",
            "Material remains linearly elastic (σ = 100 MPa < f_y, so Hooke's Law σ = Eε holds).",
        ),
        sign_convention="Tension (+σ), tensile strain (+ε), and elongation (+ΔL) positive.",
        inputs={
            "length_mm": L_mm,
            "area_mm2": A_mm2,
            "force_kn": F_kn,
            "e_gpa": E_gpa,
        },
        intermediate_steps=(
            f"1. Convert to base N-mm units: F = {F_kn:g} kN = {F_n:,.0f} N; E = {E_gpa:g} GPa = {E_mpa:,.0f} N/mm².",
            f"2. Direct tensile stress: σ = F / A = {F_n:,.0f} N / {A_mm2:g} mm² = {sigma_mpa:.2f} MPa (N/mm²).",
            f"3. Axial strain (Hooke's Law): ε = σ / E = {sigma_mpa:.2f} / {E_mpa:,.0f} = {strain:.6f} ({strain*1e6:.0f} με).",
            f"4. Axial elongation: ΔL = ε L = FL / (EA) = {strain:.6f} × {L_mm:g} mm = {delta_l_mm:.3f} mm.",
        ),
        results={
            "sigma_mpa": sigma_mpa,
            "strain": strain,
            "delta_l_mm": delta_l_mm,
        },
        result_units={
            "sigma_mpa": "MPa",
            "strain": "-",
            "delta_l_mm": "mm",
        },
        primary_answer=delta_l_mm,
        primary_unit="mm",
        independent_check=check,
        engineering_interpretation=(
            f"At σ = {sigma_mpa:g} MPa, a {L_mm/1000.0:g} m steel tie stretches by {delta_l_mm:g} mm "
            f"(0.05% strain, or 0.5 mm per metre of length)."
        ),
        portfolio_category="",
    )


def solve_ex_3_2_steel_vs_aluminium_extension(
    length_mm: float = 2000.0,
    area_mm2: float = 500.0,
    force_kn: float = 50.0,
    e_steel_gpa: float = 210.0,
    e_al_gpa: float = 70.0,
) -> WorkedExampleSolution:
    """
    Example 3.2: Compare the extension of steel and aluminium bars of identical geometry under the same load.
    Independent Check: Inverse axial stiffness ratio k_steel / k_al == delta_L_al / delta_L_steel == E_steel / E_al.
    """
    L_mm = _require_positive("length_mm", length_mm)
    A_mm2 = _require_positive("area_mm2", area_mm2)
    F_kn = _require_positive("force_kn", force_kn)
    E_s_gpa = _require_positive("e_steel_gpa", e_steel_gpa)
    E_a_gpa = _require_positive("e_al_gpa", e_al_gpa)

    F_n = convert_value(F_kn, "kN", "N")
    E_s_mpa = convert_value(E_s_gpa, "GPa", "N/mm²")
    E_a_mpa = convert_value(E_a_gpa, "GPa", "N/mm²")

    sigma_mpa = F_n / A_mm2
    dl_steel_mm = (F_n * L_mm) / (E_s_mpa * A_mm2)
    dl_al_mm = (F_n * L_mm) / (E_a_mpa * A_mm2)
    extension_ratio = dl_al_mm / dl_steel_mm

    # Independent check: Compare axial spring stiffnesses k_s = E_s*A/L and k_al = E_al*A/L
    k_steel = (E_s_mpa * A_mm2) / L_mm
    k_al = (E_a_mpa * A_mm2) / L_mm
    stiffness_ratio = k_steel / k_al
    rel_err = abs(extension_ratio - stiffness_ratio) / stiffness_ratio

    check = IndependentCheckTrace(
        method_name="Inverse Axial Stiffness Ratio (k_steel / k_al) vs Extension Ratio (ΔL_al / ΔL_steel)",
        passed=rel_err < 1e-12,
        primary_metric=extension_ratio,
        check_metric=stiffness_ratio,
        unit="-",
        rel_discrepancy=rel_err,
        steps=(
            f"Steel axial stiffness: k_steel = E_steel·A/L = {k_steel:,.1f} N/mm.",
            f"Aluminium axial stiffness: k_al = E_al·A/L = {k_al:,.1f} N/mm.",
            f"Stiffness ratio k_steel / k_al = {stiffness_ratio:.4f} matches extension ratio ΔL_al / ΔL_steel = {extension_ratio:.4f}.",
        ),
    )

    return WorkedExampleSolution(
        example_id="EX-3.2",
        module_number=3,
        title="Steel vs Aluminium Extension Comparison under Identical Geometry and Load",
        problem_statement=(
            f"Two bars of identical length L = {L_mm:g} mm and area A = {A_mm2:g} mm²—one steel "
            f"(E = {E_s_gpa:g} GPa) and one aluminium (E = {E_a_gpa:g} GPa)—carry F = {F_kn:g} kN. "
            f"Compare their direct stresses and axial extensions."
        ),
        assumptions=(
            "Both bars have identical cross-sectional area A and length L.",
            "Both materials remain within their linear elastic limit under σ = F/A.",
        ),
        sign_convention="Tensile extension (+ΔL) positive.",
        inputs={
            "length_mm": L_mm,
            "area_mm2": A_mm2,
            "force_kn": F_kn,
            "e_steel_gpa": E_s_gpa,
            "e_al_gpa": E_a_gpa,
        },
        intermediate_steps=(
            f"1. Direct stress is purely equilibrium/geometry dependent: σ = F/A = {sigma_mpa:.2f} MPa in BOTH bars.",
            f"2. Steel extension: ΔL_steel = FL / (E_steel A) = {dl_steel_mm:.4f} mm.",
            f"3. Aluminium extension: ΔL_al = FL / (E_al A) = {dl_al_mm:.4f} mm.",
            f"4. Extension ratio: ΔL_al / ΔL_steel = E_steel / E_al = {E_s_gpa:g} / {E_a_gpa:g} = {extension_ratio:.2f}.",
        ),
        results={
            "sigma_mpa": sigma_mpa,
            "dl_steel_mm": dl_steel_mm,
            "dl_al_mm": dl_al_mm,
            "extension_ratio": extension_ratio,
        },
        result_units={
            "sigma_mpa": "MPa",
            "dl_steel_mm": "mm",
            "dl_al_mm": "mm",
            "extension_ratio": "-",
        },
        primary_answer=extension_ratio,
        primary_unit="-",
        independent_check=check,
        engineering_interpretation=(
            f"Both bars experience the exact same stress ({sigma_mpa:g} MPa), but because aluminium has "
            f"one-third the Young's modulus of steel, it stretches {extension_ratio:g} times as much."
        ),
        portfolio_category="",
    )


# ==============================================================================
# MODULE 4 — Section Properties & Pure Bending
# ==============================================================================


def solve_ex_4_1_rectangle_section_properties(
    b_mm: float = 75.0,
    d1_mm: float = 225.0,
    d2_mm: float = 300.0,
    moment_knm: float = 8.0,
) -> WorkedExampleSolution:
    """
    Example 4.1: Rectangular timber joist 75 mm x 225 mm -> find I, Z, and bending stress under M = 8 kNm;
    compare with 75 mm x 300 mm.
    Independent Check: Internal triangular stress-wedge resultant couple F_C * (2/3 * d) == M.
    """
    b = _require_positive("b_mm", b_mm)
    d1 = _require_positive("d1_mm", d1_mm)
    d2 = _require_positive("d2_mm", d2_mm)
    m_knm = _require_positive("moment_knm", moment_knm)

    m_nmm = convert_value(m_knm, "kNm", "Nmm")

    i1_mm4 = (b * (d1**3)) / 12.0
    z1_mm3 = (b * (d1**2)) / 6.0
    sigma1_mpa = m_nmm / z1_mm3

    i2_mm4 = (b * (d2**3)) / 12.0
    z2_mm3 = (b * (d2**2)) / 6.0
    sigma2_mpa = m_nmm / z2_mm3

    # Independent check: Integrate internal linear stress blocks above/below neutral axis for 75x225 section
    # Compression wedge height = d1/2; average stress = sigma1/2; Force F_c = 0.5 * sigma1 * b * (d1/2)
    # Lever arm between top and bottom triangular centroids = (2/3)*d1
    f_wedge_n = 0.5 * sigma1_mpa * b * (0.5 * d1)
    lever_arm_mm = (2.0 / 3.0) * d1
    m_reconstructed_knm = convert_value(f_wedge_n * lever_arm_mm, "Nmm", "kNm")
    rel_err = abs(m_reconstructed_knm - m_knm) / m_knm

    check = IndependentCheckTrace(
        method_name="Internal Triangular Stress-Wedge Force Couple Integration (M = F_wedge × ⅔d)",
        passed=rel_err < 1e-12,
        primary_metric=m_knm,
        check_metric=m_reconstructed_knm,
        unit="kNm",
        rel_discrepancy=rel_err,
        steps=(
            f"For {b:g}×{d1:g} section, extreme fibre stress σ₁ = {sigma1_mpa:.3f} MPa.",
            f"Resultant compression wedge force above NA: F_C = ½ × σ₁ × b × (d₁/2) = {f_wedge_n:,.1f} N.",
            f"Internal lever arm between wedge centroids: z = ⅔ d₁ = {lever_arm_mm:.2f} mm ⇒ M_int = F_C·z = {m_reconstructed_knm:.4f} kNm = M.",
        ),
    )

    return WorkedExampleSolution(
        example_id="EX-4.1",
        module_number=4,
        title="Rectangular Timber Joist Section Properties (I, Z) and Bending Stress Comparison",
        problem_statement=(
            f"For a rectangular timber joist of width b = {b:g} mm and depth d₁ = {d1:g} mm under "
            f"bending moment M = {m_knm:g} kNm, calculate I, Z, and extreme-fibre bending stress σ. "
            f"Compare with a deeper {b:g} mm × {d2:g} mm joist."
        ),
        assumptions=(
            "Homogeneous linear-elastic rectangular cross-section symmetric about horizontal neutral axis.",
            "Plane sections remain plane (Euler-Bernoulli bending); uniaxial bending about major axis.",
        ),
        sign_convention="Under sagging moment M, extreme top fibre is in compression and bottom fibre in tension.",
        inputs={"b_mm": b, "d1_mm": d1, "d2_mm": d2, "moment_knm": m_knm},
        intermediate_steps=(
            f"1. Section 1 ({b:g}×{d1:g} mm): I₁ = bd₁³/12 = {i1_mm4:,.0f} mm⁴; Z₁ = bd₁²/6 = {z1_mm3:,.0f} mm³.",
            f"2. Bending stress in {b:g}×{d1:g} mm joist: σ₁ = M / Z₁ = {m_nmm:,.0f} Nmm / {z1_mm3:,.0f} mm³ = {sigma1_mpa:.3f} MPa.",
            f"3. Section 2 ({b:g}×{d2:g} mm): I₂ = bd₂³/12 = {i2_mm4:,.0f} mm⁴; Z₂ = bd₂²/6 = {z2_mm3:,.0f} mm³.",
            f"4. Bending stress in {b:g}×{d2:g} mm joist: σ₂ = M / Z₂ = {m_nmm:,.0f} Nmm / {z2_mm3:,.0f} mm³ = {sigma2_mpa:.3f} MPa.",
        ),
        results={
            "i1_mm4": i1_mm4,
            "z1_mm3": z1_mm3,
            "sigma1_mpa": sigma1_mpa,
            "i2_mm4": i2_mm4,
            "z2_mm3": z2_mm3,
            "sigma2_mpa": sigma2_mpa,
        },
        result_units={
            "i1_mm4": "mm⁴",
            "z1_mm3": "mm³",
            "sigma1_mpa": "MPa",
            "i2_mm4": "mm⁴",
            "z2_mm3": "mm³",
            "sigma2_mpa": "MPa",
        },
        primary_answer=sigma1_mpa,
        primary_unit="MPa",
        independent_check=check,
        engineering_interpretation=(
            f"Increasing depth by a factor of {d2/d1:.3f} ({d1:g} → {d2:g} mm) increases I by ({d2/d1:.3f})³ = {(d2/d1)**3:.3f}× "
            f"and Z by ({d2/d1:.3f})² = {(d2/d1)**2:.3f}×, reducing bending stress from {sigma1_mpa:.2f} MPa to {sigma2_mpa:.2f} MPa."
        ),
        portfolio_category="section_properties_bending",
    )


def solve_ex_4_2_parallel_axis_i_section(
    flange_b_mm: float = 150.0,
    flange_t_mm: float = 20.0,
    web_h_mm: float = 200.0,
    web_t_mm: float = 10.0,
) -> WorkedExampleSolution:
    """
    Example 4.2: Symmetric I-section built from three rectangles -> calculate I_xx using the parallel axis theorem.
    Independent Check: Outer bounding rectangle B*H^3/12 minus two symmetric air voids (B - t_w)*h_w^3/12.
    """
    bf = _require_positive("flange_b_mm", flange_b_mm)
    tf = _require_positive("flange_t_mm", flange_t_mm)
    hw = _require_positive("web_h_mm", web_h_mm)
    tw = _require_positive("web_t_mm", web_t_mm)
    if tw >= bf:
        raise ValueError(f"Web thickness ({tw} mm) must be strictly less than flange width ({bf} mm).")

    total_h_mm = hw + 2.0 * tf
    # Primary Method: Parallel Axis Theorem sum over 2 flanges + 1 web
    i_web_mm4 = (tw * (hw**3)) / 12.0
    i_flange_own_mm4 = (bf * (tf**3)) / 12.0
    a_flange_mm2 = bf * tf
    dy_flange_mm = 0.5 * hw + 0.5 * tf
    i_one_flange_pat_mm4 = i_flange_own_mm4 + a_flange_mm2 * (dy_flange_mm**2)
    ixx_pat_mm4 = i_web_mm4 + 2.0 * i_one_flange_pat_mm4
    zxx_mm3 = ixx_pat_mm4 / (0.5 * total_h_mm)

    # Independent Check: Outer bounding box minus inner side voids (no Parallel Axis shift required)
    ixx_void_subtraction_mm4 = (bf * (total_h_mm**3) - (bf - tw) * (hw**3)) / 12.0
    rel_err = abs(ixx_pat_mm4 - ixx_void_subtraction_mm4) / ixx_pat_mm4

    check = IndependentCheckTrace(
        method_name="Outer Bounding Rectangle Minus Inner Side Voids: [B·H³ - (B - t_w)·h_w³] / 12",
        passed=rel_err < 1e-12,
        primary_metric=ixx_pat_mm4,
        check_metric=ixx_void_subtraction_mm4,
        unit="mm⁴",
        rel_discrepancy=rel_err,
        steps=(
            f"Overall section depth H = h_w + 2t_f = {hw:g} + 2({tf:g}) = {total_h_mm:g} mm.",
            f"Outer rectangle I_outer = B·H³/12 = {bf:g} × {total_h_mm:g}³ / 12 = {(bf * total_h_mm**3)/12.0:,.0f} mm⁴.",
            f"Two air voids width (B - t_w) = {bf - tw:g} mm, height h_w = {hw:g} mm: I_voids = {(bf - tw)*(hw**3)/12.0:,.0f} mm⁴.",
            f"I_xx = I_outer - I_voids = {ixx_void_subtraction_mm4:,.0f} mm⁴.",
        ),
    )

    return WorkedExampleSolution(
        example_id="EX-4.2",
        module_number=4,
        title="Symmetric I-Section Second Moment of Area via Parallel Axis Theorem",
        problem_statement=(
            f"A doubly symmetric welded I-section consists of two {bf:g} mm × {tf:g} mm flanges "
            f"and a {hw:g} mm × {tw:g} mm web (overall depth H = {total_h_mm:g} mm). "
            f"Calculate major-axis I_xx using the Parallel Axis Theorem."
        ),
        assumptions=(
            "Doubly symmetric cross-section; neutral axis lies at mid-depth H/2.",
            "Sharp-cornered rectangular plates (fillet welds neglected).",
        ),
        sign_convention="Distances d_i from neutral axis squared (d_i² > 0).",
        inputs={
            "flange_b_mm": bf,
            "flange_t_mm": tf,
            "web_h_mm": hw,
            "web_t_mm": tw,
        },
        intermediate_steps=(
            f"1. Web contribution about NA: I_web = t_w h_w³ / 12 = {tw:g} × {hw:g}³ / 12 = {i_web_mm4:,.0f} mm⁴.",
            f"2. Single flange local inertia: I_f,own = b_f t_f³ / 12 = {bf:g} × {tf:g}³ / 12 = {i_flange_own_mm4:,.0f} mm⁴.",
            f"3. Flange centroidal offset from NA: d_f = h_w/2 + t_f/2 = {dy_flange_mm:.1f} mm; A_f d_f² = {a_flange_mm2:g} × {dy_flange_mm:.1f}² = {a_flange_mm2 * dy_flange_mm**2:,.0f} mm⁴.",
            f"4. Total I_xx = I_web + 2(I_f,own + A_f d_f²) = {ixx_pat_mm4:,.0f} mm⁴ ({ixx_pat_mm4/1e6:.2f} × 10⁶ mm⁴); W_el,xx = {zxx_mm3:,.0f} mm³.",
        ),
        results={
            "total_h_mm": total_h_mm,
            "i_web_mm4": i_web_mm4,
            "i_flange_total_mm4": 2.0 * i_one_flange_pat_mm4,
            "ixx_mm4": ixx_pat_mm4,
            "zxx_mm3": zxx_mm3,
        },
        result_units={
            "total_h_mm": "mm",
            "i_web_mm4": "mm⁴",
            "i_flange_total_mm4": "mm⁴",
            "ixx_mm4": "mm⁴",
            "zxx_mm3": "mm³",
        },
        primary_answer=ixx_pat_mm4,
        primary_unit="mm⁴",
        independent_check=check,
        engineering_interpretation=(
            f"The two flanges provide {(2.0*i_one_flange_pat_mm4/ixx_pat_mm4)*100.0:.1f}% of the total major-axis I_xx "
            f"({2.0*i_one_flange_pat_mm4/1e6:.2f} vs {ixx_pat_mm4/1e6:.2f} × 10⁶ mm⁴) via the Parallel Axis Ad² term."
        ),
        portfolio_category="section_properties_bending",
    )


def solve_ex_4_3_ub_major_minor_axis_comparison(
    depth_h_mm: float = 406.4,
    width_b_mm: float = 177.8,
    iy_cm4: float = 21500.0,
    iz_cm4: float = 1200.0,
    test_moment_knm: float = 50.0,
) -> WorkedExampleSolution:
    """
    Example 4.3: Major vs minor axis of a UB -> explain and calculate why oriented with web vertical.
    SAFEGUARD REQUIREMENT: Explicitly flagged as REFERENCE_VERIFICATION_REQUIRED.
    Distinguishes mathematical verification from verification of actual section-table data.
    """
    h = _require_positive("depth_h_mm", depth_h_mm)
    b = _require_positive("width_b_mm", width_b_mm)
    iy_val_cm4 = _require_positive("iy_cm4", iy_cm4)
    iz_val_cm4 = _require_positive("iz_cm4", iz_cm4)
    m_knm = _require_positive("test_moment_knm", test_moment_knm)

    iy_mm4 = convert_value(iy_val_cm4, "cm⁴", "mm⁴")
    iz_mm4 = convert_value(iz_val_cm4, "cm⁴", "mm⁴")
    m_nmm = convert_value(m_knm, "kNm", "Nmm")

    zy_mm3 = iy_mm4 / (0.5 * h)
    zz_mm3 = iz_mm4 / (0.5 * b)

    stiffness_ratio = iy_mm4 / iz_mm4
    modulus_ratio = zy_mm3 / zz_mm3

    # Independent check: Compare extreme fibre bending stresses under identical test moment M
    sigma_major_mpa = m_nmm / zy_mm3
    sigma_minor_mpa = m_nmm / zz_mm3
    stress_ratio = sigma_minor_mpa / sigma_major_mpa
    rel_err = abs(stress_ratio - modulus_ratio) / modulus_ratio

    check = IndependentCheckTrace(
        method_name="Equal-Moment Extreme-Fibre Stress Ratio (σ_minor / σ_major) vs Section Modulus Ratio (W_el,y / W_el,z)",
        passed=rel_err < 1e-12,
        primary_metric=modulus_ratio,
        check_metric=stress_ratio,
        unit="-",
        rel_discrepancy=rel_err,
        steps=(
            f"Apply test moment M = {m_knm:g} kNm about major axis: σ_y = M / W_el,y = {sigma_major_mpa:.2f} MPa.",
            f"Apply same moment M = {m_knm:g} kNm about minor axis: σ_z = M / W_el,z = {sigma_minor_mpa:.2f} MPa.",
            f"Stress ratio σ_z / σ_y = {stress_ratio:.4f} matches section modulus ratio W_el,y / W_el,z = {modulus_ratio:.4f}.",
        ),
    )

    return WorkedExampleSolution(
        example_id="EX-4.3",
        module_number=4,
        title="Major vs Minor Axis of a Universal Beam (User-Supplied / Illustrative Properties)",
        problem_statement=(
            f"Given supplied or user-entered Universal Beam properties (h = {h:g} mm, b = {b:g} mm, "
            f"I_y = {iy_val_cm4:g} cm⁴, I_z = {iz_val_cm4:g} cm⁴), compute major and minor elastic "
            f"section moduli and compare bending stiffness and stress under M = {m_knm:g} kNm."
        ),
        assumptions=(
            "MATHEMATICAL VERIFICATION ONLY: Formulae W_el,y = I_y/(h/2), W_el,z = I_z/(b/2), and σ = M/W_el are exact.",
            "REFERENCE VERIFICATION REQUIRED: Exact rolled UB section properties (accounting for root radii) must be verified against a controlled SCI Blue Book / BS EN 10365 table.",
        ),
        sign_convention="Major axis (y-y) perpendicular to web; Minor axis (z-z) parallel to web.",
        inputs={
            "depth_h_mm": h,
            "width_b_mm": b,
            "iy_cm4": iy_val_cm4,
            "iz_cm4": iz_val_cm4,
            "test_moment_knm": m_knm,
        },
        intermediate_steps=(
            f"1. Convert supplied inertias: I_y = {iy_mm4:,.0f} mm⁴; I_z = {iz_mm4:,.0f} mm⁴.",
            f"2. Elastic section moduli from supplied dimensions: W_el,y = I_y/(h/2) = {zy_mm3:,.0f} mm³; W_el,z = I_z/(b/2) = {zz_mm3:,.0f} mm³.",
            f"3. Flexural stiffness ratio: I_y / I_z = {stiffness_ratio:.2f}× stiffer with web vertical.",
            f"4. Elastic bending strength ratio: W_el,y / W_el,z = {modulus_ratio:.2f}× lower stress with web vertical ({sigma_major_mpa:.1f} MPa vs {sigma_minor_mpa:.1f} MPa).",
        ),
        results={
            "iy_mm4": iy_mm4,
            "iz_mm4": iz_mm4,
            "zy_mm3": zy_mm3,
            "zz_mm3": zz_mm3,
            "stiffness_ratio": stiffness_ratio,
            "modulus_ratio": modulus_ratio,
            "sigma_major_mpa": sigma_major_mpa,
            "sigma_minor_mpa": sigma_minor_mpa,
        },
        result_units={
            "iy_mm4": "mm⁴",
            "iz_mm4": "mm⁴",
            "zy_mm3": "mm³",
            "zz_mm3": "mm³",
            "stiffness_ratio": "-",
            "modulus_ratio": "-",
            "sigma_major_mpa": "MPa",
            "sigma_minor_mpa": "MPa",
        },
        primary_answer=stiffness_ratio,
        primary_unit="-",
        independent_check=check,
        engineering_interpretation=(
            f"Orienting a UB with its web vertical places the flanges at maximum distance ±h/2 from the neutral axis, "
            f"giving {stiffness_ratio:.1f}× the flexural stiffness and {modulus_ratio:.1f}× the elastic moment capacity of flatwise bending."
        ),
        reference_verification_status=ReferenceVerificationStatus.REFERENCE_VERIFICATION_REQUIRED.value,
        reference_verification_note=(
            "Reference verification required: Mathematical relationships are deterministically verified, "
            "but exact rolled UB section-table values must be taken from an authoritative SCI / SteelConstruction.info table."
        ),
        portfolio_category="section_properties_bending",
    )


def solve_ex_4_4_elastic_vs_plastic_rectangle(
    b_mm: float = 50.0,
    d_mm: float = 150.0,
    fy_mpa: float = 275.0,
) -> WorkedExampleSolution:
    """
    Example 4.4: Compare elastic and plastic section modulus for a rectangle and explain the physical difference.
    Independent Check: Plastic stress-block force-couple integration (F_pl = f_y * b * d/2, lever arm z_pl = d/2).
    """
    b = _require_positive("b_mm", b_mm)
    d = _require_positive("d_mm", d_mm)
    fy = _require_positive("fy_mpa", fy_mpa)

    w_el_mm3 = (b * (d**2)) / 6.0
    w_pl_mm3 = (b * (d**2)) / 4.0
    shape_factor = w_pl_mm3 / w_el_mm3

    m_el_knm = convert_value(fy * w_el_mm3, "Nmm", "kNm")
    m_pl_knm = convert_value(fy * w_pl_mm3, "Nmm", "kNm")

    # Independent check: Direct equilibrium of rectangular plastic compression/tension stress blocks
    half_area_mm2 = b * (0.5 * d)
    f_block_n = fy * half_area_mm2
    lever_arm_pl_mm = 0.5 * d
    m_pl_from_couple_knm = convert_value(f_block_n * lever_arm_pl_mm, "Nmm", "kNm")
    rel_err = max(
        abs(m_pl_from_couple_knm - m_pl_knm) / m_pl_knm,
        abs((m_pl_from_couple_knm / m_el_knm) - 1.5) / 1.5,
    )

    check = IndependentCheckTrace(
        method_name="Equal-Area Rectangular Plastic Stress-Block Force Couple (F_block × d/2)",
        passed=rel_err < 1e-12,
        primary_metric=m_pl_knm,
        check_metric=m_pl_from_couple_knm,
        unit="kNm",
        rel_discrepancy=rel_err,
        steps=(
            f"Half-section area in full yield: A_half = b(d/2) = {half_area_mm2:,.1f} mm²; block force F_pl = f_y A_half = {f_block_n:,.1f} N.",
            f"Plastic lever arm between half-depth centroids: z_pl = d/4 + d/4 = d/2 = {lever_arm_pl_mm:.2f} mm.",
            f"Plastic moment from couple: M_pl = F_pl × z_pl = {m_pl_from_couple_knm:.4f} kNm; M_pl / M_el = {m_pl_from_couple_knm / m_el_knm:.4f}.",
        ),
    )

    return WorkedExampleSolution(
        example_id="EX-4.4",
        module_number=4,
        title="Elastic vs Plastic Section Modulus and Shape Factor for a Rectangle",
        problem_statement=(
            f"For a rectangular steel bar of width b = {b:g} mm, depth d = {d:g} mm, and yield strength "
            f"f_y = {fy:g} MPa, calculate W_el, W_pl, M_el, M_pl, and the plastic shape factor."
        ),
        assumptions=(
            "Elastic-perfectly plastic material behaviour with symmetric tensile and compressive yield f_y.",
            "Full plastic hinge assumes zero axial force so equal-area axis coincides with mid-depth d/2.",
        ),
        sign_convention="First yield at extreme fibre (y = ±d/2) defines M_el; full Rectangular Stress Block defines M_pl.",
        inputs={"b_mm": b, "d_mm": d, "fy_mpa": fy},
        intermediate_steps=(
            f"1. Elastic section modulus: W_el = bd²/6 = {b:g} × {d:g}² / 6 = {w_el_mm3:,.1f} mm³.",
            f"2. Plastic section modulus: W_pl = bd²/4 = {b:g} × {d:g}² / 4 = {w_pl_mm3:,.1f} mm³.",
            f"3. First-yield moment: M_el = f_y W_el = {m_el_knm:.3f} kNm; Full plastic moment: M_pl = f_y W_pl = {m_pl_knm:.3f} kNm.",
            f"4. Shape factor: α_pl = W_pl / W_el = (bd²/4) / (bd²/6) = {shape_factor:.3f}.",
        ),
        results={
            "w_el_mm3": w_el_mm3,
            "w_pl_mm3": w_pl_mm3,
            "m_el_knm": m_el_knm,
            "m_pl_knm": m_pl_knm,
            "shape_factor": shape_factor,
        },
        result_units={
            "w_el_mm3": "mm³",
            "w_pl_mm3": "mm³",
            "m_el_knm": "kNm",
            "m_pl_knm": "kNm",
            "shape_factor": "-",
        },
        primary_answer=shape_factor,
        primary_unit="-",
        independent_check=check,
        engineering_interpretation=(
            "A rectangular section has 50% reserve bending capacity beyond first yield (shape factor 1.50) "
            "because a large proportion of its area lies near the neutral axis and only yields as plasticity spreads inward."
        ),
        portfolio_category="section_properties_bending",
    )


# ==============================================================================
# MODULE 5 — Beam Deflection, Stiffness & Serviceability
# ==============================================================================


def solve_ex_5_1_udl_deflection_sensitivity(
    span1_m: float = 4.0,
    span2_m: float = 5.0,
    depth_ratio: float = 1.25,
    w_kn_per_m: float = 12.0,
    b_mm: float = 100.0,
    d_mm: float = 200.0,
    e_gpa: float = 210.0,
) -> WorkedExampleSolution:
    """
    Example 5.1: Compare the deflection of a simply supported beam when span increases from 4 m to 5 m,
    when section depth increases by 25%, and when steel grade changes from S275 to S355.
    Independent Check: Numerical integration of Second Moment-Area Theorem δ_max = ∫₀^{L/2} x * M(x)/(EI) dx.
    """
    L1_m = _require_positive("span1_m", span1_m)
    L2_m = _require_positive("span2_m", span2_m)
    d_rat = _require_positive("depth_ratio", depth_ratio)
    w_val = _require_positive("w_kn_per_m", w_kn_per_m)
    b = _require_positive("b_mm", b_mm)
    d = _require_positive("d_mm", d_mm)
    e_val = _require_positive("e_gpa", e_gpa)

    L1_mm = convert_value(L1_m, "m", "mm")
    L2_mm = convert_value(L2_m, "m", "mm")
    w_n_mm = convert_value(w_val, "kN/m", "N/mm")
    e_mpa = convert_value(e_val, "GPa", "N/mm²")

    i1_mm4 = (b * (d**3)) / 12.0
    ei1_nmm2 = e_mpa * i1_mm4

    delta1_mm = (5.0 * w_n_mm * (L1_mm**4)) / (384.0 * ei1_nmm2)
    delta2_span_mm = (5.0 * w_n_mm * (L2_mm**4)) / (384.0 * ei1_nmm2)
    span_factor = delta2_span_mm / delta1_mm

    i_deeper_mm4 = (b * ((d * d_rat) ** 3)) / 12.0
    delta_deeper_mm = (5.0 * w_n_mm * (L1_mm**4)) / (384.0 * e_mpa * i_deeper_mm4)
    depth_factor = delta_deeper_mm / delta1_mm
    grade_factor_s275_to_s355 = 1.0  # E = 210 GPa for both S275 and S355

    # Independent check: Second Moment-Area Theorem (tangential deviation of support A from horizontal midspan tangent)
    # δ_max = ∫₀^{L1/2} x * M(x) / (EI) dx where M(x) = (w*L1/2)*x - w*x^2/2
    def moment_area_integrand(x_mm: float) -> float:
        m_x = 0.5 * w_n_mm * L1_mm * x_mm - 0.5 * w_n_mm * (x_mm**2)
        return x_mm * (m_x / ei1_nmm2)

    delta1_moment_area_mm = _simpson_integrate(moment_area_integrand, 0.0, 0.5 * L1_mm, n=200)
    rel_err = abs(delta1_moment_area_mm - delta1_mm) / delta1_mm

    check = IndependentCheckTrace(
        method_name="Second Moment-Area Theorem Quadrature: δ_max = ∫₀^{L/2} x · [M(x)/EI] dx",
        passed=rel_err < 1e-12,
        primary_metric=delta1_mm,
        check_metric=delta1_moment_area_mm,
        unit="mm",
        rel_discrepancy=rel_err,
        steps=(
            f"By symmetry, midspan slope θ(L/2) = 0, so δ_max equals tangential deviation of x = 0 from midspan tangent.",
            f"Integrate first moment of curvature diagram: ∫₀^{0.5*L1_mm:g} x · M(x)/(EI) dx = {delta1_moment_area_mm:.5f} mm.",
            f"Matches closed-form 5wL⁴/(384EI) = {delta1_mm:.5f} mm (discrepancy {rel_err:.2e}).",
        ),
    )

    return WorkedExampleSolution(
        example_id="EX-5.1",
        module_number=5,
        title="Beam Deflection Sensitivity to Span (L⁴), Depth (1/d³), and Steel Grade (E)",
        problem_statement=(
            f"Compare the midspan deflection δ = 5wL⁴/(384EI) of a simply supported beam when: "
            f"(a) span increases from {L1_m:g} m to {L2_m:g} m, (b) rectangular section depth increases by "
            f"{(d_rat - 1.0)*100.0:g}%, and (c) steel grade changes from S275 to S355."
        ),
        assumptions=(
            "Linear elastic Euler-Bernoulli beam (shear deformation neglected).",
            "Structural steels S275 and S355 share the same elastic modulus E = 210 GPa.",
        ),
        sign_convention="Downward vertical deflection (+δ) positive.",
        inputs={
            "span1_m": L1_m,
            "span2_m": L2_m,
            "depth_ratio": d_rat,
            "w_kn_per_m": w_val,
            "b_mm": b,
            "d_mm": d,
            "e_gpa": e_val,
        },
        intermediate_steps=(
            f"1. Baseline deflection at L₁ = {L1_m:g} m: δ₁ = 5wL₁⁴/(384EI₁) = {delta1_mm:.3f} mm (L₁/δ₁ = {L1_mm/delta1_mm:.0f}).",
            f"2. Span increase {L1_m:g} m → {L2_m:g} m: factor = ({L2_m:g}/{L1_m:g})⁴ = {span_factor:.4f}× (δ₂ = {delta2_span_mm:.3f} mm, +{((span_factor-1)*100):.1f}%).",
            f"3. Depth increase by {(d_rat-1)*100:g}%: I scales as {d_rat:g}³ = {d_rat**3:.4f}×, so δ scales as 1/{d_rat:g}³ = {depth_factor:.3f}× (δ = {delta_deeper_mm:.3f} mm, -{(1-depth_factor)*100:.1f}%).",
            f"4. Steel grade change S275 → S355: E remains {e_val:g} GPa, so elastic deflection factor = {grade_factor_s275_to_s355:.1f}× (0% change!).",
        ),
        results={
            "delta1_mm": delta1_mm,
            "delta2_span_mm": delta2_span_mm,
            "span_factor": span_factor,
            "delta_deeper_mm": delta_deeper_mm,
            "depth_factor": depth_factor,
            "grade_factor_s275_to_s355": grade_factor_s275_to_s355,
        },
        result_units={
            "delta1_mm": "mm",
            "delta2_span_mm": "mm",
            "span_factor": "-",
            "delta_deeper_mm": "mm",
            "depth_factor": "-",
            "grade_factor_s275_to_s355": "-",
        },
        primary_answer=span_factor,
        primary_unit="-",
        independent_check=check,
        engineering_interpretation=(
            f"Increasing span by 25% ({L1_m:g} → {L2_m:g} m) nearly scales deflection by 2.44×, whereas "
            f"upgrading steel strength from S275 to S355 does NOTHING to reduce elastic deflection because E is unchanged."
        ),
        portfolio_category="deflection_check",
    )


# ==============================================================================
# MODULE 6 — Columns, Buckling & Structural Stability
# ==============================================================================


def solve_ex_6_1_euler_column_comparison(
    length_mm: float = 4000.0,
    e_gpa: float = 210.0,
    i_mm4: float = 8.0e6,
    area_mm2: float = 2500.0,
) -> WorkedExampleSolution:
    """
    Example 6.1: Compare the theoretical Euler buckling load of a pinned-pinned column (L_cr = 1.0 L)
    and a fixed-fixed column (L_cr = 0.5 L) of the same length.
    Independent Check: Radius of gyration i = sqrt(I/A), slenderness lambda = L_cr / i, and Euler critical
    stress sigma_cr = pi^2 * E / lambda^2 multiplied by area A.
    """
    L_mm = _require_positive("length_mm", length_mm)
    e_val = _require_positive("e_gpa", e_gpa)
    I_mm4 = _require_positive("i_mm4", i_mm4)
    A_mm2 = _require_positive("area_mm2", area_mm2)

    e_mpa = convert_value(e_val, "GPa", "N/mm²")

    lcr_pinned_mm = 1.0 * L_mm
    lcr_fixed_mm = 0.5 * L_mm

    pcr_pinned_n = (math.pi**2 * e_mpa * I_mm4) / (lcr_pinned_mm**2)
    pcr_fixed_n = (math.pi**2 * e_mpa * I_mm4) / (lcr_fixed_mm**2)

    pcr_pinned_kn = convert_value(pcr_pinned_n, "N", "kN")
    pcr_fixed_kn = convert_value(pcr_fixed_n, "N", "kN")
    capacity_ratio = pcr_fixed_kn / pcr_pinned_kn

    # Independent check: Compute radius of gyration r = sqrt(I/A), slenderness lambda = L_cr / r,
    # critical stress sigma_cr = pi^2 * E / lambda^2, and P_cr = sigma_cr * A
    r_gyration_mm = math.sqrt(I_mm4 / A_mm2)
    lambda_pinned = lcr_pinned_mm / r_gyration_mm
    lambda_fixed = lcr_fixed_mm / r_gyration_mm
    sigma_cr_pinned_mpa = (math.pi**2 * e_mpa) / (lambda_pinned**2)
    sigma_cr_fixed_mpa = (math.pi**2 * e_mpa) / (lambda_fixed**2)
    pcr_pinned_via_stress_kn = convert_value(sigma_cr_pinned_mpa * A_mm2, "N", "kN")
    pcr_fixed_via_stress_kn = convert_value(sigma_cr_fixed_mpa * A_mm2, "N", "kN")

    rel_err = max(
        abs(pcr_pinned_via_stress_kn - pcr_pinned_kn) / pcr_pinned_kn,
        abs(pcr_fixed_via_stress_kn - pcr_fixed_kn) / pcr_fixed_kn,
    )

    check = IndependentCheckTrace(
        method_name="Radius of Gyration (i = √(I/A)), Slenderness (λ = L_cr/i), and Critical Stress (P_cr = σ_cr·A)",
        passed=rel_err < 1e-12,
        primary_metric=pcr_pinned_kn,
        check_metric=pcr_pinned_via_stress_kn,
        unit="kN",
        rel_discrepancy=rel_err,
        steps=(
            f"Radius of gyration: i = √(I/A) = √({I_mm4:,.0f} / {A_mm2:g}) = {r_gyration_mm:.3f} mm.",
            f"Pinned-pinned slenderness λ_pin = {lcr_pinned_mm:g}/{r_gyration_mm:.3f} = {lambda_pinned:.2f} ⇒ σ_cr = π²E/λ² = {sigma_cr_pinned_mpa:.2f} MPa ⇒ P_cr = σ_cr·A = {pcr_pinned_via_stress_kn:.2f} kN.",
            f"Fixed-fixed slenderness λ_fix = {lambda_fixed:.2f} (halved) ⇒ σ_cr = {sigma_cr_fixed_mpa:.2f} MPa (quadrupled) ⇒ P_cr = {pcr_fixed_via_stress_kn:.2f} kN.",
        ),
    )

    return WorkedExampleSolution(
        example_id="EX-6.1",
        module_number=6,
        title="Euler Buckling Load Comparison: Pinned-Pinned vs Fixed-Fixed Column",
        problem_statement=(
            f"Compare the theoretical elastic Euler buckling load P_cr = π²EI / L_cr² of a column of length "
            f"L = {L_mm/1000.0:g} m ({L_mm:g} mm), E = {e_val:g} GPa, and minor-axis I = {I_mm4:,.0f} mm⁴ "
            f"when pinned-pinned (L_cr = 1.0L) versus fixed-fixed against rotation (L_cr = 0.5L)."
        ),
        assumptions=(
            "Initially straight, concentrically loaded, prismatic elastic column (no initial bow or residual stress).",
            "Buckling occurs about the governing axis of minimum flexural rigidity EI ( highest slenderness λ).",
        ),
        sign_convention="Axial compression (+P) positive.",
        inputs={
            "length_mm": L_mm,
            "e_gpa": e_val,
            "i_mm4": I_mm4,
            "area_mm2": A_mm2,
        },
        intermediate_steps=(
            f"1. Pinned-pinned effective length: L_cr,pin = 1.0 L = {lcr_pinned_mm:g} mm ⇒ P_cr,pin = π²EI / L² = {pcr_pinned_kn:.2f} kN.",
            f"2. Fixed-fixed effective length: L_cr,fix = 0.5 L = {lcr_fixed_mm:g} mm ⇒ P_cr,fix = π²EI / (0.5L)² = {pcr_fixed_kn:.2f} kN.",
            f"3. Buckling capacity ratio: P_cr,fix / P_cr,pin = (1 / 0.5)² = {capacity_ratio:.2f}×.",
        ),
        results={
            "lcr_pinned_mm": lcr_pinned_mm,
            "lcr_fixed_mm": lcr_fixed_mm,
            "pcr_pinned_kn": pcr_pinned_kn,
            "pcr_fixed_kn": pcr_fixed_kn,
            "capacity_ratio": capacity_ratio,
            "r_gyration_mm": r_gyration_mm,
            "lambda_pinned": lambda_pinned,
            "lambda_fixed": lambda_fixed,
        },
        result_units={
            "lcr_pinned_mm": "mm",
            "lcr_fixed_mm": "mm",
            "pcr_pinned_kn": "kN",
            "pcr_fixed_kn": "kN",
            "capacity_ratio": "-",
            "r_gyration_mm": "mm",
            "lambda_pinned": "-",
            "lambda_fixed": "-",
        },
        primary_answer=pcr_pinned_kn,
        primary_unit="kN",
        independent_check=check,
        engineering_interpretation=(
            f"Halving the effective buckling length from {lcr_pinned_mm:g} mm to {lcr_fixed_mm:g} mm "
            f"quadruples the theoretical elastic buckling load ({pcr_pinned_kn:.1f} kN → {pcr_fixed_kn:.1f} kN)."
        ),
        portfolio_category="column_buckling",
    )


WORKED_EXAMPLE_SOLVERS: Dict[str, Callable[..., WorkedExampleSolution]] = {
    "EX-0.1": solve_ex_0_1_unit_conversions,
    "EX-0.2": solve_ex_0_2_inclined_force,
    "EX-0.3": solve_ex_0_3_udl_resultant,
    "EX-1.1": solve_ex_1_1_ss_beam_udl_reactions,
    "EX-1.2": solve_ex_1_2_ss_beam_point_load_reactions,
    "EX-1.3": solve_ex_1_3_tributary_floor_load,
    "EX-2.1": solve_ex_2_1_ss_beam_udl_sfd_bmd,
    "EX-2.2": solve_ex_2_2_cantilever_udl_sfd_bmd,
    "EX-2.3": solve_ex_2_3_ss_beam_point_load_sfd_bmd,
    "EX-3.1": solve_ex_3_1_steel_tie,
    "EX-3.2": solve_ex_3_2_steel_vs_aluminium_extension,
    "EX-4.1": solve_ex_4_1_rectangle_section_properties,
    "EX-4.2": solve_ex_4_2_parallel_axis_i_section,
    "EX-4.3": solve_ex_4_3_ub_major_minor_axis_comparison,
    "EX-4.4": solve_ex_4_4_elastic_vs_plastic_rectangle,
    "EX-5.1": solve_ex_5_1_udl_deflection_sensitivity,
    "EX-6.1": solve_ex_6_1_euler_column_comparison,
}


def solve_worked_example(example_id: str, **overrides: Any) -> WorkedExampleSolution:
    """Execute the deterministic solver for a given Module 0–6 worked example ID."""
    if example_id not in WORKED_EXAMPLE_SOLVERS:
        raise ValueError(
            f"No deterministic solver registered for worked example '{example_id}'. "
            f"Supported IDs: {sorted(WORKED_EXAMPLE_SOLVERS.keys())}"
        )
    return WORKED_EXAMPLE_SOLVERS[example_id](**overrides)
