import { NextRequest } from "next/server";
import { getReceiptStats } from "@/lib/github";
import { buildReceiptSVG, buildErrorSVG } from "@/lib/svg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const username =
        searchParams.get("username") ??
        process.env.DEFAULT_GITHUB_USERNAME ??
        "";

    if (!username) {
        return svgResponse(
            buildErrorSVG(
                "No username provided. Add ?username=yourname to the URL.",
            ),
            400,
        );
    }

    try {
        const stats = await getReceiptStats(username);
        return svgResponse(buildReceiptSVG(stats), 200);
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "Something went wrong";
        return svgResponse(buildErrorSVG(message), 200);
    }
}

function svgResponse(svg: string, status: number) {
    return new Response(svg, {
        status,
        headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=300, s-maxage=300",
        },
    });
}
