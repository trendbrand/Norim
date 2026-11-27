/**
 * Real-AI layer for the Compliance Copilot. When ANTHROPIC_API_KEY is set, the
 * copilot answers with Claude, strictly grounded in a context pack built from the
 * caller's own live workspace data + EN 16931 rules (RAG). With no key, the caller
 * falls back to the deterministic engine, so the product works either way.
 */

const SYSTEM_PROMPT = [
  "You are NormInvoice's EU e-invoicing compliance copilot.",
  "Answer ONLY using the CONTEXT provided — it contains the user's own live workspace data and the relevant EN 16931 / country rules.",
  "If the context does not contain the answer, say so plainly and point the user to the right page instead of guessing.",
  "Never invent invoice numbers, amounts, dates, or rule text. Be concise and cite the specific rule IDs or figures you used.",
  "You are software, not a lawyer or tax advisor: when discussing regulations, add a short 'This is not legal or tax advice' note.",
].join(" ");

export interface AiCopilotResult {
  answer: string;
  provider: "claude";
  model: string;
}

/** Returns a Claude-generated answer, or null to signal "fall back to deterministic". */
export async function answerWithClaude(question: string, context: string): Promise<AiCopilotResult | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const model = process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 700,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: `CONTEXT:\n${context}\n\nQUESTION: ${question}` }],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    const text = (data.content || [])
      .filter((b) => b.type === "text" && b.text)
      .map((b) => b.text)
      .join("\n")
      .trim();
    return text ? { answer: text, provider: "claude", model } : null;
  } catch {
    return null;
  }
}

/** True when a real AI backend is configured (for UI badges / disclosures). */
export function isRealAiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
