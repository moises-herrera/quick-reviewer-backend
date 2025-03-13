export interface PromptConfig {
  systemInstructions: string;
  messages: PromptMessage[];
}

export interface PromptMessage {
  role: 'user' | 'assistant';
  content: string;
}
