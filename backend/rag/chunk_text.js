// 
import fs from "fs";

const text = fs.readFileSync("./rag/textbook.txt", "utf8");

// Split by blank lines
let rawParagraphs = text
  .split(/\n\s*\n/)
  .map(p => p.trim())
  .filter(p => p.length);

const MIN_WORDS = 15;

let paragraphs = [];
let carryForward = "";   // buffer for short paragraphs to attach to NEXT one

for (let raw of rawParagraphs) {
  // Normalize internal newlines inside paragraph
  let p = raw.replace(/\s*\n+\s*/g, " ").trim();

  const wordCount = p.split(/\s+/).length;

  // Detect page-number artifact: digits directly glued to a word (e.g., "6converting")
  const isPageBreakContinuation = /^\d+[A-Za-z]/.test(p);

  if (isPageBreakContinuation) {
    // RULE 1: Attach to previous paragraph
    p = p.replace(/^\d+/, "").trim(); // remove leading digits
    if (paragraphs.length > 0) {
      paragraphs[paragraphs.length - 1] += " " + p;
    } else {
      // edge case: if it's the very first, fall back to new paragraph
      paragraphs.push(p);
    }
    continue;
  }

  if (wordCount < MIN_WORDS) {
    // RULE 2: Short paragraph → attach to NEXT paragraph
    carryForward += (carryForward ? " " : "") + p;
    continue;
  }

  // NORMAL PARAGRAPH
  if (carryForward) {
    paragraphs.push(carryForward + " " + p);
    carryForward = "";
  } else {
    paragraphs.push(p);
  }
}

// If end-of-file leaves dangling buffer
if (carryForward) {
  paragraphs.push(carryForward);
}

// Output chunks
let chunks = paragraphs.map((p, i) => ({
  id: i,
  text: p
}));

fs.writeFileSync("./rag/chunks.json", JSON.stringify(chunks, null, 2));
console.log("Created", chunks.length, "paragraph chunks");


// import fs from "fs";
// import { encoding_for_model } from "@dqbd/tiktoken";

// const encoder = encoding_for_model("gpt-4o-mini");  // or the embedding model you're using
// const MAX_TOKENS = 450;       // target chunk length
// const OVERLAP = 100;          // sliding window overlap

// // 1. Load text
// const raw = fs.readFileSync("rag/textbook.txt", "utf8");

// // 2. Split by paragraphs (double newline)
// let paragraphs = raw.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

// // 3. Convert each paragraph to tokens
// let tokenizedParagraphs = paragraphs.map(p => ({
//   text: p,
//   tokens: Array.from(encoder.encode(String(p)))
// }));

// // 4. Build chunks with token windows
// let chunks = [];
// let buffer = [];
// let bufferTokens = [];

// for (let i = 0; i < tokenizedParagraphs.length; i++) {
//   const paraTokens = tokenizedParagraphs[i].tokens;

//   // If adding paragraph exceeds limit → flush chunk
//   if (bufferTokens.length + paraTokens.length > MAX_TOKENS) {

//     // Create a chunk
//     chunks.push({
//       id: chunks.length,
//       text: buffer.join("\n\n"),
//       token_length: bufferTokens.length
//     });

//     // Sliding window: keep overlap ONLY if exists
//     let overlapTokens = bufferTokens.slice(-OVERLAP);
//     let overlapText = "";
//     if (overlapTokens.length > 0) {
//       let decoded = encoder.decode(overlapTokens);
//       overlapText = String(decoded);
//     }
//     buffer = overlapText ? [overlapText] : [];
//     bufferTokens = overlapText ? Array.from(encoder.encode(String(overlapText))) : [];
//   }

//   // Add paragraph
//   buffer.push(tokenizedParagraphs[i].text);
//   bufferTokens = bufferTokens.concat(Array.from(paraTokens));
// }

// // Push final buffer
// if (buffer.length > 0) {
//   chunks.push({
//     id: chunks.length,
//     text: buffer.join("\n\n"),
//     token_length: bufferTokens.length
//   });
// }

// // Save JSON
// fs.writeFileSync("rag/chunks.json", JSON.stringify(chunks, null, 2));

// console.log("Chunks created:", chunks.length);