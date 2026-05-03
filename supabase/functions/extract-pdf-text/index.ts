import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ExtractedText {
  text: string;
  pageCount?: number;
  error?: string;
}

async function extractTextFromPdf(base64Data: string): Promise<ExtractedText> {
  try {
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const textParts: string[] = [];
    let pageCount = 0;

    const pdfText = extractPdfTextSync(bytes);
    textParts.push(pdfText.text);
    pageCount = pdfText.pages || 1;

    return {
      text: textParts.join("\n\n").trim(),
      pageCount,
    };
  } catch (err) {
    return { text: "", error: `PDF extraction failed: ${err.message}` };
  }
}

function extractPdfTextSync(data: Uint8Array): { text: string; pages: number } {
  const raw = String.fromCharCode.apply(null, Array.from(data));
  const textContent: string[] = [];
  let pages = 1;

  const pageMatches = raw.match(/\/Count\s+(\d+)/g);
  if (pageMatches) {
    const counts = pageMatches.map((m) => parseInt(m.replace("/Count ", "")));
    pages = Math.max(...counts, 1);
  }

  const streamMatches = raw.match(/stream\s*([\s\S]*?)\s*endstream/g) || [];
  for (const stream of streamMatches) {
    const content = stream.replace(/stream\s*/, "").replace(/\s*endstream/, "");
    const BTmatches = content.match(/BT\s*([\s\S]*?)\s*ET/g) || [];
    for (const bt of BTmatches) {
      const tjMatches = bt.match(/\((.*?)\)\s*Tj/g) || [];
      for (const tj of tjMatches) {
        const match = tj.match(/\((.*?)\)/);
        if (match && match[1]) {
          const decoded = match[1]
            .replace(/\\n/g, "\n")
            .replace(/\\r/g, "\r")
            .replace(/\\t/g, "\t")
            .replace(/\\\(/g, "(")
            .replace(/\\\)/g, ")")
            .replace(/\\([\\()])/g, "$1");
          if (decoded.trim()) textContent.push(decoded);
        }
      }
      const TJmatches = bt.match(/\[(.*?)\]\s*TJ/g) || [];
      for (const tj of TJmatches) {
        const content = tj.replace(/\]\s*TJ/, "").replace(/^\[/, "");
        const parts = content.match(/\((.*?)\)/g) || [];
        let combined = "";
        for (const part of parts) {
          const inner = part.slice(1, -1);
          const decoded = inner
            .replace(/\\n/g, "\n")
            .replace(/\\r/g, "\r")
            .replace(/\\t/g, "\t")
            .replace(/\\\(/g, "(")
            .replace(/\\\)/g, ")")
            .replace(/\\([\\()])/g, "$1");
          combined += decoded;
        }
        if (combined.trim()) textContent.push(combined);
      }
    }
  }

  if (textContent.length === 0) {
    const readableText = raw
      .replace(/[\x00-\x1F\x7F-\x9F]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const bracketPairs: [string, string][] = [
      ["{", "}"],
      ["[", "]"],
    ];
    let cleaned = readableText;
    for (const [open, close] of bracketPairs) {
      let depth = 0;
      let result = "";
      for (const char of cleaned) {
        if (char === open) depth++;
        else if (char === close && depth > 0) depth--;
        else if (depth === 0) result += char;
      }
      cleaned = result;
    }

    const fontKeys: Record<string, string> = {};
    const fontMatches = cleaned.matchAll(/\/BaseFont\s+\/([^\s/]+)/g);
    for (const match of fontMatches) {
      fontKeys[match[1]] = "";
    }

    const textLines = cleaned
      .split(/[\r\n]+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 2 && /[a-zA-Z]/.test(l));

    return { text: textLines.join(" "), pages };
  }

  return { text: textContent.join(" "), pages };
}

async function extractTextFromDocx(base64Data: string): Promise<ExtractedText> {
  try {
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const decoder = new TextDecoder("utf-8");
    const content = decoder.decode(bytes);

    const paragraphRegex = /<w:p[\s\S]*?<\/w:p>/g;
    const textRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
    const paragraphs: string[] = [];

    let paragraphMatch;
    const paraRegex = new RegExp(paragraphRegex);
    while ((paragraphMatch = paraRegex.exec(content)) !== null) {
      const paraContent = paragraphMatch[0];
      let paraText = "";
      let textMatch;
      const textRe = new RegExp(textRegex);
      while ((textMatch = textRe.exec(paraContent)) !== null) {
        paraText += textMatch[1]
          .replace(/</g, "<")
          .replace(/>/g, ">")
          .replace(/&/g, "&")
          .replace(/&apos;/g, "'")
          .replace(/"/g, '"');
      }
      if (paraText.trim()) paragraphs.push(paraText);
    }

    return { text: paragraphs.join("\n"), pageCount: 1 };
  } catch (err) {
    return { text: "", error: `DOCX extraction failed: ${err.message}` };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { file, fileName, fileType } = await req.json();

    if (!file) {
      return new Response(JSON.stringify({ error: "No file data provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result: ExtractedText;

    if (fileType === "pdf") {
      result = await extractTextFromPdf(file);
    } else if (fileType === "docx") {
      result = await extractTextFromDocx(file);
    } else {
      return new Response(
        JSON.stringify({ error: `Unsupported file type: ${fileType}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (result.error) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ text: result.text, pageCount: result.pageCount }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
