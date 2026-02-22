import dotenv from "dotenv";
//import { GoogleGenAI } from "@google/genai";
import { OpenAI } from "openai/client.js";
dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.error("FATAL ERROR: GEMINI_API_KEY is not set");
  process.exit(1);
}

const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:8000", // your app URL
    "X-Title": "AI Learnit" // your app name
  }
});

/* =========================
   FLASHCARD GENERATION
========================= */

 const generateFlashcards = async (text, count = 10) => {
  if (!text || typeof text !== "string") {
    throw new Error("Text input is required for flashcards");
  }

  const prompt = `
You are an API that returns ONLY structured flashcards.

Return EXACTLY ${count} flashcards in THIS FORMAT ONLY:

Q: question here
A: answer here
D: easy

Separate each flashcard with ---
NO extra text. NO markdown. NO explanations.

TEXT TO USE:
${text.slice(0, 3000)}
`;

  try {
    const response = await ai.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct",
      messages: [
        {
          role: "system",
          content: "You must return only in the exact flashcard format. No extra words."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.1
    });

    const generatedText = response.choices?.[0]?.message?.content;

    if (!generatedText) {
      console.error("EMPTY AI RESPONSE");
      throw new Error("Empty response from OpenRouter");
    }

    console.log("🟡 RAW AI OUTPUT:\n", generatedText);

    const cards = generatedText
      .split("---")
      .map(c => c.trim())
      .filter(Boolean);

    const flashcards = [];

    for (const card of cards) {
      let question = "";
      let answer = "";
      let difficulty = "medium";

      for (const line of card.split("\n")) {
        const t = line.trim();

        if (t.startsWith("Q:"))
          question = t.slice(2).trim();

        else if (t.startsWith("A:"))
          answer = t.slice(2).trim();

        else if (t.startsWith("D:")) {
          const d = t.slice(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(d))
            difficulty = d;
        }
      }

      if (question && answer) {
        flashcards.push({ question, answer, difficulty });
      }
    }

    if (flashcards.length === 0) {
      console.error("❌ PARSE FAILED – RAW OUTPUT:\n", generatedText);
      throw new Error("AI format not parsable");
    }

    return flashcards.slice(0, count);

  } catch (err) {
    console.error("❌ FLASHCARD SERVICE ERROR:", err);

    if (err?.status === 429) {
      throw new Error("AI quota exceeded. Try later.");
    }

    throw new Error("Failed to generate flashcards");
  }
};



/* =========================
   QUIZ GENERATION
========================= */

 const generateQuiz = async (text, numQuestions = 5) => {

  // ───────── VALIDATION ─────────
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("generateQuiz expects 'text' to be a non-empty string");
  }

  const safeText = text.replace(/\n+/g, " ").slice(0, 3500);

  const prompt = `
You are a JSON API.

RULES:
- RETURN ONLY RAW JSON
- NO markdown
- NO explanation
- NO commentary
- NO extra text

Generate EXACTLY ${numQuestions} quiz questions.

FORMAT:
{
  "questions": [
    {
      "question": "string",
      "options": ["string","string","string","string"],
      "correctAnswer": "string",
      "explanation": "string",
      "difficulty": "easy|medium|hard"
    }
  ]
}

TEXT:
${safeText}
`;

  // ───────── HELPERS ─────────
  const extractJSON = (raw) => {
    if (!raw) return null;

    // remove markdown
    let cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // extract JSON block if model adds text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleaned = jsonMatch[0];

    return cleaned;
  };

  const validate = (data) => {
    if (!data || !Array.isArray(data.questions)) return false;

    return data.questions.every(q =>
      typeof q.question === "string" &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      q.options.every(o => typeof o === "string") &&
      typeof q.correctAnswer === "string" &&
      typeof q.explanation === "string"
    );
  };

  // ───────── MAIN CALL (2 ATTEMPTS) ─────────
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {

      const response = await ai.chat.completions.create({
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          { role: "system", content: "You are a strict JSON generator API." },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 1500
      });

      const raw = response?.choices?.[0]?.message?.content;

      if (!raw) {
        throw new Error("Empty AI response");
      }

      const extracted = extractJSON(raw);

      if (!extracted) {
        console.error("RAW AI OUTPUT:\n", raw);
        throw new Error("No JSON found in AI output");
      }

      let parsed;
      try {
        parsed = JSON.parse(extracted);
      } catch (e) {
        console.error("INVALID JSON RAW:\n", raw);
        throw new Error("AI returned malformed JSON");
      }

      if (!validate(parsed)) {
        console.error("INVALID STRUCTURE:\n", parsed);
        throw new Error("Invalid quiz JSON structure");
      }

      return parsed.questions.slice(0, numQuestions);

    } catch (err) {

      // Retry only on parsing / format issues
      if (attempt === 1) {
        console.warn("⚠️ Quiz generation failed, retrying...");
        continue;
      }

      if (err?.status === 429) {
        throw new Error("AI quota exceeded. Try again later.");
      }

      console.error("❌ OpenRouter Quiz Error:", {
        message: err.message,
        status: err.status,
        raw: err
      });

      throw new Error("Failed to generate quiz");
    }
  }
};


/* =========================
   SUMMARY
========================= */

 const generateSummary = async (text) => {
  try {
    if (typeof text !== "string" || !text.trim()) {
      throw new Error("generateSummary expects non-empty text");
    }

    const prompt = `
Create a concise, well-structured summary.

Focus on:
- Key concepts  
- Main ideas  
- Important facts  
- Actionable takeaways  

TEXT:
${text.slice(0, 8000)}
`;

    const response = await ai.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });

    const summary = response.choices?.[0]?.message?.content;

    if (!summary) {
      throw new Error("Empty summary response from AI");
    }

    return summary.trim();

  } catch (err) {
    console.error("OpenRouter summary error:", err);
    throw new Error("Failed to generate summary");
  }
};
/* =========================
   CHAT WITH CONTEXT
========================= */
 const chatWithContext = async (question, chunks = []) => {

  const context = (chunks || [])
    .map((c, i) => `[Chunk ${i + 1}]\n${c.content || ""}`)
    .join("\n\n");

  const prompt = `
Answer the question using ONLY the context below.
If answer is not present, reply: "I cannot find this in the document."

CONTEXT:
${context.slice(0, 8000)}

QUESTION:
${question}

ANSWER:
`;

  try {
    const response = await ai.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct",
      messages: [
        { role: "system", content: "You are a document assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });

    const answer = response.choices?.[0]?.message?.content;

    if (!answer) {
      throw new Error("Empty AI response");
    }

    return answer;

  } catch (err) {
    console.error("OpenRouter chat error:", err);
    throw new Error("Failed to process chat request");
  }
};

export default {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chatWithContext
}