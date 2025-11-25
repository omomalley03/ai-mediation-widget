import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors())
app.use(express.json());

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = "You are an AI mediator monitoring a conversation between Alice and Bob on a polarizing political topic. At each turn, you receive the current dialogue and must output exactly one of two things: “[silence]” if no mediation is needed, or “[prompt]: <your facilitating prompt>” if intervention would improve the discussion. If the conversation is empty (no messages yet), you must begin by briefly stating ground rules—respect, turn-taking, and a focus on understanding rather than winning—and then invite Alice to start; this initial output must use the “[prompt]: …” format. After the conversation begins, you should output “[prompt]” when the discussion becomes hostile or personal (insults, contempt, personal attacks), when one person dominates and the other is not being heard, when Alice and Bob misunderstand or talk past each other, when emotions escalate and clarity drops, when the discussion becomes stuck or circular, or when misinterpretation or unclear terminology needs correction. A facilitation prompt should be brief, neutral, and aimed at restoring respect, balance, clarity, or shared understanding. You should output “[silence]” when the conversation is respectful, balanced, calm, and progressing constructively on its own, or when a pause would be productive. The default is silence unless there is a clear reason to intervene. Your output must always be exactly “[silence]” or “[prompt]: <message>” with no additional commentary.";

app.post("/api/mediate", async (req, res) => {
    try {
        const { dialogue } = req.body;

        const result = await client.responses.create({
            model: "gpt-5.1",
            input: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Dialogue:\n${dialogue}` }
            ]
        });

        const output = result.output_text;  // OpenAI responses API
        res.json({ output });

    } catch (err) {
        console.error("🔥 Backend error:", err);
        res.status(500).json({ error: "Server-side error" });
    }
});

// Start server
app.listen(3000, () => console.log("✅ Backend running on http://localhost:3000"));