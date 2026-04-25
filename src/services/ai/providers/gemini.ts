import type { AIProvider, AIMessage, AIStreamingOptions, AIProviderConfig } from '../types';

export class GeminiProvider implements AIProvider {
  name = 'gemini';
  private apiKey: string;
  private baseURL: string;
  private model: string;
  private abortController: AbortController | null = null;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://generativelanguage.googleapis.com/v1beta/models';
    this.model = config.model || 'gemini-2.0-flash';
  }

  async chat(messages: AIMessage[]): Promise<string> {
    // Convert messages to Gemini format
    const contents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await fetch(`${this.baseURL}/${this.model}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) throw new Error(`Gemini error: ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  async streamChat(messages: AIMessage[], options: AIStreamingOptions): Promise<void> {
    this.abortController = new AbortController();

    try {
      const contents = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const response = await fetch(`${this.baseURL}/${this.model}:streamGenerateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
        signal: this.abortController.signal,
      });

      if (!response.ok) throw new Error(`Gemini error: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(5);
            try {
              const parsed = JSON.parse(data);
              const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (content) options.onChunk(content);
            } catch {}
          }
        }
      }
      options.onComplete?.('');
    } catch (error) {
      if ((error as any)?.name !== 'AbortError') {
        options.onError?.(error as Error);
      }
    }
  }

  abort(): void {
    this.abortController?.abort();
  }
}