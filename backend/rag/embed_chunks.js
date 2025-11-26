import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const chunks = JSON.parse(fs.readFileSync("./rag/chunks.json", "utf8"));

async function run() {
    const vectors = [];

    for (let chunk of chunks) {
        const embedding = await client.embeddings.create({
            model: "text-embedding-3-large",
            input: chunk.text
        });

        vectors.push({
            id: chunk.id,
            text: chunk.text,
            embedding: embedding.data[0].embedding
        });

        console.log("Embedded chunk", chunk.id);
    }

    fs.writeFileSync("./rag/embeddings.json", JSON.stringify(vectors, null, 2));
}

run();
