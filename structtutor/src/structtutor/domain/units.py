"""
Strictly typed physical dimensions and UK structural engineering unit definitions.

Internal Base System (Engineering Force-Length-Time):
- Length (L): millimetre (mm) -> base factor = 1.0
- Force  (F): Newton (N)      -> base factor = 1.0
- Time   (T): second (s)      -> base factor = 1.0

Why (mm, N, s) internally?
In structural engineering, 1 N/mm^2 = 1 MPa identically (scale factor = 1.0),
and section properties are natively tabulated in mm, mm^2, mm^3, mm^4, or cm^n.
Using (mm, N) eliminates floating-point rounding in stress = M / W_el and sigma = F / A.
"""

from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Dict


class DimensionalError(ValueError):
    """Raised when physical dimensions (L, F, T) are incompatible."""


class UnitParseError(ValueError):
    """Raised when a unit symbol is unknown or invalid."""


@dataclass(frozen=True)
class Dimension:
    """Physical dimension represented by exponents of Length (L), Force (F), and Time (T)."""

    L: int = 0
    F: int = 0
    T: int = 0

    def __mul__(self, other: "Dimension") -> "Dimension":
        return Dimension(L=self.L + other.L, F=self.F + other.F, T=self.T + other.T)

    def __truediv__(self, other: "Dimension") -> "Dimension":
        return Dimension(L=self.L - other.L, F=self.F - other.F, T=self.T - other.T)

    def __pow__(self, power: int) -> "Dimension":
        return Dimension(L=self.L * power, F=self.F * power, T=self.T * power)

    def format_exponents(self) -> str:
        parts = []
        if self.F != 0:
            parts.append(f"F^{self.F}" if self.F != 1 else "F")
        if self.L != 0:
            parts.append(f"L^{self.L}" if self.L != 1 else "L")
        if self.T != 0:
            parts.append(f"T^{self.T}" if self.T != 1 else "T")
        return "·".join(parts) if parts else "1 (dimensionless)"


# Canonical Dimensions
DIM_DIMENSIONLESS = Dimension(0, 0, 0)
DIM_LENGTH = Dimension(L=1, F=0, T=0)
DIM_AREA = Dimension(L=2, F=0, T=0)
DIM_VOLUME_OR_MODULUS = Dimension(L=3, F=0, T=0)
DIM_INERTIA_L4 = Dimension(L=4, F=0, T=0)
DIM_WARPING_L6 = Dimension(L=6, F=0, T=0)
DIM_FORCE = Dimension(L=0, F=1, T=0)
DIM_MOMENT = Dimension(L=1, F=1, T=0)
DIM_DISTRIBUTED_LOAD = Dimension(L=-1, F=1, T=0)
DIM_STRESS = Dimension(L=-2, F=1, T=0)
DIM_UNIT_WEIGHT = Dimension(L=-3, F=1, T=0)
DIM_FLEXURAL_RIGIDITY = Dimension(L=2, F=1, T=0)
DIM_ROTATIONAL_STIFFNESS = Dimension(L=1, F=1, T=0)
DIM_MASS = Dimension(L=-1, F=1, T=2)  # F = m * a => m = F / (L / T^2) = F * L^-1 * T^2
DIM_DENSITY = Dimension(L=-4, F=1, T=2)  # Mass / Volume = M * L^-3 = F * L^-4 * T^2


@dataclass(frozen=True)
class UnitDef:
    """Definition of a specific unit relative to the internal (mm, N, s) base system."""

    symbol: str
    name: str
    dimension: Dimension
    to_base_factor: float  # Multiply value in this unit by `to_base_factor` to get base (mm, N, s)


