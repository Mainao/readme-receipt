import Image from "next/image";

export default function Home() {
    const exampleUsername = "Mainao";

    return (
        <main
            style={{
                fontFamily: "Courier New, monospace",
                background: "#F3EEE3",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "4rem 1rem",
                gap: "1.5rem",
            }}
        >
            <h1 style={{ fontSize: "1.5rem", letterSpacing: "2px" }}>
                readme-receipt
            </h1>
            <p style={{ color: "#8A8574", maxWidth: 420, textAlign: "center" }}>
                Your GitHub stats, itemized like a receipt. Drop this into your
                profile README.
            </p>

            <Image
                src={`/api/receipt?username=${exampleUsername}`}
                alt="Example receipt widget"
                width={340}
                height={620}
                unoptimized
                loading="eager"
            />

            <div
                style={{
                    background: "#fff",
                    border: "1px solid #D8D2C0",
                    borderRadius: 8,
                    padding: "1rem",
                    maxWidth: 500,
                    fontSize: "0.85rem",
                }}
            >
                <p style={{ marginBottom: "0.5rem" }}>
                    Embed in your own README:
                </p>
                <code
                    style={{
                        display: "block",
                        background: "#F3EEE3",
                        padding: "0.75rem",
                        borderRadius: 4,
                        wordBreak: "break-all",
                    }}
                >
                    {`<img src="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-deployment.vercel.app"}/api/receipt?username=YOUR_USERNAME" />`}
                </code>
            </div>

            <a
                href="https://github.com/YOUR_USERNAME/readme-receipt"
                style={{ color: "#2DA44E" }}
            >
                View source on GitHub →
            </a>
        </main>
    );
}
