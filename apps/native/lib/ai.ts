import { supabase } from "../services/supabase";
import { env } from "./env";

const CHAT_URL = `${env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-study`;
const AI_TIMEOUT_MS = 30_000;

type Message = { role: "user" | "assistant"; content: string };

export type AIMode =
  | "summarize"
  | "eli5"
  | "socratic"
  | "quiz"
  | "flashcards"
  | "fill_blanks"
  | "mnemonic"
  | "cheatsheet"
  | "debate"
  | "concept_map"
  | "essay_grade"
  | "plagiarism"
  | "citation"
  | "bibliography"
  | "research"
  | "research_full"
  | "thesis"
  | "chat"
  | "math_solver"
  | "ocr_latex"
  | "diagram_interpreter"
  | "code_debugger"
  | "translator"
  | "youtube_summary"
  | "book_scanner"
  | "transcribe_audio"
  | "job_search"
  | "quick_answer";

interface StreamChatOptions {
  messages: Message[];
  mode?: AIMode;
  content?: string;
  imageBase64?: string;
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

async function getAuthToken(): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) return data.session.access_token;
  } catch {}
  return env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
}

export async function streamAIChat({
  messages,
  mode = "chat",
  content,
  imageBase64,
  onDelta,
  onDone,
  onError,
}: StreamChatOptions) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const token = await getAuthToken();
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ messages, mode, content, imageBase64 }),
      signal: controller.signal,
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      onError(
        errorData.error || `Request failed with status ${resp.status}`
      );
      return;
    }
    if (!resp.body) {
      onError("No response body received");
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      clearTimeout(timeout);
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }
        try {
          const parsed = JSON.parse(jsonStr);
          const c = parsed.choices?.[0]?.delta?.content as
            | string
            | undefined;
          if (c) onDelta(c);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    onDone();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      onError("Request timed out. Please try again.");
    } else {
      onError(
        error instanceof Error
          ? error.message
          : "Connection failed. Check your internet and try again."
      );
    }
  } finally {
    clearTimeout(timeout);
  }
}

export async function callAI(
  mode: AIMode,
  content: string,
  imageBase64?: string
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const token = await getAuthToken();
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ messages: [], mode, content, imageBase64 }),
      signal: controller.signal,
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || "Request failed");
    }

    const reader = resp.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let result = "";
    let textBuffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      clearTimeout(timeout);
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const c = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (c) result += c;
        } catch {}
      }
    }

    return result;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw new Error("Request timed out. Please try again.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function formatAIResponse(content: string): string {
  if (!content) return "";
  let formatted = content;
  formatted = formatted.replace(/\n{3,}/g, "\n\n");
  formatted = formatted.replace(/^(#+)([^\s#])/gm, "$1 $2");
  formatted = formatted.replace(/^[•●○◦]\s*/gm, "- ");
  formatted = formatted.replace(/([^\n])(#{1,6}\s)/g, "$1\n\n$2");
  formatted = formatted.replace(/[ \t]+$/gm, "");
  return formatted;
}
