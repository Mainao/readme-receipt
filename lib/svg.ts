import { ReceiptStats, DayContribution } from "./types";

const PAPER = "#FAF6EC";
const INK = "#3A362E";
const MUTED = "#8A8574";
const DASH = "#B9B29E";
const STAMP_GREEN = "#2DA44E";

function levelColor(count: number): string {
    if (count <= 0) return "#EBEDF0";
    if (count < 3) return "#9BE9A8";
    if (count < 6) return "#40C463";
    if (count < 9) return "#30A14E";
    return "#216E39";
}

function escapeXml(input: string): string {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function receiptOutlinePath(
    width: number,
    height: number,
    teeth: number,
): string {
    const bottomY = height - 30;
    const step = width / teeth;
    let d = `M0 0 H${width} V${bottomY}`;
    for (let i = 0; i < teeth; i++) {
        const xDown = width - (i + 0.5) * step;
        const xUp = width - (i + 1) * step;
        d += ` L${xDown} ${bottomY + 10} L${xUp} ${bottomY}`;
    }
    d += " Z";
    return d;
}

function buildStamp(
    last10Days: DayContribution[],
    cx: number,
    cy: number,
): string {
    const size = 14; // was 22
    const gap = 4; // was 6
    const cols = 5;
    const startX = cx - (cols * (size + gap) - gap) / 2;
    const rowY = [cy - 28, cy - 28 + size + gap]; // was cy - 36

    const squares = last10Days
        .map((day, i) => {
            const row = i < 5 ? 0 : 1;
            const col = i % 5;
            const x = startX + col * (size + gap);
            const y = rowY[row];
            return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="2" fill="${levelColor(day.count)}"/>`;
        })
        .join("");

    return `
      <g transform="rotate(-10 ${cx} ${cy})">
        <circle cx="${cx}" cy="${cy}" r="70" fill="none" stroke="${STAMP_GREEN}" stroke-width="3" opacity="0.85"/>
        <circle cx="${cx}" cy="${cy}" r="58" fill="none" stroke="${STAMP_GREEN}" stroke-width="1.2" opacity="0.6"/>
        ${squares}
              <text x="${cx}" y="${cy + 34}" text-anchor="middle" font-family="Courier New, monospace"
            font-size="13" font-weight="700" fill="${STAMP_GREEN}" opacity="0.85" letter-spacing="1">COMMITTED</text>
      </g>
    `;
}

export function buildReceiptSVG(stats: ReceiptStats): string {
    const width = 340;
    const height = 620;
    const now = new Date();
    const timestamp = now.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });

    const items = [
        ["COMMITS", stats.totalCommits],
        ["PULL REQS", stats.totalPRs],
        ["ISSUES", stats.totalIssues],
        ["STARS EARNED", stats.totalStars],
        ["REPOS OWNED", stats.activeRepoCount],
    ] as const;

    const itemsSvg = items
        .map(
            ([label, value], i) => `
        <text x="24" y="${118 + i * 24}" font-family="Courier New, monospace" font-size="13" fill="${INK}">${label}</text>
        <text x="${width - 24}" y="${118 + i * 24}" text-anchor="end" font-family="Courier New, monospace" font-size="13" fill="${INK}">${value}</text>
      `,
        )
        .join("");

    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <title>${escapeXml(stats.username)}'s GitHub receipt</title>
  <g transform="rotate(-1 ${width / 2} ${height / 2})">
    <path d="${receiptOutlinePath(width, height, 12)}" fill="${PAPER}" stroke="${DASH}" stroke-width="1"/>

    <text x="${width / 2}" y="42" text-anchor="middle" font-family="Courier New, monospace" font-size="16" fill="${INK}" letter-spacing="2">* GITHUB RECEIPT *</text>
    <text x="${width / 2}" y="64" text-anchor="middle" font-family="Courier New, monospace" font-size="13" fill="${INK}">@${escapeXml(stats.username)}</text>
    <text x="${width / 2}" y="82" text-anchor="middle" font-family="Courier New, monospace" font-size="11" fill="${MUTED}">${timestamp}</text>

    <line x1="24" y1="94" x2="${width - 24}" y2="94" stroke="${DASH}" stroke-width="1" stroke-dasharray="4 4"/>

    ${itemsSvg}

    <line x1="24" y1="232" x2="${width - 24}" y2="232" stroke="${DASH}" stroke-width="1" stroke-dasharray="4 4"/>

    <text x="24" y="256" font-family="Courier New, monospace" font-size="15" fill="${INK}">TOTAL CONTRIB.</text>
    <text x="${width - 24}" y="256" text-anchor="end" font-family="Courier New, monospace" font-size="15" fill="${INK}">${stats.totalContributions}</text>
    <text x="24" y="278" font-family="Courier New, monospace" font-size="12" fill="${MUTED}">CURRENT STREAK</text>
    <text x="${width - 24}" y="278" text-anchor="end" font-family="Courier New, monospace" font-size="12" fill="${MUTED}">${stats.currentStreak} DAYS</text>

    <line x1="24" y1="296" x2="${width - 24}" y2="296" stroke="${DASH}" stroke-width="1" stroke-dasharray="4 4"/>

    <text x="24" y="320" font-family="Courier New, monospace" font-size="12" fill="${INK}">PAID WITH: ${escapeXml(stats.topLanguage)}</text>

    ${buildStamp(stats.last10Days, width - 90, 440)}

    <text x="${width / 2}" y="560" text-anchor="middle" font-family="Courier New, monospace" font-size="11" fill="${MUTED}" letter-spacing="1">thanks for stopping by ~</text>
  </g>
</svg>`;
}

export function buildErrorSVG(message: string): string {
    const width = 340;
    const height = 200;
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${PAPER}" stroke="${DASH}" stroke-width="1"/>
  <text x="${width / 2}" y="70" text-anchor="middle" font-family="Courier New, monospace" font-size="15" fill="${INK}">* RECEIPT ERROR *</text>
  <text x="${width / 2}" y="100" text-anchor="middle" font-family="Courier New, monospace" font-size="11" fill="${MUTED}">${escapeXml(
      message,
  )}</text>
</svg>`;
}
