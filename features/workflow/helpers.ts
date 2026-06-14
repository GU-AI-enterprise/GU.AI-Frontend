import type { ChatMessage, ConversationTurn } from "./types";

export function buildHistory(msgs: ChatMessage[]): ConversationTurn[] {
  const turns: ConversationTurn[] = [];
  for (const m of msgs) {
    if (m.kind === "user" && m.text) {
      turns.push({ role: "user", text: m.text });
    } else if (m.kind === "assistant" && m.text) {
      turns.push({ role: "assistant", text: m.text });
    } else if (m.kind === "plan" && m.plan) {
      turns.push({ role: "assistant", text: `Tôi đã lên kế hoạch: ${m.plan.goal}` });
    }
  }
  return turns;
}
