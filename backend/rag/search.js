import fs from "fs";

const embeddings = JSON.parse(fs.readFileSync("./rag/embeddings.json", "utf8"));

function cosineSimilarity(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
}

export function retrieveRelevantChunks(queryEmbedding, topK = 5) {
    const scored = embeddings.map(item => ({
        text: item.text,
        score: cosineSimilarity(queryEmbedding, item.embedding)
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
}
