import { AIService } from 'src/ai/abstracts/ai.service';

export class MockAIService implements AIService {
  sendMessage = vi.fn();
}
