import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config.js";

const client = new Anthropic({ apiKey: config.anthropicApiKey });

const SYSTEM = `You are the Justlife design-system prototyping assistant, chatting with a product manager in Slack about a prototype you can build on the "{SCREEN}" screen. Be warm, brief, and plain-spoken.

Every incoming message is one of two things — decide which:

• A QUESTION or discussion — the PM wants an answer, an opinion, or options, NOT a build yet. Examples: "what background colours can the disclaimer have?", "which is more on-brand?", "what do you think?", "how would I highlight it?", "is amber too loud?". → Answer it helpfully in 1-4 short sentences. Talk in terms of the design system's existing roles (neutral / tone-on-tone, brand gold, semantic warning-amber, success-green, error-red, raised-white vs recessed surfaces) — NEVER invent token names; the builder uses the real tokens. When your answer points to a concrete change, end by offering to apply it, e.g.: _Want me to make it amber? Just say "make the disclaimer amber."_

• A BUILD request — a concrete change to make now. Examples: "add an Earliest Slot card", "make it smaller", "use the amber background", "move it under the address". → Don't answer; this gets built.

Respond by calling the \`respond\` tool.`;

export interface Triage {
  mode: "answer" | "build";
  reply?: string;
}

/** Decide whether a PM message is a question to answer or a change to build. */
export async function triage(
  userText: string,
  screenName: string,
  hasProposal: boolean,
  model?: string,
): Promise<Triage> {
  try {
    const msg = await client.messages.create({
      model: model ?? config.agentModel,
      max_tokens: 600,
      system: SYSTEM.replace("{SCREEN}", screenName),
      tools: [
        {
          name: "respond",
          description: "Reply to the product manager.",
          input_schema: {
            type: "object",
            properties: {
              mode: {
                type: "string",
                enum: ["answer", "build"],
                description: "'answer' = a question/discussion to reply to in text; 'build' = a concrete change to build.",
              },
              reply: {
                type: "string",
                description: "When mode='answer', the helpful reply to send (Slack mrkdwn). Omit when mode='build'.",
              },
            },
            required: ["mode"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "respond" },
      messages: [
        {
          role: "user",
          content: `${hasProposal ? "(A prototype for this screen already exists.) " : ""}Message from the PM: "${userText}"`,
        },
      ],
    });

    const block = msg.content.find((b) => b.type === "tool_use");
    if (block && block.type === "tool_use") {
      const input = block.input as { mode?: string; reply?: string };
      if (input.mode === "answer") {
        return {
          mode: "answer",
          reply: input.reply?.trim() || "Happy to help — what would you like to know or change?",
        };
      }
      return { mode: "build" };
    }
  } catch (e) {
    console.error("[triage] failed, defaulting to build:", e instanceof Error ? e.message : e);
  }
  // Safe fallback: behave like before (treat it as a build request).
  return { mode: "build" };
}
