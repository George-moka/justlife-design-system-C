import { SYSTEM_PROMPT, buildUserMessage } from './catalog';

export type ScreenNode = { component: string; props?: Record<string, unknown> };
export type ScreenSpec = { title?: string; nodes: ScreenNode[] };

// Calls the /api/generate proxy (streaming SSE) and returns the parsed screen spec.
export async function generateScreen(prompt: string, currentSpec?: ScreenSpec): Promise<ScreenSpec> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      system: SYSTEM_PROMPT,
      max_tokens: 4000,
      messages: [{ role: 'user', content: buildUserMessage(prompt, currentSpec) }],
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Generation failed (${res.status}). Make sure the site is deployed with ANTHROPIC_API_KEY set. ${t.slice(0, 200)}`);
  }
  if (!res.body) throw new Error('No response stream.');

  // Read the SSE stream and accumulate text deltas from Anthropic's message stream.
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const evt = JSON.parse(payload);
        if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
          text += evt.delta.text;
        }
      } catch {
        // ignore non-JSON keep-alive lines
      }
    }
  }

  return parseSpec(text);
}

function parseSpec(raw: string): ScreenSpec {
  let s = raw.trim();
  // strip markdown fences if the model added them
  s = s.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();
  // grab the outermost JSON object
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start !== -1 && end !== -1) s = s.slice(start, end + 1);
  const parsed = JSON.parse(s);
  if (!parsed || !Array.isArray(parsed.nodes)) throw new Error('The model did not return a valid screen. Try again.');
  return parsed as ScreenSpec;
}
