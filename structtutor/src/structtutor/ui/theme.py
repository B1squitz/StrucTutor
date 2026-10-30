"""Shared visual design system, tokens, and Qt stylesheet for StructTutor (Milestone A)."""

from __future__ import annotations

from typing import Dict

from structtutor.config import MasteryState


# ---------------------------------------------------------------------------
# 1. Color Palette Tokens (60-30-10 Dark Engineering Slate System)
# ---------------------------------------------------------------------------
COLORS: Dict[str, str] = {
    # 60% Canvas & Deep Surfaces
    "canvas": "#0b1120",
    "surface": "#0f172a",
    "surface_card": "#1e293b",
    "surface_elevated": "#263449",
    "sidebar": "#070b14",
    # 30% Structural Hairlines & Typography Hierarchy
    "border_subtle": "#1e293b",
    "border_default": "#334155",
    "border_strong": "#475569",
    "border_focus": "#38bdf8",
    "text_primary": "#f8fafc",
    "text_secondary": "#cbd5e1",
    "text_muted": "#94a3b8",
    "text_dim": "#64748b",
    # 10% High-Intent Semantic & Interactive Accents
    "primary": "#0284c7",
    "primary_hover": "#0369a1",
    "primary_pressed": "#075985",
    "accent_sky": "#38bdf8",
    "accent_amber": "#f59e0b",
    "success": "#10b981",
    "success_bg": "#064e3b",
    "warning": "#f59e0b",
    "warning_bg": "#451a03",
    "danger": "#f43f5e",
    "danger_bg": "#4c0519",
}


# ---------------------------------------------------------------------------
# 2. Typography & Spatial Tokens
# ---------------------------------------------------------------------------
TYPOGRAPHY: Dict[str, str] = {
    "font_sans": '"Segoe UI", "Plus Jakarta Sans", -apple-system, sans-serif',
    "font_mono": '"Cascadia Mono", "Consolas", "IBM Plex Mono", monospace',
    "size_hero": "22px",
    "size_page_title": "20px",
    "size_section": "15px",
    "size_card_title": "14px",
    "size_body": "13px",
    "size_caption": "12px",
    "size_micro": "11px",
}

SPACING: Dict[str, int] = {
    "page_margin_x": 28,
    "page_margin_y": 24,
    "section_gap": 20,
    "card_padding": 16,
    "grid_gap": 14,
    "inline_gap": 10,
}


# ---------------------------------------------------------------------------
# 3. Navigation Glyphs & Non-Hue-Only Mastery State Specifications
# ---------------------------------------------------------------------------
NAV_ICONS: Dict[str, str] = {
    "home": "⌂",
    "map": "◈",
    "practice": "✎",
    "units": "⚖",
    "roadmap": "☰",
}

MASTERY_BADGE_SPECS: Dict[str, Dict[str, str]] = {
    MasteryState.NOT_ASSESSED.value: {
        "label": "Not assessed",
        "glyph": "○",
        "fg": "#cbd5e1",
        "bg": "#1e293b",
        "border": "#475569",
    },
    MasteryState.EMERGING.value: {
        "label": "Emerging",
        "glyph": "◔",
        "fg": "#fcd34d",
        "bg": "#451a03",
        "border": "#b45309",
    },
    MasteryState.DEVELOPING.value: {
        "label": "Developing",
        "glyph": "◑",
        "fg": "#7dd3fc",
        "bg": "#0c4a6e",
        "border": "#0284c7",
    },
    MasteryState.PROVISIONAL.value: {
        "label": "Provisional",
        "glyph": "◕",
        "fg": "#c4b5fd",
        "bg": "#2e1065",
        "border": "#7c3aed",
    },
    MasteryState.SECURE.value: {
        "label": "Secure",
        "glyph": "●",
        "fg": "#6ee7b7",
        "bg": "#064e3b",
        "border": "#059669",
    },
}

DOMAIN_ACCENT_COLORS: Dict[str, str] = {
    "A": "#38bdf8",  # Mathematical Fluency & Units
    "B": "#f59e0b",  # Core Statics & Load Paths
    "C": "#10b981",  # Beam Behaviour, SFDs & BMDs
    "D": "#a78bfa",  # Trusses, Frames & Brackets
    "E": "#f472b6",  # Section Properties
    "F": "#fb7185",  # Internal Forces, Stress & Deflection
    "G": "#60a5fa",  # Eurocode Design Practice
    "H": "#34d399",  # Temporary Works & BS 5975
}


