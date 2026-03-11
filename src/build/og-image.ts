import { writeDistFile } from "./dist-fs.ts";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#1a1917"/>
  <rect x="60" y="60" width="1080" height="510" rx="12" fill="none" stroke="#3a3935" stroke-width="1"/>
  <text x="600" y="290" font-size="72" font-weight="700" text-anchor="middle" fill="#f8f7f5" font-family="system-ui, sans-serif" letter-spacing="-0.02em">Ulrich Green</text>
  <text x="600" y="370" font-size="28" text-anchor="middle" fill="#8a8880" font-family="system-ui, sans-serif">ulrich.green</text>
</svg>`;

export function buildOgImage(): void {
    writeDistFile("og-image.svg", svg);
}
