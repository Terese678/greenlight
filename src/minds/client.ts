import { createMindsClient } from "@animocabrands/minds-client-lib";

const builderApiKey = process.env.MINDS_BUILDER_API_KEY;
const rawMindId = process.env.GREENLIGHT_MIND_ID;
const alias = process.env.GREENLIGHT_CONVERSATION_ALIAS ?? "main";

if (!builderApiKey) throw new Error("MINDS_BUILDER_API_KEY is not set.");
if (!rawMindId) throw new Error("GREENLIGHT_MIND_ID is not set.");

// Narrowed once here so every function below gets `string`, not
// `string | undefined`, without re-checking each time.
const mindId: string = rawMindId;

export const mindsClient = createMindsClient({ builderApiKey });

// Conversations need a bound alias before messaging; idempotent, so
// safe to call before every send instead of tracking state ourselves.
async function ensureConversation(): Promise<string> {
  await mindsClient.ensureConversation(alias, mindId);
  return alias;
}

// Used when we need Greenlight's actual response back (idea scoring,
// onboarding questions).
export async function askGreenlight(
  messageText: string,
  timeoutMs = 180_000
): Promise<string | null> {
  const conversationAlias = await ensureConversation();
  const before = await mindsClient.getLatestHistoryFingerprint(conversationAlias);

  await mindsClient.sendMessage({ alias: conversationAlias, messageText });

  const outcome = await mindsClient.waitForReply({
    alias: conversationAlias,
    timeoutMs,
    afterFingerprint: before,
    sentMessageText: messageText,
  });

  // Timeout isn't an error, Greenlight may just be slow; caller decides
  // how to handle a null reply.
  return outcome.timedOut ? null : outcome.reply.messageText ?? null;
}

// Fire-and-forget: used by the proactive follow-up trigger, where
// Greenlight replies to the creator directly, not to our backend.
export async function notifyGreenlight(messageText: string): Promise<void> {
  const conversationAlias = await ensureConversation();
  await mindsClient.sendMessage({ alias: conversationAlias, messageText });
}

// Checked before scheduled jobs run, so we fail with a clear message
// instead of a silent no-op when Cognition hits zero.
export async function getGreenlightCognitionBalance(): Promise<number> {
  const balance = await mindsClient.getCognitionBalance(mindId);
  return balance.cognition;
}