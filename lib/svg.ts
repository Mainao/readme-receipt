import { ReceiptStats } from "./types";

const PINK = "#F6C7D8";
const PAPER = "#FFFFFF";
const INK = "#2B2B2B";
const MUTED = "#4A4A4A";
const DOT = "#2B2B2B";

function escapeXml(input: string): string {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/** A rect with a zigzag "torn paper" edge on the top AND bottom, straight sides. */
function tornEdgeRectPath(
    x: number,
    y: number,
    w: number,
    h: number,
    teeth: number,
    depth: number,
): string {
    const step = w / teeth;
    let d = `M${x} ${y + depth}`;

    for (let i = 0; i < teeth; i++) {
        const xMid = x + (i + 0.5) * step;
        const xEnd = x + (i + 1) * step;
        d += ` L${xMid} ${y} L${xEnd} ${y + depth}`;
    }

    d += ` L${x + w} ${y + h - depth}`;

    for (let i = teeth - 1; i >= 0; i--) {
        const xMid = x + (i + 0.5) * step;
        const xStart = x + i * step;
        d += ` L${xMid} ${y + h} L${xStart} ${y + h - depth}`;
    }

    d += ` L${x} ${y + depth} Z`;
    return d;
}

export function buildReceiptSVG(stats: ReceiptStats): string {
    const width = 380;
    const inset = 26;
    const innerX = inset;
    const innerW = width - inset * 2;
    const innerLeft = innerX + 22;
    const innerRight = innerX + innerW - 22;
    const centerX = width / 2;
    const teeth = 11;
    const toothDepth = 10;

    const items: Array<[string, string]> = [
        ["Commits", String(stats.totalCommits)],
        ["Pull Requests", String(stats.totalPRs)],
        ["Issues Closed", String(stats.totalIssues)],
        ["Stars Earned", String(stats.totalStars)],
        ["Repos Owned", String(stats.activeRepoCount)],
        ["Current Streak", `${stats.currentStreak} days`],
    ];

    let y = inset;
    const innerYPlaceholder = inset;
    y = innerYPlaceholder;

    const parts: string[] = [];

    y += 52;
    parts.push(
        `<text x="${centerX}" y="${y}" text-anchor="middle" font-family="Georgia, serif" font-size="23" font-weight="700" fill="${INK}">GitHub Activity</text>`,
    );
    y += 28;
    parts.push(
        `<text x="${centerX}" y="${y}" text-anchor="middle" font-family="Georgia, serif" font-size="23" font-weight="700" fill="${INK}">Receipt</text>`,
    );

    y += 24;
    parts.push(
        `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${INK}" stroke-width="1.5"/>`,
    );

    y += 32;
    parts.push(
        `<text x="${centerX}" y="${y}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="13" fill="${MUTED}">A snapshot of recent GitHub activity</text>`,
    );
    y += 22;
    parts.push(
        `<text x="${centerX}" y="${y}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="13" fill="${MUTED}">Serving Size: 1 Developer</text>`,
    );

    y += 36;
    parts.push(
        `<text x="${centerX}" y="${y}" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="14" fill="${INK}">Amount Per Commit</text>`,
    );
    y += 18;
    parts.push(
        `<text x="${centerX}" y="${y}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="11" fill="${MUTED}">(stats fetched live from GitHub)</text>`,
    );

    y += 18;
    parts.push(
        `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${INK}" stroke-width="1"/>`,
    );

    y += 30;
    for (const [label, value] of items) {
        const charWidth = 7.6;
        const labelWidth = label.length * charWidth;
        const lineStart = innerLeft + labelWidth + 8;
        const lineEnd = innerRight - 62;

        parts.push(`
      <text x="${innerLeft}" y="${y}" font-family="Courier New, monospace" font-size="13" fill="${INK}">${escapeXml(
          label,
      )}</text>
      <line x1="${lineStart}" y1="${y - 4}" x2="${lineEnd}" y2="${y - 4}"
            stroke="${DOT}" stroke-width="1.5" stroke-dasharray="1.5 3.5" opacity="0.7"/>
      <text x="${innerRight}" y="${y}" text-anchor="end" font-family="Courier New, monospace" font-size="13" fill="${INK}">${escapeXml(
          value,
      )}</text>
    `);
        y += 30;
    }

    y += 8;
    parts.push(
        `<line x1="${innerLeft}" y1="${y}" x2="${innerRight}" y2="${y}" stroke="${INK}" stroke-width="1"/>`,
    );
    y += 16;
    parts.push(
        `<text x="${centerX}" y="${y}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="9.5" fill="${MUTED}">**Streaks reset if a day passes with no activity.</text>`,
    );

    y += 40;
    parts.push(
        `<text x="${centerX}" y="${y}" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="14" fill="${INK}">Thanks for stopping by!</text>`,
    );
    y += 24;
    parts.push(
        `<text x="${centerX}" y="${y}" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="14" fill="${INK}">@${escapeXml(
            stats.username,
        )}</text>`,
    );

    const innerH = y - innerYPlaceholder + 34;
    const height = innerYPlaceholder * 2 + innerH;

    const body = `
    <rect x="0" y="0" width="${width}" height="${height}" rx="18" fill="${PINK}"/>
    <path d="${tornEdgeRectPath(innerX, innerYPlaceholder, innerW, innerH, teeth, toothDepth)}" fill="${PAPER}"/>
    ${parts.join("\n")}
  `;

    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <title>${escapeXml(stats.username)}'s GitHub receipt</title>
  ${body}
</svg>`;
}

/** Fallback shown when a username is invalid or the GitHub API call fails. */
export function buildErrorSVG(message: string): string {
    const width = 380;
    const height = 220;
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${width}" height="${height}" rx="18" fill="${PINK}"/>
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="${PAPER}"/>
  <text x="${width / 2}" y="${height / 2 - 10}" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="16" fill="${INK}">Receipt Error</text>
  <text x="${width / 2}" y="${height / 2 + 14}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="11" fill="${MUTED}">${escapeXml(
      message,
  )}</text>
</svg>`;
}
