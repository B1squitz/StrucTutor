"""Automated unit tests for dimensional conversions and semantic quantity distinctions."""

from __future__ import annotations

import math
import pytest

from structtutor.domain.quantities import (
    Quantity,
    QuantityKind,
    SemanticQuantityMismatchError,
    calculate_bending_stress_my_over_i,
    calculate_elastic_bending_stress,
    diagnose_unit_scale_error,
)
from structtutor.domain.units import DimensionalError, convert_value


def test_mandatory_uk_structural_unit_conversions() -> None:
    """Verify all mandatory reference conversions from specification §7.1."""
    assert math.isclose(convert_value(1.0, "kN", "N"), 1_000.0)
    assert math.isclose(convert_value(1.0, "MN", "kN"), 1_000.0)
    assert math.isclose(convert_value(1.0, "kN·m", "N·mm"), 1_000_000.0)
    assert math.isclose(convert_value(1.0, "MPa", "N/mm²"), 1.0)
    assert math.isclose(convert_value(1.0, "GPa", "N/mm²"), 1_000.0)
    assert math.isclose(convert_value(1.0, "kN/m", "N/mm"), 1.0)
    assert math.isclose(convert_value(1.0, "m²", "mm²"), 1_000_000.0)
    assert math.isclose(convert_value(1.0, "m³", "mm³"), 1_000_000_000.0)
    assert math.isclose(convert_value(1.0, "m⁴", "mm⁴"), 1_000_000_000_000.0)
    assert math.isclose(convert_value(1.0, "cm⁴", "mm⁴"), 10_000.0)


def test_mass_vs_force_rejected() -> None:
    """Ensure mass (kg) cannot be silently converted to force (N or kN)."""
    with pytest.raises(DimensionalError, match="Mass"):
        convert_value(100.0, "kg", "kN")


def test_dimension_mismatch_rejected() -> None:
    """Prevent adding forces to moments or converting L^3 to L^4."""
    with pytest.raises(DimensionalError):
        convert_value(500.0, "mm³", "mm⁴")

    f = Quantity(10.0, "kN", QuantityKind.FORCE)
    m = Quantity(10.0, "kN·m", QuantityKind.MOMENT)
    with pytest.raises(DimensionalError):
        _ = f + m


def test_first_moment_of_area_and_section_modulus_are_semantically_distinct() -> None:
    """
    Critical requirement: First Moment of Area (Q, L^3) and Elastic Section Modulus (W_el, L^3)
    share dimension L^3 (mm^3) but MUST NOT be treated as the same physical quantity.
    """
    q_statical = Quantity(150_000.0, "mm³", QuantityKind.FIRST_MOMENT_OF_AREA)
    w_el = Quantity(200_000.0, "mm³", QuantityKind.ELASTIC_SECTION_MODULUS)
    w_pl = Quantity(300_000.0, "mm³", QuantityKind.PLASTIC_SECTION_MODULUS)

    # Cannot add Q to W_el or W_el to W_pl
    with pytest.raises(SemanticQuantityMismatchError, match="Conceptual Quantity Error"):
        _ = q_statical + w_el

    with pytest.raises(SemanticQuantityMismatchError, match="Conceptual Quantity Error"):
        _ = w_el + w_pl

    # Passing Q into elastic bending stress formula σ = M / W_el must be caught with a clear message
    moment = Quantity(20.0, "kN·m", QuantityKind.MOMENT)
    with pytest.raises(SemanticQuantityMismatchError, match="First Moment of Area"):
        calculate_elastic_bending_stress(moment, q_statical)


def test_planar_second_moment_and_polar_second_moment_are_semantically_distinct() -> None:
    """
    Planar Second Moment of Area (I, L^4) and Polar Second Moment of Area (J, L^4)
    share dimension L^4 (mm^4) but must remain distinct.
    """
    i_xx = Quantity(66_666_667.0, "mm⁴", QuantityKind.SECOND_MOMENT_OF_AREA)
    j_polar = Quantity(80_000_000.0, "mm⁴", QuantityKind.POLAR_SECOND_MOMENT_OF_AREA)

    with pytest.raises(SemanticQuantityMismatchError):
        _ = i_xx + j_polar

    moment = Quantity(18.0, "kN·m", QuantityKind.MOMENT)
    y_dist = Quantity(100.0, "mm", QuantityKind.LENGTH)
    with pytest.raises(SemanticQuantityMismatchError, match="Polar Second Moment"):
        calculate_bending_stress_my_over_i(moment, y_dist, j_polar)


def test_verified_bending_stress_calculation_and_unit_diagnosis() -> None:
    """
    Verify σ = M / W_el for M = 18 kN·m and W_el = 666,666.67 mm³ (100x200 rectangle).
    Expected stress: 18e6 N·mm / 666,666.67 mm³ = 27.0 MPa.
    """
    moment = Quantity(18.0, "kN·m", QuantityKind.MOMENT)
    w_el = Quantity(200.0**2 * 100.0 / 6.0, "mm³", QuantityKind.ELASTIC_SECTION_MODULUS)

    trace = calculate_elastic_bending_stress(moment, w_el, output_unit="MPa")
    assert math.isclose(trace.result.value, 27.0, rel_tol=1e-6)
    assert trace.result.unit == "MPa"

    # If learner forgets 1 kN·m = 10^6 N·mm and enters 2.7e-5 MPa, diagnose the 10^6 error
    diag = diagnose_unit_scale_error(2.7e-5, trace.result)
    assert diag is not None
    assert "10⁶" in diag