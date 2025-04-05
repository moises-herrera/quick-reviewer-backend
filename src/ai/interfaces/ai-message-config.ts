import { PromptMessage } from './prompt-message';

export interface AIMessageConfig {
  systemInstructions: string;
  messages: PromptMessage[];
}
