import { AIProviderFactory } from "../ai/providerFactory";
import type { AIMessage } from "../ai/types";

export interface SocraticMessage {
  role: "user" | "assistant";
  content: string;
}

const SOCRATIC_SYSTEM_PROMPT = `You are a Socratic tutor. Your role is to help the student understand their note by asking leading questions rather than giving direct answers.

Guidelines:
- Ask one question at a time
- Build on the student's previous answers
- Guide them toward the correct understanding
- If they're stuck, give a small hint then ask another question
- Relate questions back to the note content
- Be encouraging but challenge their thinking
- Keep responses concise (2-4 sentences max)

The student is studying this note. Help them understand it through guided questioning.`;

export async function sendSocraticMessage(
  noteContent: string,
  noteTitle: string,
  chatHistory: SocraticMessage[],
  onChunk: (chunk: string) => void,
  onError?: (error: Error) => void,
  onComplete?: (fullResponse: string) => void,
): Promise<void> {
  const noteContext = `Note Title: ${noteTitle}\n\nNote Content:\n${noteContent.replace(/<[^>]*>/g, "")}`;

  const messages: AIMessage[] = [
    { role: "system" as any, content: SOCRATIC_SYSTEM_PROMPT },
    {
      role: "user",
      content: `Here is the note I'm studying:\n\n${noteContext}\n\nStart by asking me a question about the key concepts.`,
    },
    ...chatHistory.map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    })),
  ];

  if (chatHistory.length === 0) {
    // First message — AI initiates with a question
  }

  try {
    const provider = AIProviderFactory.getInstance();
    await provider.streamChat(
      messages.filter((m) => m.role !== ("system" as any)),
      {
        onChunk,
        onError: onError || (() => {}),
        onComplete: onComplete || (() => {}),
      },
    );
  } catch (err) {
    onError?.(err as Error);
  }
}
