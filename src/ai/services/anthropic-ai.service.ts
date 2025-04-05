import Anthropic from '@anthropic-ai/sdk';
import { envConfig } from 'src/app/config/env-config';
import { AIMessageConfig } from 'src/ai/interfaces/ai-message-config';
import { AIService } from 'src/ai/abstracts/ai.service';

export class AnthropicAIService implements AIService {
  private readonly model = 'claude-3-7-sonnet-20250219';
  private readonly aiClient = new Anthropic({
    apiKey: envConfig.ANTHROPIC_API_KEY,
  });

  async sendMessage({ systemInstructions, messages }: AIMessageConfig) {
    const completion = await this.aiClient.messages.create({
      model: this.model,
      max_tokens: 4000,
      system: systemInstructions,
      messages,
    });

    return (completion.content[0] as { text: string }).text;
  }
}
