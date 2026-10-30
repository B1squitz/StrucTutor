"""
Strictly typed physical quantities with semantic structural engineering distinctions.

Crucial pedagogical guarantee:
Quantities that share identical physical dimensions (such as First Moment of Area Q [L^3]
and Elastic Section Modulus W_el [L^3], or Second Moment of Area I [L^4] and Polar Second
Moment of Area J [L^4]) are represented by distinct QuantityKind definitions and CANNOT
be silently substituted or added together.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from enum import Enum
from typing import Dict, Optional, Tuple

from structtutor.domain.units import (
    DIM_AREA,
    DIM_DIMENSIONLESS,
    DIM_DISTRIBUTED_LOAD,
    DIM_FLEXURAL_RIGIDITY,
    DIM_FORCE,
    DIM_INERTIA_L4,
    DIM_LENGTH,
    DIM_MASS,
    DIM_MOMENT,
    DIM_STRESS,
    DIM_VOLUME_OR_MODULUS,
    DIM_WARPING_L6,
    Dimension,
    DimensionalError,
    convert_value,
    get_unit,
)


class SemanticQuantityMismatchError(DimensionalError):
    """
    Raised when two quantities have the same physical dimension (e.g. L^3 or L^4)
    but represent fundamentally different structural concepts.
    """


@dataclass(frozen=True)
class QuantitySpec:
    """Metadata and pedagogical explanation for a semantic structural quantity."""

    id: str
    name: str
    symbols: Tuple[str, ...]
    dimension: Dimension
    default_display_unit: str
    base_unit: str
    conceptual_meaning: str
    common_confusion_warning: str


class QuantityKind(Enum):
    """Enumeration of distinct structural engineering physical quantities."""

    DIMENSIONLESS = QuantitySpec(
        id="DIMENSIONLESS",
        name="Dimensionless Ratio / Factor",
        symbols=("-", "rad"),
        dimension=DIM_DIMENSIONLESS,
        default_display_unit="",
        base_unit="",
        conceptual_meaning="Pure number, ratio, angle in radians, or safety/partial factor.",
        common_confusion_warning="Check whether an empirical formula expects a dimensionless ratio or a dimensional input.",
    )
    LENGTH = QuantitySpec(
        id="LENGTH",
        name="Length / Distance / Lever Arm / Deflection",
        symbols=("L", "x", "y", "d", "b", "e", "δ"),
        dimension=DIM_LENGTH,
        default_display_unit="mm",
        base_unit="mm",
        conceptual_meaning="Linear distance, span, section dimension, eccentricity, moment arm, or displacement.",
        common_confusion_warning="Spans are typically given in metres (m) while section dimensions and deflections are in millimetres (mm): 1 m = 1,000 mm.",
    )
    AREA = QuantitySpec(
        id="AREA",
        name="Cross-Sectional Area",
        symbols=("A", "A_g", "A_net", "A_v"),
        dimension=DIM_AREA,
        default_display_unit="mm²",
        base_unit="mm²",
        conceptual_meaning="Total material surface on a cross-section (L²). Governs direct axial stress (σ = N/A) and shear area.",
        common_confusion_warning="1 m² = 10⁶ mm² (not 1,000 mm²). Area (L²) alone does not measure bending stiffness without knowing how far the area lies from the neutral axis.",
    )
    FIRST_MOMENT_OF_AREA = QuantitySpec(
        id="FIRST_MOMENT_OF_AREA",
        name="First Moment of Area (Statical Moment)",
        symbols=("Q", "S_y", "S_x"),
        dimension=DIM_VOLUME_OR_MODULUS,
        default_display_unit="mm³",
        base_unit="mm³",
        conceptual_meaning=(
            "Integral of (A × y) for a specific portion of a cross-section above or below a cut level (L³). "
            "Used to find the centroid (y_bar = Σ(A_i y_i) / ΣA_i) and longitudinal/transverse shear flow (τ = VQ / (Ib))."
        ),
        common_confusion_warning=(
            "Although First Moment of Area Q has units of mm³ (L³), it is NOT the Elastic Section Modulus (W_el = I / y_max). "
            "Never use Q in σ = M / W_el."
        ),
    )
    ELASTIC_SECTION_MODULUS = QuantitySpec(
        id="ELASTIC_SECTION_MODULUS",
        name="Elastic Section Modulus",
        symbols=("W_el", "Z", "S"),
        dimension=DIM_VOLUME_OR_MODULUS,
        default_display_unit="mm³",
        base_unit="mm³",
        conceptual_meaning=(
            "Ratio of Second Moment of Area to extreme fibre distance: W_el = I / y_max (L³). "
            "Directly relates elastic bending moment M to peak extreme-fibre bending stress: σ_max = M / W_el."
        ),
        common_confusion_warning=(
            "Shares dimensions (L³) with First Moment of Area (Q) and Plastic Section Modulus (W_pl), "
            "but applies strictly to linear-elastic bending stress at the extreme fibre."
        ),
    )
    PLASTIC_SECTION_MODULUS = QuantitySpec(
        id="PLASTIC_SECTION_MODULUS",
        name="Plastic Section Modulus",
        symbols=("W_pl", "Z_p"),
        dimension=DIM_VOLUME_OR_MODULUS,
        default_display_unit="mm³",
        base_unit="mm³",
        conceptual_meaning=(
            "Sum of first moments of area of the tension and compression halves about the Equal Area Axis (plastic neutral axis) (L³). "
            "Governs full plastic moment resistance of Class 1/2 ductile sections: M_pl = W_pl × f_y."
        ),
        common_confusion_warning=(
            "Do not confuse W_pl with W_el. For a rectangular section, W_pl = b d² / 4 whereas W_el = b d² / 6 (shape factor = 1.5)."
        ),
    )
    SECOND_MOMENT_OF_AREA = QuantitySpec(
        id="SECOND_MOMENT_OF_AREA",
        name="Second Moment of Area (Planar Area Moment of Inertia)",
        symbols=("I", "I_xx", "I_yy", "I_y", "I_z"),
        dimension=DIM_INERTIA_L4,
        default_display_unit="mm⁴",
        base_unit="mm⁴",
        conceptual_meaning=(
            "Geometric integral ∫ y² dA measuring how far cross-sectional material is distributed from a specific bending axis (L⁴). "
            "Combined with material modulus E, it forms flexural rigidity EI governing beam deflection and curvature (κ = M / EI)."
        ),
        common_confusion_warning=(
            "I (L⁴) is purely geometric stiffness distribution—not material strength, and not section modulus (L³). "
            "Also, 1 m⁴ = 10¹² mm⁴ and 1 cm⁴ = 10⁴ mm⁴."
        ),
    )
    POLAR_SECOND_MOMENT_OF_AREA = QuantitySpec(
        id="POLAR_SECOND_MOMENT_OF_AREA",
        name="Polar Second Moment of Area",
        symbols=("J", "I_p"),
        dimension=DIM_INERTIA_L4,
        default_display_unit="mm⁴",
        base_unit="mm⁴",
        conceptual_meaning=(
            "Geometric integral ∫ r² dA = I_xx + I_yy about a point/pole perpendicular to the cross-section plane (L⁴). "
            "Describes resistance to twisting strictly for circular/axisymmetric shafts."
        ),
        common_confusion_warning=(
            "Has units of mm⁴ (L⁴) like planar I, but measures radial distribution about a pole rather than a bending axis. "
            "For non-circular open sections (like I-beams or channels), polar J vastly overestimates torsional stiffness—use the St. Venant Torsion Constant I_t instead."
        ),
    )
    TORSION_CONSTANT = QuantitySpec(
        id="TORSION_CONSTANT",
        name="St. Venant Torsion Constant",
        symbols=("I_t", "J_t"),
        dimension=DIM_INERTIA_L4,
        default_display_unit="mm⁴",
        base_unit="mm⁴",
        conceptual_meaning=(
            "Effective torsional stiffness constant (L⁴) in T = G I_t (dθ/dx). "
            "For thin-walled open sections, I_t ≈ Σ(b t³ / 3), which is much smaller than I_xx or polar I_p."
        ),
        common_confusion_warning=(
            "Shares L⁴ dimensions with I_xx and I_p, but must never be swapped with planar bending inertia I."
        ),
    )
    WARPING_CONSTANT = QuantitySpec(
        id="WARPING_CONSTANT",
        name="Warping Constant",
        symbols=("I_w", "C_w"),
        dimension=DIM_WARPING_L6,
        default_display_unit="mm⁶",
        base_unit="mm⁶",
        conceptual_meaning="Cross-sectional property (L⁶) governing resistance to non-uniform torsion and lateral-torsional buckling (LTB).",
        common_confusion_warning="In steel tables, I_w is often tabulated in dm⁶ (1 dm⁶ = 10¹² mm⁶) or cm⁶ (1 cm⁶ = 10⁶ mm⁶).",
    )
    FORCE = QuantitySpec(
        id="FORCE",
        name="Force / Reaction / Axial or Shear Action",
        symbols=("F", "P", "R", "V", "N"),
        dimension=DIM_FORCE,
        default_display_unit="kN",
        base_unit="N",
        conceptual_meaning="Mechanical push or pull, support reaction, internal axial force (N), or internal shear force (V).",
        common_confusion_warning="1 kN = 1,000 N. Do not add forces (kN) directly to moments (kN·m) or distributed loads (kN/m).",
    )
    MOMENT = QuantitySpec(
        id="MOMENT",
        name="Moment / Couple / Bending Moment / Torque",
        symbols=("M", "T"),
        dimension=DIM_MOMENT,
        default_display_unit="kN·m",
        base_unit="N·mm",
        conceptual_meaning="Rotational action equal to Force × Perpendicular Lever Arm (F·L), or internal bending moment at a section cut.",
        common_confusion_warning=(
            "CRITICAL CONVERSION: 1 kN·m = 1,000 N × 1,000 mm = 10⁶ N·mm. "
            "Forgetting a factor of 1,000 here is one of the most common hand-calculation errors when computing stress in N/mm² (MPa)."
        ),
    )
    DISTRIBUTED_LOAD = QuantitySpec(
        id="DISTRIBUTED_LOAD",
        name="Distributed Line Load (UDL / Varying Load Intensity)",
        symbols=("w", "q"),
        dimension=DIM_DISTRIBUTED_LOAD,
        default_display_unit="kN/m",
        base_unit="N/mm",
        conceptual_meaning="Force intensity per unit length along a member (F·L⁻¹). Total force is the area under the load diagram (∫ w dx).",
        common_confusion_warning="Conveniently, 1 kN/m = 1,000 N / 1,000 mm = 1 N/mm!",
    )
    STRESS = QuantitySpec(
        id="STRESS",
        name="Mechanical Stress / Material Strength",
        symbols=("σ", "τ", "f_y", "f_u", "f_m,k"),
        dimension=DIM_STRESS,
        default_display_unit="MPa",
        base_unit="N/mm²",
        conceptual_meaning="Internal force intensity per unit area (F·L⁻²).",
        common_confusion_warning="1 MPa = 1 N/mm² identically. Always convert moments to N·mm and section properties to mm² or mm³ so stress emerges directly in N/mm² (MPa).",
    )
    # Preserve the original public enum name for Young's modulus.  G is
    # deliberately a different kind even though both use stress units.
    ELASTIC_MODULUS = QuantitySpec(
        id="ELASTIC_MODULUS",
        name="Young's Modulus (E)",
        symbols=("E",),
        dimension=DIM_STRESS,
        default_display_unit="GPa",
        base_unit="N/mm²",
        conceptual_meaning="Longitudinal elastic stiffness, relating normal stress to strain: E = σ / ε.",
        common_confusion_warning="E is not shear modulus G or material strength, although all share stress units.",
    )
    YOUNGS_MODULUS = ELASTIC_MODULUS  # Descriptive alias; old callers remain valid.
    SHEAR_MODULUS = QuantitySpec(
        id="SHEAR_MODULUS",
        name="Shear Modulus (G)",
        symbols=("G",),
        dimension=DIM_STRESS,
        default_display_unit="GPa",
        base_unit="N/mm²",
        conceptual_meaning="Elastic shear stiffness, relating shear stress to shear strain: G = τ / γ.",
        common_confusion_warning="G is not Young's modulus E or shear stress, although all share stress units.",
    )
    FLEXURAL_RIGIDITY = QuantitySpec(
        id="FLEXURAL_RIGIDITY",
        name="Flexural Rigidity (EI)",
        symbols=("EI",),
        dimension=DIM_FLEXURAL_RIGIDITY,
        default_display_unit="kN·m²",
        base_unit="N·mm²",
        conceptual_meaning="Composite bending stiffness combining material stiffness (E) and cross-sectional geometry (I): EI (F·L²).",
        common_confusion_warning="1 kN·m² = 1,000 N × (1,000 mm)² = 10⁹ N·mm².",
    )
    MASS = QuantitySpec(
        id="MASS",
        name="Mass",
        symbols=("m",),
        dimension=DIM_MASS,
        default_display_unit="kg",
        base_unit="t",
        conceptual_meaning="Quantity of matter (kg or tonnes). Must be multiplied by gravity g to obtain gravitational weight force.",
        common_confusion_warning="Never plug mass in kg directly into equilibrium equations expecting N or kN without multiplying by g ≈ 9.81 m/s².",
    )


@dataclass(frozen=True)
class Quantity:
    """
    Immutable, strictly typed structural engineering quantity.
    Stores value in the user's chosen unit, validates compatibility against QuantityKind,
    and provides exact base-unit (mm, N, s) conversion and semantic guardrails.
    """

    value: float
    unit: str
    kind: QuantityKind

    def __post_init__(self) -> None:
        unit_def = get_unit(self.unit)
        expected_dim = self.kind.value.dimension
        if unit_def.dimension != expected_dim:
            raise DimensionalError(
                f"Unit '{self.unit}' has dimension {unit_def.dimension.format_exponents()}, "
                f"which is invalid for {self.kind.value.name} "
                f"(expected {expected_dim.format_exponents()})."
            )

    @property
    def base_value(self) -> float:
        """Value expressed in the internal base system (mm, N, s)."""
        return self.value * get_unit(self.unit).to_base_factor

    @property
    def base_unit(self) -> str:
        return self.kind.value.base_unit

    def to(self, target_unit: str) -> "Quantity":
        """Convert this quantity to another valid unit of the SAME QuantityKind."""
        new_val = convert_value(self.value, self.unit, target_unit)
        return Quantity(value=new_val, unit=target_unit, kind=self.kind)

    def _assert_same_kind(self, other: "Quantity", operation: str) -> None:
        if not isinstance(other, Quantity):
            raise TypeError(f"Cannot perform {operation} between Quantity and {type(other).__name__}.")
        if self.kind != other.kind:
            if self.kind.value.dimension == other.kind.value.dimension:
                raise SemanticQuantityMismatchError(
                    f"Conceptual Quantity Error during {operation}: "
                    f"Cannot combine '{self.kind.value.name}' ({self.unit}) with "
                    f"'{other.kind.value.name}' ({other.unit}). "
                    f"Even though both have dimensions of {self.kind.value.dimension.format_exponents()}, "
                    f"they represent physically different structural properties!\n"
                    f"- {self.kind.value.name}: {self.kind.value.conceptual_meaning}\n"
                    f"- {other.kind.value.name}: {other.kind.value.conceptual_meaning}"
                )
            raise DimensionalError(
                f"Dimensional Error during {operation}: Cannot combine "
                f"'{self.kind.value.name}' ({self.kind.value.dimension.format_exponents()}) "
                f"with '{other.kind.value.name}' ({other.kind.value.dimension.format_exponents()})."
            )

    def __add__(self, other: "Quantity") -> "Quantity":
        self._assert_same_kind(other, "addition (+)")
        other_in_self_unit = other.to(self.unit).value
        return Quantity(value=self.value + other_in_self_unit, unit=self.unit, kind=self.kind)

    def __sub__(self, other: "Quantity") -> "Quantity":
        self._assert_same_kind(other, "subtraction (-)")
        other_in_self_unit = other.to(self.unit).value
        return Quantity(value=self.value - other_in_self_unit, unit=self.unit, kind=self.kind)

    def scale(self, factor: float) -> "Quantity":
        """Multiply quantity by a dimensionless scalar."""
        return Quantity(value=self.value * float(factor), unit=self.unit, kind=self.kind)

    def format(self, precision: int = 4) -> str:
        return f"{self.value:.{precision}g} {self.unit}".strip()


# ==============================================================================
# Verified Domain Operations with Semantic & Dimensional Enforcement
# ==============================================================================


@dataclass(frozen=True)
class CalculationStepTrace:
    """Audit trail of a deterministic calculation with unit conversion steps."""

    result: Quantity
    formula_used: str
    steps: Tuple[str, ...]


def calculate_elastic_bending_stress(
    moment: Quantity,
    section_modulus: Quantity,
    output_unit: str = "MPa",
) -> CalculationStepTrace:
    """
    Compute extreme-fibre elastic bending stress: sigma = |M| / W_el (or signed M / W_el).
    Explicitly rejects First Moment of Area (Q) or Second Moment of Area (I).
    """
    if moment.kind != QuantityKind.MOMENT:
        raise SemanticQuantityMismatchError(
            f"Expected Bending Moment (MOMENT) for M, but received {moment.kind.value.name}."
        )
    if section_modulus.kind != QuantityKind.ELASTIC_SECTION_MODULUS:
        if section_modulus.kind == QuantityKind.FIRST_MOMENT_OF_AREA:
            raise SemanticQuantityMismatchError(
                "You supplied First Moment of Area (Q, mm³) instead of Elastic Section Modulus (W_el, mm³). "
                "Although both have units of L³ (mm³), Q is used for shear stress (τ = VQ / Ib), "
                "whereas elastic bending stress requires W_el = I / y_max."
            )
        if section_modulus.kind == QuantityKind.SECOND_MOMENT_OF_AREA:
            raise DimensionalError(
                "You supplied Second Moment of Area (I, mm⁴) directly into σ = M / W_el without dividing by y_max. "
                "Dividing Moment (N·mm) by I (mm⁴) produces N/mm³, not Stress (N/mm² = MPa). "
                "Use σ = M·y / I or divide I by y_max first to obtain W_el (mm³)."
            )
        raise SemanticQuantityMismatchError(
            f"Expected Elastic Section Modulus (ELASTIC_SECTION_MODULUS), "
            f"but received {section_modulus.kind.value.name}."
        )

    if section_modulus.base_value <= 0:
        raise ValueError("Elastic section modulus W_el must be strictly positive.")

    m_nmm = moment.to("N·mm").value
    w_mm3 = section_modulus.to("mm³").value
    sigma_n_mm2 = m_nmm / w_mm3

    raw_stress = Quantity(value=sigma_n_mm2, unit="N/mm²", kind=QuantityKind.STRESS)
    final_stress = raw_stress.to(output_unit)

    steps = (
        f"1. Convert Bending Moment M: {moment.format()} -> {m_nmm:,.4g} N·mm",
        f"2. Convert Elastic Section Modulus W_el: {section_modulus.format()} -> {w_mm3:,.4g} mm³",
        f"3. Apply σ = M / W_el = {m_nmm:,.4g} N·mm / {w_mm3:,.4g} mm³ = {sigma_n_mm2:,.4g} N/mm² (MPa)",
        f"4. Express in target unit ({output_unit}): {final_stress.format()}",
    )
    return CalculationStepTrace(result=final_stress, formula_used="σ = M / W_el", steps=steps)


def calculate_bending_stress_my_over_i(
    moment: Quantity,
    y_distance: Quantity,
    second_moment: Quantity,
    output_unit: str = "MPa",
) -> CalculationStepTrace:
    """
    Compute elastic bending stress from first principles: sigma = M * y / I.
    Rejects Polar Second Moment of Area (J) or Torsion Constant (I_t).
    """
    if moment.kind != QuantityKind.MOMENT:
        raise SemanticQuantityMismatchError(f"Expected MOMENT, got {moment.kind.value.name}.")
    if y_distance.kind != QuantityKind.LENGTH:
        raise SemanticQuantityMismatchError(f"Expected LENGTH for distance y, got {y_distance.kind.value.name}.")
    if second_moment.kind != QuantityKind.SECOND_MOMENT_OF_AREA:
        if second_moment.kind in (QuantityKind.POLAR_SECOND_MOMENT_OF_AREA, QuantityKind.TORSION_CONSTANT):
            raise SemanticQuantityMismatchError(
                f"You supplied {second_moment.kind.value.name} ({second_moment.unit}) instead of planar "
                f"Second Moment of Area (I). Even though both have units of L⁴ (mm⁴), "
                f"flexural bending requires planar I about the neutral bending axis."
            )
        raise SemanticQuantityMismatchError(
            f"Expected SECOND_MOMENT_OF_AREA, got {second_moment.kind.value.name}."
        )

    if second_moment.base_value <= 0:
        raise ValueError("Second moment of area I must be strictly positive.")

    m_nmm = moment.to("N·mm").value
    y_mm = y_distance.to("mm").value
    i_mm4 = second_moment.to("mm⁴").value
    sigma_n_mm2 = (m_nmm * y_mm) / i_mm4

    final_stress = Quantity(value=sigma_n_mm2, unit="N/mm²", kind=QuantityKind.STRESS).to(output_unit)
    steps = (
        f"1. Convert M: {moment.format()} -> {m_nmm:,.4g} N·mm",
        f"2. Convert fibre distance y: {y_distance.format()} -> {y_mm:,.4g} mm",
        f"3. Convert planar inertia I: {second_moment.format()} -> {i_mm4:,.4g} mm⁴",
        f"4. Apply σ = (M × y) / I = ({m_nmm:,.4g} × {y_mm:,.4g}) / {i_mm4:,.4g} = {sigma_n_mm2:,.4g} N/mm²",
    )
    return CalculationStepTrace(result=final_stress, formula_used="σ = (M · y) / I", steps=steps)


def diagnose_unit_scale_error(
    learner_numeric_value: float,
    expected_quantity: Quantity,
    rel_tol: float = 0.02,
    *,
    learner_unit: Optional[str] = None,
) -> Optional[str]:
    """
    Diagnose likely power-of-ten scale errors after converting supplied units.

    If learner_unit is omitted, the numeric answer is assumed to be in the
    expected quantity's unit, preserving the original API. Unknown or
    dimensionally incompatible units raise their normal unit errors. This is
    a scale diagnostic, not a complete correctness or sign check: None does
    not prove the answer is correct.
    """
    if not math.isfinite(learner_numeric_value) or not math.isfinite(expected_quantity.value):
        raise ValueError("Learner and expected values must be finite.")
    if not math.isfinite(rel_tol) or not 0 <= rel_tol < 1:
        raise ValueError("rel_tol must be finite and in the range 0 <= rel_tol < 1.")
    if learner_unit is not None:
        learner_numeric_value = convert_value(learner_numeric_value, learner_unit, expected_quantity.unit)
    expected_val = expected_quantity.value
    if expected_val == 0 or learner_numeric_value == 0:
        return None

    ratio = abs(learner_numeric_value / expected_val)
    if not math.isfinite(ratio) or ratio == 0:
        return None
    if math.isclose(ratio, 1.0, rel_tol=rel_tol):
        return None  # Answer is numerically accurate!

    log10_ratio = math.log10(ratio)
    nearest_power = round(log10_ratio)
    if not math.isclose(ratio, 10.0**nearest_power, rel_tol=rel_tol):
        return None

    # Power-of-10 scale error detected
    kind = expected_quantity.kind
    if abs(nearest_power) == 6 and kind == QuantityKind.STRESS:
        return (
            "Order-of-magnitude error (factor of 10⁶): Did you divide Moment in kN·m directly by Section Modulus "
            "in mm³ without multiplying the moment by 10⁶ to convert kN·m -> N·mm?"
        )
    if abs(nearest_power) == 3 and kind == QuantityKind.STRESS:
        return (
            "Order-of-magnitude error (factor of 10³): Check whether you converted kN -> N (×10³) OR m -> mm (×10³), "
            "but forgot the second factor of 10³ in 1 kN·m = 10⁶ N·mm."
        )
    if abs(nearest_power) in (4, 8, 12) and kind == QuantityKind.SECOND_MOMENT_OF_AREA:
        return (
            f"Unit power error (factor of 10^{abs(nearest_power)}): Second moment of area has dimensions of L⁴. "
            f"Remember that 1 cm⁴ = 10⁴ mm⁴ and 1 m⁴ = (10³)⁴ = 10¹² mm⁴."
        )
    if abs(nearest_power) in (3, 6, 9) and kind in (
        QuantityKind.FIRST_MOMENT_OF_AREA,
        QuantityKind.ELASTIC_SECTION_MODULUS,
        QuantityKind.PLASTIC_SECTION_MODULUS,
    ):
        return (
            f"Unit power error (factor of 10^{abs(nearest_power)}): This property has dimensions of L³. "
            f"Remember that 1 cm³ = 10³ mm³ and 1 m³ = (10³)³ = 10⁹ mm³."
        )
    return (
        f"Your numerical digits match the correct calculation, but your answer is off by a factor of "
        f"10^{nearest_power}. Check your unit conversions (kN vs N, m vs mm, and unit exponents)."
    )