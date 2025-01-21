import { sendDiscordNotification } from "@/utils/discord";

export async function POST(req) {
    try {
        const { feedback } = await req.json();

        await sendDiscordNotification(
            "📝 **New Feedback Received**\n" + feedback
        );

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Feedback submission error:", error);
        return new Response(JSON.stringify({ error: "Failed to submit feedback" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
} 