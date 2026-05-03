import { AIProviderFactory } from "../ai/providerFactory";
import type { AIMessage } from "../ai/types";

export interface SocraticMessage {
  role: "user" | "assistant";
  content: string;
}

const SOCRATIC_INSTRUCTIONS = `You are a Socratic tutor. Your role is to help the student understand their note by asking leading questions rather than giving direct answers.

Guidelines:
- Ask one question at a time
- Build on the student's previous answers
- Guide them toward the correct understanding
- If they're stuck, give a small hint then ask another question
- Relate questions back to the note content
- Be encouraging but challenge their thinking
- Keep responses concise (2-4 sentences max)

When the student shares their answer, ask a follow-up question that deepens their understanding.`;

export async function sendSocraticMessage(
  noteContent: string,
  noteTitle: string,
  chatHistory: SocraticMessage[],
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

  const noteContext = `Note Title: ${noteTitle}\n\nNote Content:\n${noteContent.replace(/<[^>]*>/g, "")}`;

  const messages: AIMessage[] = [
    {
      role: "user",
      content: `${SOCRATIC_INSTRUCTIONS}\n\nHere is the note I'm studying:\n\n${noteContext}\n\nStart by asking me a question about the key concepts.`,
    },
    ...chatHistory.map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    })),
  ];

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
