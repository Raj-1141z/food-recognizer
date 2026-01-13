import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  app.post(api.scan.process.path, async (req, res) => {
    try {
      const input = api.scan.process.input.parse(req.body);
      let { image } = input;

      if (!image.startsWith("data:")) {
        image = `data:image/jpeg;base64,${image}`;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: 'Identify the food in this image. Return ONLY JSON like {"foodName": "Pizza"}.',
              },
              {
                type: "image_url",
                image_url: { url: image },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 100,
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("No AI response");

      let result;
      try {
        result = JSON.parse(content);
      } catch {
        result = { foodName: content };
      }

      const foodName = result.foodName || "Unknown Food";

      await storage.createScan({
        foodName,
        imageUrl: image.length > 100000 ? null : image,
        analysis: result,
      });

      res.json({
        foodName,
        success: true,
      });
    } catch (err) {
      console.error("Scan error:", err);

      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: err.errors[0].message,
        });
      }

      res.status(500).json({
        success: false,
        foodName: "Unknown Food",
      });
    }
  });

  app.get(api.scan.list.path, async (req, res) => {
    const scans = await storage.getScans();
    res.json(scans);
  });

  return httpServer;
}
