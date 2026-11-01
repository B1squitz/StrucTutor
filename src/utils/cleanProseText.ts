/**
 * Cleans prose text segments for display.
 * Applies formatting replacements to text segments only, never inside maths:
 *   - m/s2 → m/s², mm2 → mm², N/mm2 → N/mm², kN/m2 → kN/m², deg / degrees → °, -> → →, <= → ≤, >= → ≥, +/- → ±
 *   - **bold** → bold, `code` → code
 *   - leading ### / ## / # removed (keep heading text)
 *   - a line that is exactly --- or *** → blank line
 *   - collapse 3+ blank lines to one
 */
export function cleanProseText(text: string): string {
  if (!text) return '';

  // Process line-by-line first for headings and horizontal rules
  const lines = text.split(/\r?\n/).map((line) => {
    const trimmed = line.trim();
    if (trimmed === '---' || trimmed === '***') {
      return '';
    }
    // Remove leading ###, ##, # while preserving heading text
    return line.replace(/^#{1,6}\s+/, '');
  });

  let processed = lines.join('\n');

  // Collapse 3+ blank lines (i.e. 4+ consecutive newlines or lines with only spaces) to one blank line (\n\n)
  processed = processed.replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, '\n\n');

  // Bold and code markup removal (keeping content)
  processed = processed.replace(/\*\*(.*?)\*\*/g, '$1');
  processed = processed.replace(/`([^`]+)`/g, '$1');

  // Engineering units and mathematical symbols
  processed = processed.replace(/kN\/m2/g, 'kN/m²');
  processed = processed.replace(/N\/mm2/g, 'N/mm²');
  processed = processed.replace(/m\/s2/g, 'm/s²');
  processed = processed.replace(/\bmm2\b/g, 'mm²');

  processed = processed.replace(/\bdegrees?\b/gi, '°');
  processed = processed.replace(/\bdeg\b/gi, '°');

  processed = processed.replace(/->/g, '→');
  processed = processed.replace(/<=/g, '≤');
  processed = processed.replace(/>=/g, '≥');
  processed = processed.replace(/\+\/-/g, '±');

  return processed;
}
