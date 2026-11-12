/**
 * Génère une couverture de livre (image SVG) UNIQUE pour chaque livre.
 * Pas besoin d'internet ni d'images : la couleur dépend de la catégorie,
 * et le motif dépend du titre → deux livres n'ont jamais la même couverture.
 */

const CATEGORY_HUE: Record<string, number> = {
  Développement: 215,
  Informatique: 245,
  Web: 175,
  'Bases de données': 28,
  Réseaux: 195,
  Mathématiques: 285,
  Sciences: 150,
  Littérature: 350,
  Gestion: 40
};

const cache = new Map<string, string>();

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wrap(text: string, max: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if ((line + ' ' + word).trim().length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = (line + ' ' + word).trim();
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const cut = lines.slice(0, maxLines);
    cut[maxLines - 1] = cut[maxLines - 1].replace(/.{0,2}$/, '') + '…';
    return cut;
  }
  return lines;
}

export function generateCover(title: string, author: string, category: string): string {
  const key = `${title}|${author}|${category}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const h = hash(key);
  const base = CATEGORY_HUE[category] ?? h % 360;
  const hue1 = (base + (h % 30) - 15 + 360) % 360;
  const hue2 = (hue1 + 25 + (h % 20)) % 360;
  const pattern = h % 4;

  let deco = '';
  if (pattern === 0) {
    deco = `<circle cx="${60 + (h % 180)}" cy="330" r="120" fill="#fff" opacity=".09"/><circle cx="260" cy="${60 + (h % 80)}" r="70" fill="#fff" opacity=".08"/>`;
  } else if (pattern === 1) {
    for (let i = -4; i < 12; i++) deco += `<path d="M${i * 40} 420 L${i * 40 + 220} 0" stroke="#fff" stroke-width="10" opacity=".07"/>`;
  } else if (pattern === 2) {
    for (let r = 0; r < 9; r++) for (let c = 0; c < 6; c++) deco += `<circle cx="${25 + c * 50}" cy="${215 + r * 24}" r="${2 + ((r + c + h) % 3)}" fill="#fff" opacity=".18"/>`;
  } else {
    for (let i = 1; i <= 5; i++) deco += `<circle cx="300" cy="420" r="${i * 45}" fill="none" stroke="#fff" stroke-width="2" opacity=".14"/>`;
  }

  const titleLines = wrap(title, 15, 5);
  const titleSvg = titleLines
    .map((l, i) => `<text x="34" y="${120 + i * 34}" font-family="Georgia,serif" font-size="27" font-weight="700" fill="#fff">${esc(l)}</text>`)
    .join('');
  const authorSvg = wrap(author, 24, 2)
    .map((l, i) => `<text x="34" y="${368 + i * 18}" font-family="Arial,sans-serif" font-size="14" fill="#f4ecd8">${esc(l)}</text>`)
    .join('');

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue1},48%,24%)"/><stop offset="1" stop-color="hsl(${hue2},52%,38%)"/></linearGradient></defs>` +
    `<rect width="300" height="420" fill="url(#g)"/>${deco}` +
    `<rect x="0" y="0" width="14" height="420" fill="#000" opacity=".22"/>` +
    `<text x="34" y="50" font-family="Arial,sans-serif" font-size="11" letter-spacing="3" fill="#e9c874">${esc(category.toUpperCase())}</text>` +
    `<rect x="34" y="60" width="46" height="3" fill="#e9c874"/>` +
    `${titleSvg}${authorSvg}</svg>`;

  const uri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  cache.set(key, uri);
  return uri;
}
