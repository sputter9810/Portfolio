import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 5050;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "LifeStack API is running" });
});

app.post("/api/review-schedule", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "Missing OPENAI_API_KEY in .env",
      });
    }

    const { activities, schedule } = req.body;

    if (!Array.isArray(activities) || !Array.isArray(schedule)) {
      return res.status(400).json({
        error: "Expected activities and schedule arrays.",
      });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      instructions:
        "You are a practical weekly planning assistant. Review schedules for balance, sustainability, overloading, recovery, and consistency. Respect locked sessions. Be concise, specific, and actionable.",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify(
                {
                  task: "Review this LifeStack weekly schedule.",
                  goals: [
                    "Respect locked sessions.",
                    "Avoid overloading heavy fitness sessions.",
                    "Avoid duplicate sessions unless intentional.",
                    "Keep software project progress consistent.",
                    "Keep the plan realistic and sustainable.",
                  ],
                  activities,
                  schedule,
                  responseFormat:
                    "Return a concise review with Summary, Strengths, Issues, Suggestions, and Revised Week sections.",
                },
                null,
                2
              ),
            },
          ],
        },
      ],
    });

    res.json({
      review: response.output_text,
    });
  } catch (error) {
    console.error("AI review failed:", error);

    res.status(500).json({
      error: "AI review failed. Check your server terminal for details.",
    });
  }
});

app.listen(port, () => {
  console.log(`LifeStack API running on http://localhost:${port}`);
});