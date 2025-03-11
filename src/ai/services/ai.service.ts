import Anthropic from '@anthropic-ai/sdk';
import { envConfig } from 'src/config/env-config';
import { MessageConfig } from '../interfaces/message-config';

export class AIService {
  private readonly model = 'claude-3-7-sonnet-20250219';
  private readonly aiClient = new Anthropic({
    apiKey: envConfig.ANTHROPIC_API_KEY,
  });

  async sendMessage({ systemInstructions, messages }: MessageConfig) {
    const completion = await this.aiClient.messages.create({
      model: this.model,
      max_tokens: 4000,
      system: systemInstructions,
      messages,
    });

    return completion;
  }
}
