import { injectable } from 'inversify';
import { AIMessageConfig } from 'src/core/interfaces/ai-message-config';

@injectable()
export abstract class AIService {
  abstract sendMessage(config: AIMessageConfig): Promise<string>;
}
