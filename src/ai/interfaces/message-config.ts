export interface MessageConfig {
  systemInstructions: string;
  messages: {
    role: 'user' | 'assistant';
    content: string;
  }[];
}