def get_mastery_badge_spec(state: str | MasteryState) -> Dict[str, str]:
    """Return accessible badge specification (glyph, fg, bg, border) for a mastery state."""
    key = state.value if isinstance(state, MasteryState) else str(state)
    return MASTERY_BADGE_SPECS.get(
        key,
        MASTERY_BADGE_SPECS[MasteryState.NOT_ASSESSED.value],
    )


def format_mastery_badge_text(state: str | MasteryState) -> str:
    """Format mastery state with its non-color-only geometric glyph."""
    spec = get_mastery_badge_spec(state)
    return f"{spec['glyph']} {spec['label']}"


def format_mastery_badge_qss(state: str | MasteryState) -> str:
    """Return inline QSS for a mastery state pill label."""
    spec = get_mastery_badge_spec(state)
    return (
        f"background-color: {spec['bg']}; "
        f"color: {spec['fg']}; "
        f"border: 1px solid {spec['border']}; "
        "border-radius: 5px; "
        "padding: 3px 9px; "
        "font-size: 11px; "
        "font-weight: 700;"
    )


def get_domain_accent(domain_code: str) -> str:
    """Return the accent colour hex string for a curriculum domain (A–H)."""
    return DOMAIN_ACCENT_COLORS.get(domain_code.strip().upper(), COLORS["accent_sky"])


