import Anthropic from '@anthropic-ai/sdk';
import { PromptMessage } from 'src/ai/interfaces/prompt-message';
import { AnthropicAIService } from 'src/ai/services/anthropic-ai.service';
import { Mock } from 'vitest';

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn(),
    },
  })),
}));

describe('AnthropicAIService', () => {
  let service: AnthropicAIService;
  let anthropic: Anthropic;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new AnthropicAIService();
    anthropic = (Anthropic as unknown as Mock).mock.results[0].value;
  });

  describe('sendMessage', () => {
    it('should send a message and return the response', async () => {
      const spyCreateMessage = vi
        .spyOn(anthropic.messages, 'create')
        .mockResolvedValue({
          content: [{ text: 'Assistant response' }],
        } as Anthropic.Message);
      const systemInstructions = 'System instructions';
      const messages: PromptMessage[] = [
        { role: 'user', content: 'Hello!' },
        { role: 'assistant', content: 'Hi!' },
      ];

      const expectedResponse = 'Assistant response';
      const response = await service.sendMessage({
        systemInstructions,
        messages,
      });

      expect(response).toEqual(expectedResponse);
      expect(spyCreateMessage).toHaveBeenCalledWith({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 4000,
        system: systemInstructions,
        messages,
      });
    });
  });
});
