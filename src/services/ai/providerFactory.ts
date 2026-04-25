import type { AIProvider, AIProviderConfig } from './types';
import { OpenAIProvider } from './providers/openai';
import { GeminiProvider } from './providers/gemini';
import { CustomProvider } from './providers/custom';

export class AIProviderFactory {
  private static instance: AIProvider | null = null;
  private static config: AIProviderConfig | null = null;

  static initialize(config: AIProviderConfig): void {
    this.config = config;

    switch (config.provider) {
      case 'openai':
        this.instance = new OpenAIProvider(config);
        break;
      case 'gemini':
        this.instance = new GeminiProvider(config);
        break;
      case 'custom':
        this.instance = new CustomProvider(config);
        break;
      default:
        throw new Error(`Unknown AI provider: ${config.provider}`);
    }
  }

  static getInstance(): AIProvider {
    if (!this.instance) {
      throw new Error('AIProviderFactory not initialized');
    }
    return this.instance;
  }

  static getConfig(): AIProviderConfig | null {
    return this.config;
  }
}