# ---------------------------------------------------------------------------
# 4. Complete Application Stylesheet (QSS)
# ---------------------------------------------------------------------------
DARK_STYLESHEET = f"""
QMainWindow, QWidget {{
    background-color: {COLORS["surface"]};
    color: {COLORS["text_primary"]};
    font-family: {TYPOGRAPHY["font_sans"]};
    font-size: {TYPOGRAPHY["size_body"]};
}}

QScrollArea {{
    border: none;
    background-color: transparent;
}}

QFrame#TopConventionBanner {{
    background-color: {COLORS["canvas"]};
    border-bottom: 1px solid {COLORS["border_default"]};
    padding: 6px 14px;
}}

QFrame#Sidebar {{
    background-color: {COLORS["sidebar"]};
    border-right: 1px solid {COLORS["border_subtle"]};
}}

QPushButton#NavButton {{
    text-align: left;
    padding: 10px 14px;
    border: 1px solid transparent;
    border-radius: 7px;
    background-color: transparent;
    color: {COLORS["text_muted"]};
    font-size: 13px;
    font-weight: 600;
}}

QPushButton#NavButton:hover {{
    background-color: {COLORS["surface_card"]};
    color: {COLORS["text_primary"]};
    border: 1px solid {COLORS["border_default"]};
}}

QPushButton#NavButton[active="true"] {{
    background-color: {COLORS["primary"]};
    color: #ffffff;
    border: 1px solid {COLORS["accent_sky"]};
}}

QFrame#HeroCard {{
    background-color: {COLORS["canvas"]};
    border: 1px solid {COLORS["primary"]};
    border-radius: 10px;
    padding: 18px;
}}

QFrame#Card {{
    background-color: {COLORS["surface_card"]};
    border: 1px solid {COLORS["border_default"]};
    border-radius: 9px;
    padding: 14px;
}}

QFrame#MetricCard {{
    background-color: {COLORS["surface_card"]};
    border: 1px solid {COLORS["border_default"]};
    border-radius: 8px;
    padding: 12px;
}}

QFrame#TopicCard {{
    background-color: {COLORS["surface_card"]};
    border: 1px solid {COLORS["border_default"]};
    border-radius: 8px;
    padding: 14px;
}}

QFrame#TopicCard:hover {{
    border: 1px solid {COLORS["border_focus"]};
}}

QFrame#ActivityRow {{
    background-color: {COLORS["canvas"]};
    border: 1px solid {COLORS["border_subtle"]};
    border-radius: 7px;
    padding: 10px 12px;
}}

QLabel#HeroTitle {{
    font-size: {TYPOGRAPHY["size_hero"]};
    font-weight: 800;
    color: {COLORS["text_primary"]};
}}

QLabel#PageTitle {{
    font-size: {TYPOGRAPHY["size_page_title"]};
    font-weight: 800;
    color: {COLORS["text_primary"]};
}}

QLabel#PageSubtitle {{
    font-size: {TYPOGRAPHY["size_body"]};
    color: {COLORS["text_muted"]};
}}

QLabel#SectionHeader {{
    font-size: {TYPOGRAPHY["size_section"]};
    font-weight: 700;
    color: {COLORS["accent_sky"]};
}}

QLabel#CardTitle {{
    font-size: {TYPOGRAPHY["size_card_title"]};
    font-weight: 700;
    color: {COLORS["text_primary"]};
}}

QLabel#MutedText {{
    font-size: {TYPOGRAPHY["size_caption"]};
    color: {COLORS["text_muted"]};
}}

QLabel#MonoMeta {{
    font-family: {TYPOGRAPHY["font_mono"]};
    font-size: {TYPOGRAPHY["size_micro"]};
    color: {COLORS["text_muted"]};
}}

QLabel#Badge {{
    background-color: {COLORS["primary_hover"]};
    color: #e0f2fe;
    padding: 3px 9px;
    border-radius: 4px;
    font-size: {TYPOGRAPHY["size_micro"]};
    font-weight: 600;
}}

QLineEdit, QComboBox, QDoubleSpinBox, QTextEdit {{
    background-color: {COLORS["canvas"]};
    border: 1px solid {COLORS["border_strong"]};
    border-radius: 6px;
    padding: 6px 9px;
    color: {COLORS["text_primary"]};
}}

QLineEdit:focus, QComboBox:focus, QDoubleSpinBox:focus, QTextEdit:focus {{
    border: 1px solid {COLORS["border_focus"]};
}}

QPushButton {{
    background-color: {COLORS["surface_elevated"]};
    color: {COLORS["text_primary"]};
    border: 1px solid {COLORS["border_strong"]};
    border-radius: 6px;
    padding: 7px 13px;
    font-weight: 600;
}}

QPushButton:hover {{
    background-color: {COLORS["border_default"]};
    border: 1px solid {COLORS["text_muted"]};
}}

QPushButton:disabled {{
    background-color: {COLORS["surface"]};
    color: {COLORS["text_dim"]};
    border: 1px solid {COLORS["border_subtle"]};
}}

QPushButton#PrimaryButton {{
    background-color: {COLORS["primary"]};
    color: #ffffff;
    border: 1px solid {COLORS["accent_sky"]};
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 700;
}}

QPushButton#PrimaryButton:hover {{
    background-color: {COLORS["primary_hover"]};
}}

QPushButton#PrimaryButton:disabled {{
    background-color: {COLORS["surface_card"]};
    color: {COLORS["text_dim"]};
    border: 1px solid {COLORS["border_default"]};
}}

QPushButton#SecondaryButton {{
    background-color: {COLORS["canvas"]};
    color: {COLORS["text_secondary"]};
    border: 1px solid {COLORS["border_strong"]};
    border-radius: 6px;
    padding: 7px 14px;
    font-weight: 600;
}}

QPushButton#SecondaryButton:hover {{
    background-color: {COLORS["surface_elevated"]};
    color: {COLORS["text_primary"]};
    border: 1px solid {COLORS["accent_sky"]};
}}

QProgressBar#CurriculumProgress {{
    background-color: {COLORS["canvas"]};
    border: 1px solid {COLORS["border_default"]};
    border-radius: 6px;
    text-align: center;
    color: {COLORS["text_primary"]};
    font-weight: 700;
    min-height: 18px;
    max-height: 18px;
}}

QProgressBar#CurriculumProgress::chunk {{
    background-color: {COLORS["primary"]};
    border-radius: 5px;
}}

QTableWidget {{
    background-color: {COLORS["canvas"]};
    alternate-background-color: {COLORS["surface_card"]};
    gridline-color: {COLORS["border_default"]};
    border: 1px solid {COLORS["border_default"]};
    border-radius: 7px;
    color: {COLORS["text_primary"]};
}}

QHeaderView::section {{
    background-color: {COLORS["surface_card"]};
    color: {COLORS["accent_sky"]};
    padding: 7px 8px;
    border: 1px solid {COLORS["border_default"]};
    font-weight: 700;
}}
"""