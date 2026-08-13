// Streaming proxy to the Anthropic API. The API key never reaches the browser.
// GET  -> health check. POST { system, messages, max_tokens } -> streamed SSE.
export default async (req) => {
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ ok: true, version: 'stream-v1', streaming: true }),
      { headers: { 'content-type': 'application/json' } },
    );
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid JSON body' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest',
      max_tokens: body.max_tokens || 4000,
      stream: true,
      system: body.system,
      messages: body.messages,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const txt = await upstream.text().catch(() => '');
    return new Response(JSON.stringify({ error: 'upstream error', detail: txt.slice(0, 500) }), {
      status: upstream.status || 502,
      headers: { 'content-type': 'application/json' },
    });
  }

  // Pipe the SSE stream straight back to the browser.
  return new Response(upstream.body, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache',
    },
  });
};
