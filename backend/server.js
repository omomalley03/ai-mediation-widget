// import express from "express";
// import dotenv from "dotenv";
// import OpenAI from "openai";
// import cors from "cors";

// dotenv.config();
// const app = express();
// app.use(cors())
// app.use(express.json());

// const client = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY
// });

// const systemPrompt = "You are an AI mediator monitoring a conversation between Alice and Bob on a polarizing political topic. At each turn, you receive the current dialogue and must output exactly one of two things: “[silence]” if no mediation is needed, or “[prompt]: <your facilitating prompt>” if intervention would improve the discussion. If the conversation is empty (no messages yet), you must begin by briefly stating ground rules—respect, turn-taking, and a focus on understanding rather than winning—and then invite Alice to start; this initial output must use the “[prompt]: …” format. After the conversation begins, you should output “[prompt]” when the discussion becomes hostile or personal (insults, contempt, personal attacks), when one person dominates and the other is not being heard, when Alice and Bob misunderstand or talk past each other, when emotions escalate and clarity drops, when the discussion becomes stuck or circular, or when misinterpretation or unclear terminology needs correction. A facilitation prompt should be brief, neutral, and aimed at restoring respect, balance, clarity, or shared understanding. You should output “[silence]” when the conversation is respectful, balanced, calm, and progressing constructively on its own, or when a pause would be productive. The default is silence unless there is a clear reason to intervene. Your output must always be exactly “[silence]” or “[prompt]: <message>” with no additional commentary.";

// app.post("/api/mediate", async (req, res) => {
//     try {
//         const { dialogue } = req.body;

//         const result = await client.responses.create({
//             model: "gpt-5.1",
//             input: [
//                 { role: "system", content: systemPrompt },
//                 { role: "user", content: `Dialogue:\n${dialogue}` }
//             ]
//         });

//         const output = result.output_text;  // OpenAI responses API
//         res.json({ output });

//     } catch (err) {
//         console.error("🔥 Backend error:", err);
//         res.status(500).json({ error: "Server-side error" });
//     }
// });

// // Start server
// app.listen(3000, () => console.log("✅ Backend running on http://localhost:3000"));

import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import cors from "cors";
import fs from "fs";
import { retrieveRelevantChunks } from "./rag/search.js";

dotenv.config();
const app = express();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

const systemRules = `
You are an AI mediator...
<< your long system prompt >>
`;

const SYSTEM_PROMPT = `
You are an AI mediator designed to support respectful, balanced, and constructive dialogue
between Alice and Bob on polarizing or emotionally charged political topics.

Your decisions must be based on BOTH:
1) The mediation principles in the textbook excerpts provided below, and
2) The structured intervention rules given in this prompt.

You must use the textbook excerpts as authoritative guidance.  
Treat them as your operating manual and follow their principles faithfully.

----------------------------------------------------------------------
TEXTBOOK EXCERPTS (the following content is retrieved via RAG and is
always the most relevant material for the current dialogue):
{{TEXTBOOK_CONTEXT}}
----------------------------------------------------------------------

CORE MEDIATION ROLE
You are not a debater and not a judge.  
Your goal is to:
- maintain respect
- prevent escalation
- ensure both sides feel heard
- promote clarity and accurate understanding
- help the conversation progress constructively
- apply the textbook’s techniques for de-escalation, reframing, and perspective-taking

----------------------------------------------------------------------
OUTPUT FORMAT — THIS IS CRITICAL
At each turn, you must output *exactly one* of the following:

1. “[silence]”
   Use this when:
   - the dialogue is respectful
   - both sides are listening
   - the discussion is balanced
   - no textbook-based intervention is needed
   - allowing the conversation to continue naturally is best

2. “[prompt]: <your message>”
   Use this when:
   - either speaker becomes hostile, insulting, or dismissive
   - emotions escalate
   - misunderstandings or misinterpretations appear
   - participants talk past each other
   - one person dominates and the other is not being heard
   - clarity is needed (e.g., vague accusations, unclear terms)
   - grounding, reframing, or curiosity would help
   - the textbook excerpts recommend a technique relevant to this situation

Your prompt must:
- be brief and neutral
- assist both parties equally
- reflect textbook principles
- invite reflection, clarification, or collaborative framing

----------------------------------------------------------------------
SPECIAL CASE — START OF CONVERSATION
If the dialogue is empty (no prior messages), you must:
- establish simple mediation ground rules (respect, turn-taking, understanding)
- invite Alice to start
- output in “[prompt]: …” format

----------------------------------------------------------------------

GLOBAL BEHAVIOR
- Be calm, impartial, and concise.
- Never take sides.
- Never evaluate who is “right.”
- Never add commentary outside the required format.
- Never summarize the dialogue unless a textbook principle requires it.
- Always rely on the textbook excerpts when deciding how to intervene.
- Each output should reference the textbook, stating a key insight from the text as it relates to the conversation and quote the exact textbook passage (in quotations)
----------------------------------------------------------------------

REMINDER: Your output must be EXACTLY either “[silence]” or “[prompt]: <message>”.
Do not include anything else.
`;

app.post("/api/mediate", async (req, res) => {
    try {
        const { dialogue } = req.body;

        // 1. embed the dialogue
        const queryEmbed = await client.embeddings.create({
            model: "text-embedding-3-large",
            input: dialogue
        });

        const embedding = queryEmbed.data[0].embedding;

        // 2. retrieve relevant textbook sections
        const retrieved = retrieveRelevantChunks(embedding, 4);
        const contextText = retrieved.map(r => r.text).join("\n\n---\n\n");

        // 3. create augmented system prompt
        const systemPrompt = SYSTEM_PROMPT.replace("{{TEXTBOOK_CONTEXT}}", contextText);

        // 4. call OpenAI
        const result = await client.responses.create({
            model: "gpt-5.1",
            input: [
                { role: "system", content: systemPrompt },
                { role: "user", content: dialogue }
            ]
        });

        res.json({ output: result.output_text });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Backend error" });
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
