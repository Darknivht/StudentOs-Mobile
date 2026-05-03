import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OCRResult {
  text: string;
  error?: string;
}

async function extractTextWithGeminiVision(
  base64Image: string,
  apiKey: string,
): Promise<OCRResult> {
  const model = "gemini-2.0-flash";

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: "Please extract all text from this image. Return ONLY the extracted text with no additional commentary. Preserve paragraph structure and formatting where possible.",
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      return {
        text: "",
        error: `Gemini Vision API error: ${response.status} - ${errText}`,
      };
    }

    const data = await response.json();
    const extractedText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!extractedText) {
      return { text: "", error: "No text found in image" };
    }

    return { text: extractedText };
  } catch (err) {
    return { text: "", error: `Vision OCR failed: ${err.message}` };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      return new Response(JSON.stringify({ error: "No image data provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("EXPO_PUBLIC_AI_API_KEY") || "";

    if (!apiKey || apiKey === "your-ai-api-key") {
      return new Response(
        JSON.stringify({
          text: "",
          error: "AI_API_KEY not configured in edge function environment",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const result = await extractTextWithGeminiVision(image, apiKey);

    if (result.error) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ text: result.text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
