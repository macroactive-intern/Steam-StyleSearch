function hashString(value: string) {
  let hash = 0;

  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) % 360;
  }

  return hash;
}

function coverTitle(slug: string) {
  return slug
    .replace(/\.[a-z0-9]+$/i, "")
    .split("-")
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function escapeSvgText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cover: string }> },
) {
  const { cover } = await params;
  const hue = hashString(cover);
  const title = escapeSvgText(coverTitle(cover));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480" role="img" aria-label="${title} cover"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="hsl(${hue} 70% 28%)"/><stop offset="100%" stop-color="hsl(${(hue + 70) % 360} 72% 48%)"/></linearGradient><pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M64 0H0V64" fill="none" stroke="white" stroke-opacity=".12" stroke-width="2"/></pattern></defs><rect width="640" height="480" fill="url(#bg)"/><rect width="640" height="480" fill="url(#grid)"/><circle cx="500" cy="100" r="150" fill="white" fill-opacity=".12"/><circle cx="120" cy="380" r="190" fill="black" fill-opacity=".18"/><text x="40" y="390" fill="white" font-family="Arial, sans-serif" font-size="42" font-weight="700">${title}</text></svg>`;

  return new Response(svg, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/svg+xml",
    },
  });
}