# Complete registry of supported UK structural engineering units
UNIT_REGISTRY: Dict[str, UnitDef] = {
    # Dimensionless & Plane Angle (Base: rad)
    "": UnitDef("", "dimensionless", DIM_DIMENSIONLESS, 1.0),
    "-": UnitDef("-", "dimensionless", DIM_DIMENSIONLESS, 1.0),
    "rad": UnitDef("rad", "radian", DIM_DIMENSIONLESS, 1.0),
    "deg": UnitDef("deg", "degree", DIM_DIMENSIONLESS, math.pi / 180.0),
    "°": UnitDef("°", "degree", DIM_DIMENSIONLESS, math.pi / 180.0),
    # Length (Base: mm)
    "mm": UnitDef("mm", "millimetre", DIM_LENGTH, 1.0),
    "cm": UnitDef("cm", "centimetre", DIM_LENGTH, 10.0),
    "m": UnitDef("m", "metre", DIM_LENGTH, 1_000.0),
    # Area (Base: mm^2)
    "mm2": UnitDef("mm2", "square millimetre", DIM_AREA, 1.0),
    "mm²": UnitDef("mm²", "square millimetre", DIM_AREA, 1.0),
    "cm2": UnitDef("cm2", "square centimetre", DIM_AREA, 100.0),
    "cm²": UnitDef("cm²", "square centimetre", DIM_AREA, 100.0),
    "m2": UnitDef("m2", "square metre", DIM_AREA, 1_000_000.0),
    "m²": UnitDef("m²", "square metre", DIM_AREA, 1_000_000.0),
    # Length^3: First Moment of Area & Section Modulus (Base: mm^3)
    "mm3": UnitDef("mm3", "cubic millimetre", DIM_VOLUME_OR_MODULUS, 1.0),
    "mm³": UnitDef("mm³", "cubic millimetre", DIM_VOLUME_OR_MODULUS, 1.0),
    "cm3": UnitDef("cm3", "cubic centimetre", DIM_VOLUME_OR_MODULUS, 1_000.0),
    "cm³": UnitDef("cm³", "cubic centimetre", DIM_VOLUME_OR_MODULUS, 1_000.0),
    "m3": UnitDef("m3", "cubic metre", DIM_VOLUME_OR_MODULUS, 1_000_000_000.0),
    "m³": UnitDef("m³", "cubic metre", DIM_VOLUME_OR_MODULUS, 1_000_000_000.0),
    # Length^4: Second Moment of Area & Polar/Torsion Constant (Base: mm^4)
    "mm4": UnitDef("mm4", "millimetre to the fourth", DIM_INERTIA_L4, 1.0),
    "mm⁴": UnitDef("mm⁴", "millimetre to the fourth", DIM_INERTIA_L4, 1.0),
    "cm4": UnitDef("cm4", "centimetre to the fourth", DIM_INERTIA_L4, 10_000.0),
    "cm⁴": UnitDef("cm⁴", "centimetre to the fourth", DIM_INERTIA_L4, 10_000.0),
    "m4": UnitDef("m4", "metre to the fourth", DIM_INERTIA_L4, 1_000_000_000_000.0),
    "m⁴": UnitDef("m⁴", "metre to the fourth", DIM_INERTIA_L4, 1_000_000_000_000.0),
    # Length^6: Warping Constant (Base: mm^6)
    "mm6": UnitDef("mm6", "millimetre to the sixth", DIM_WARPING_L6, 1.0),
    "mm⁶": UnitDef("mm⁶", "millimetre to the sixth", DIM_WARPING_L6, 1.0),
    "cm6": UnitDef("cm6", "centimetre to the sixth", DIM_WARPING_L6, 1_000_000.0),
    "cm⁶": UnitDef("cm⁶", "centimetre to the sixth", DIM_WARPING_L6, 1_000_000.0),
    "dm6": UnitDef("dm6", "decimetre to the sixth", DIM_WARPING_L6, 1_000_000_000_000.0),
    # Force (Base: N)
    "N": UnitDef("N", "Newton", DIM_FORCE, 1.0),
    "kN": UnitDef("kN", "kilonewton", DIM_FORCE, 1_000.0),
    "MN": UnitDef("MN", "meganewton", DIM_FORCE, 1_000_000.0),
    # Moment (Base: N·mm)
    "N·mm": UnitDef("N·mm", "Newton-millimetre", DIM_MOMENT, 1.0),
    "Nmm": UnitDef("Nmm", "Newton-millimetre", DIM_MOMENT, 1.0),
    "N·m": UnitDef("N·m", "Newton-metre", DIM_MOMENT, 1_000.0),
    "Nm": UnitDef("Nm", "Newton-metre", DIM_MOMENT, 1_000.0),
    "kN·mm": UnitDef("kN·mm", "kilonewton-millimetre", DIM_MOMENT, 1_000.0),
    "kN·m": UnitDef("kN·m", "kilonewton-metre", DIM_MOMENT, 1_000_000.0),
    "kNm": UnitDef("kNm", "kilonewton-metre", DIM_MOMENT, 1_000_000.0),
    "MN·m": UnitDef("MN·m", "meganewton-metre", DIM_MOMENT, 1_000_000_000.0),
    # Distributed Line Load (Base: N/mm)
    "N/mm": UnitDef("N/mm", "Newton per millimetre", DIM_DISTRIBUTED_LOAD, 1.0),
    "kN/m": UnitDef("kN/m", "kilonewton per metre", DIM_DISTRIBUTED_LOAD, 1.0),  # 1000 N / 1000 mm = 1.0 N/mm
    "N/m": UnitDef("N/m", "Newton per metre", DIM_DISTRIBUTED_LOAD, 0.001),
    # Stress / Pressure / Elastic Modulus (Base: N/mm^2 = MPa)
    "N/mm2": UnitDef("N/mm2", "Newton per square millimetre", DIM_STRESS, 1.0),
    "N/mm²": UnitDef("N/mm²", "Newton per square millimetre", DIM_STRESS, 1.0),
    "MPa": UnitDef("MPa", "megapascal", DIM_STRESS, 1.0),
    "GPa": UnitDef("GPa", "gigapascal", DIM_STRESS, 1_000.0),
    "kN/mm2": UnitDef("kN/mm2", "kilonewton per square millimetre", DIM_STRESS, 1_000.0),
    "kN/mm²": UnitDef("kN/mm²", "kilonewton per square millimetre", DIM_STRESS, 1_000.0),
    "kPa": UnitDef("kPa", "kilopascal", DIM_STRESS, 0.001),
    "kN/m2": UnitDef("kN/m2", "kilonewton per square metre", DIM_STRESS, 0.001),
    "kN/m²": UnitDef("kN/m²", "kilonewton per square metre", DIM_STRESS, 0.001),
    "Pa": UnitDef("Pa", "pascal", DIM_STRESS, 1e-6),
    "N/m2": UnitDef("N/m2", "Newton per square metre", DIM_STRESS, 1e-6),
    # Unit Weight (Force per Volume, Base: N/mm^3; 1 kN/m^3 = 1000 N / 10^9 mm^3 = 1e-6 N/mm^3)
    "N/mm3": UnitDef("N/mm3", "Newton per cubic millimetre", DIM_UNIT_WEIGHT, 1.0),
    "N/mm³": UnitDef("N/mm³", "Newton per cubic millimetre", DIM_UNIT_WEIGHT, 1.0),
    "kN/m3": UnitDef("kN/m3", "kilonewton per cubic metre", DIM_UNIT_WEIGHT, 1e-6),
    "kN/m³": UnitDef("kN/m³", "kilonewton per cubic metre", DIM_UNIT_WEIGHT, 1e-6),
    # Flexural Rigidity EI (Base: N·mm^2)
    "N·mm2": UnitDef("N·mm2", "Newton-millimetre squared", DIM_FLEXURAL_RIGIDITY, 1.0),
    "N·mm²": UnitDef("N·mm²", "Newton-millimetre squared", DIM_FLEXURAL_RIGIDITY, 1.0),
    "kN·m2": UnitDef("kN·m2", "kilonewton-metre squared", DIM_FLEXURAL_RIGIDITY, 1_000_000_000.0),
    "kN·m²": UnitDef("kN·m²", "kilonewton-metre squared", DIM_FLEXURAL_RIGIDITY, 1_000_000_000.0),
    # Mass (explicitly distinct from Force!)
    "kg": UnitDef("kg", "kilogram (mass, not force)", DIM_MASS, 0.001),  # 1 kg = 1 N / (1 m/s^2) = 1 N / (1000 mm/s^2)
    "t": UnitDef("t", "metric tonne (mass, not force)", DIM_MASS, 1.0),
    # Mass Density (explicitly distinct from Unit Weight!)
    "kg/m3": UnitDef("kg/m3", "kilogram per cubic metre (mass density)", DIM_DENSITY, 1e-12),
    "kg/m³": UnitDef("kg/m³", "kilogram per cubic metre (mass density)", DIM_DENSITY, 1e-12),
    "t/m3": UnitDef("t/m3", "metric tonne per cubic metre (mass density)", DIM_DENSITY, 1e-9),
    "t/m³": UnitDef("t/m³", "metric tonne per cubic metre (mass density)", DIM_DENSITY, 1e-9),
}


