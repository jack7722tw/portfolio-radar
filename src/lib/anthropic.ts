import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

export async function analyzeWithClaude(
  prompt: string,
  model: 'haiku' | 'sonnet' = 'haiku'
): Promise<string> {
  const modelId = model === 'haiku'
    ? 'claude-haiku-4-5-20251001'
    : 'claude-sonnet-4-20250514';

  const message = await getClient().messages.create({
    model: modelId,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const block = message.content[0];
  if (block.type !== 'text') throw new Error('Unexpected response type');
  return block.text;
}

export function parseJsonResponse<T>(text: string): T {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}
