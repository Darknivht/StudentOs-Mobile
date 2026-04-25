import type { AIProvider, AIMessage, AIStreamingOptions, AIProviderConfig } from '../types';

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private apiKey: string;
  private baseURL: string;
  private model: string;
  private abortController: AbortController | null = null;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://api.openai.com/v1';
    this.model = config.model || 'gpt-4o-mini';
  }

  async chat(messages: AIMessage[]): Promise<string> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: this.model, messages }),
    });

    if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  async streamChat(messages: AIMessage[], options: AIStreamingOptions): Promise<void> {
    this.abortController = new AbortController();

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream: true,
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);

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
            if (data === '[DONE]') {
              options.onComplete?.('');
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) options.onChunk(content);
            } catch {}
          }
        }
      }
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