def get_unit(symbol: str) -> UnitDef:
    """Look up a unit definition by symbol."""
    cleaned = symbol.strip()
    if cleaned not in UNIT_REGISTRY:
        raise UnitParseError(
            f"Unknown unit '{symbol}'. Supported units include: "
            f"mm, cm, m, mm², cm², m², mm³, cm³, m³, mm⁴, cm⁴, m⁴, "
            f"N, kN, MN, N·mm, N·m, kN·m, N/mm, kN/m, Pa, kPa, MPa, GPa, N/mm², kN/m³, deg, rad."
        )
    return UNIT_REGISTRY[cleaned]


def convert_value(value: float, from_unit: str, to_unit: str) -> float:
    """
    Convert a numeric value between two compatible units.
    Raises DimensionalError if the physical dimensions do not match.
    """
    u_from = get_unit(from_unit)
    u_to = get_unit(to_unit)

    if u_from.dimension != u_to.dimension:
        if (u_from.dimension == DIM_MASS and u_to.dimension == DIM_FORCE) or (
            u_from.dimension == DIM_FORCE and u_to.dimension == DIM_MASS
        ):
            raise DimensionalError(
                f"Cannot directly convert '{from_unit}' (Mass) to '{to_unit}' (Force). "
                f"Mass must be multiplied by gravitational acceleration g (typically 9.81 m/s²) "
                f"to obtain weight as a force."
            )
        if (u_from.dimension == DIM_DENSITY and u_to.dimension == DIM_UNIT_WEIGHT) or (
            u_from.dimension == DIM_UNIT_WEIGHT and u_to.dimension == DIM_DENSITY
        ):
            raise DimensionalError(
                f"Cannot directly convert '{from_unit}' (Mass Density) to '{to_unit}' (Unit Weight). "
                f"Mass density must be multiplied by gravitational acceleration g (typically 9.81 m/s²) "
                f"to obtain unit weight (force per unit volume)."
            )
        raise DimensionalError(
            f"Dimensional mismatch: cannot convert '{from_unit}' ({u_from.dimension.format_exponents()}) "
            f"to '{to_unit}' ({u_to.dimension.format_exponents()})."
        )

    base_val = value * u_from.to_base_factor
    return base_val / u_to.to_base_factor