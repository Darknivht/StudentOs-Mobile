export type AIProviderType = 'openai' | 'gemini' | 'custom';

export interface AIProviderConfig {
  provider: AIProviderType;
  baseURL?: string;
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIStreamingOptions {
  onChunk: (chunk: string) => void;
  onError?: (error: Error) => void;
  onComplete?: (fullResponse: string) => void;
  signal?: AbortSignal;
}

export interface AIProvider {
  readonly name: string;
  chat(messages: AIMessage[]): Promise<string>;
  streamChat(messages: AIMessage[], options: AIStreamingOptions): Promise<void>;
  abort(): void;
}