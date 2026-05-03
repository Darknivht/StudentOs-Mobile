import { AIProviderFactory } from "../ai/providerFactory";
import type { AIMessage } from "../ai/types";

export type SummaryLength = "short" | "medium" | "long";

const SUMMARY_PROMPTS: Record<SummaryLength, string> = {
  short:
    "Provide a concise 2-3 sentence summary of the following note. Focus only on the key takeaway.",
  medium:
    "Provide a 1-paragraph summary of the following note (5-8 sentences). Cover the main points and supporting details.",
  long: "Provide a comprehensive summary of the following note (10-15 sentences). Include all key points, supporting arguments, examples, and conclusions.",
};

export async function generateNoteSummary(
  noteContent: string,
  noteTitle: string,
  length: SummaryLength = "medium",
  onChunk: (chunk: string) => void,
  onError?: (error: Error) => void,
  onComplete?: (fullResponse: string) => void,
): Promise<void> {
  let provider;
  try {
    provider = AIProviderFactory.getInstance();
  } catch {
    onError?.(
      new Error(
        "AI provider not configured. Set EXPO_PUBLIC_AI_API_KEY in your .env file.",
      ),
    );
    return;
  }

  const systemPrompt = `You are an AI study assistant. ${SUMMARY_PROMPTS[length]}

Note Title: ${noteTitle}

Note Content:
${noteContent.replace(/<[^>]*>/g, "")}

Summary:`;

  const messages: AIMessage[] = [{ role: "user", content: systemPrompt }];

  try {
    await provider.streamChat(messages, {
      onChunk,
      onError: onError || (() => {}),
      onComplete: onComplete || (() => {}),
    });
  } catch (err) {
    onError?.(err as Error);
  }
}
