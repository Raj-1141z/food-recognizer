import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.scan.process.path, async (req, res) => {
    try {
      const input = api.scan.process.input.parse(req.body);
      const { image } = input;

      // Construct image data URL if needed, or assume base64 part
      // OpenAI expects: "data:image/jpeg;base64,{base64_image}" or url
      // If client sends raw base64, we might need to prepend prefix if missing.
      // But typically client sends full data URL or we handle it.
      // Let's assume input.image is the full data URL or base64 string.
      // If it's just base64, we should prepend "data:image/jpeg;base64," or similar if user didn't.
      // However, robust handling is better.
      let imageUrl = image;
      if (!image.startsWith("data:")) {
         imageUrl = `data:image/jpeg;base64,${image}`;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Identify the food in this image. Return ONLY a JSON object with a 'foodName' field. If no food is detected, return 'Unknown Food'." },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 300,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content received from AI");
      }

      let result;
      try {
        result = JSON.parse(content);
      } catch (e) {
        // Fallback if not valid JSON (shouldn't happen with json_object mode but safe to handle)
        result = { foodName: content };
      }

      const foodName = result.foodName || "Unknown Food";
      
      // Store scan
      const savedScan = await storage.createScan({
        foodName,
        imageUrl: image.length > 100000 ? null : image, // Don't store huge images in text column
        analysis: result,
      });

      res.status(200).json({
        foodName,
        analysis: result
      });

    } catch (err) {
      console.error("Scan error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to process image" });
    }
  });

  app.get(api.scan.list.path, async (req, res) => {
    const scans = await storage.getScans();
    res.json(scans);
  });

  return httpServer;
}
