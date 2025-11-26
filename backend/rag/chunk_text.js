import fs from "fs";

const text = fs.readFileSync("./rag/textbook.txt", "utf8");

// Split into ~1000 word chunks
const words = text.split(/\s+/);
const chunkSize = 800;

let chunks = [];
for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    chunks.push({ id: i, text: chunk });
}

fs.writeFileSync("./rag/chunks.json", JSON.stringify(chunks, null, 2));
console.log("Created", chunks.length, "chunks");
