"use client";

import { useEffect, useRef, useState } from "react";
import { Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ChatBubble, SasanaAvatar } from "@/components/assistant/ChatBubble";
import { ChipRow } from "@/components/ui/ChipRow";
import { ErrorFallback } from "@/components/ui/ErrorFallback";
import { DecorativeBackground } from "@/components/assistant/DecorativeBackground";
import { ChatLayout } from "@/components/assistant/ChatLayout";
import { GuideSidebar } from "@/components/assistant/GuideSidebar";
import { TopicExplorer } from "@/components/assistant/TopicExplorer";
import { SuggestedQuestions } from "@/components/assistant/SuggestedQuestions";
import { MobileTopicChips } from "@/components/assistant/MobileTopicChips";
import { useLang } from "@/lib/language";
import { useAssistant } from "@/lib/assistant-context";
import { apiUrl } from "@/lib/api";
import { readActiveSite, siteContextNamed, writeActiveSite } from "@/lib/site-context";
import { SiteContextCard } from "@/components/assistant/SiteContextCard";
import type { Proximity, SiteContext } from "@shared/contract";
import { freshProximity, PROXIMITY_TTL_MS, type TimedProximity } from "@/lib/assistant-handoff";
import { followUpChips } from "@/lib/follow-up";
import { t } from "@/lib/i18n";
import type { ChatMessage, ChatResponse } from "@shared/contract";

interface UIMessage extends ChatMessage {
  imageUrl?: string | null;
}

export default function AssistantPage() {
  const { lang } = useLang();
  const { consumeHandoffPayload } = useAssistant();
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const handoffCheckedRef = useRef(false);
  /**
   * Where the visitor stood when they left Explore, with the moment it was
   * measured. Never written to storage from here: it arrived through a payload
   * that is read once and cleared, and it expires on its own timestamp.
   */
  const carriedProximity = useRef<TimedProximity | null>(null);
  /**
   * The same two things again, for the screen rather than for the request.
   *
   * `carriedProximity` stays the authority on what gets sent - `send` reads it
   * through `freshProximity` on every call - and these only decide what is
   * drawn. They are separate because the ref must not trigger a render and the
   * card must, and because the card has to be able to disappear on a timer
   * without the sending path depending on that timer having fired.
   */
  const [contextSite, setContextSite] = useState<SiteContext | null>(null);
  const [contextFix, setContextFix] = useState<Proximity | null>(null);
  /**
   * Follow-up chips this visitor has already tapped, by copy key.
   *
   * Offering a shortcut to a question somebody has had answered is not a
   * shortcut, and the rule-derived chips cannot catch this on their own: a
   * general-tier answer cites no Rule, so nothing about the reply records that
   * the question was asked.
   */
  const [usedChips, setUsedChips] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending, failed]);

  /**
   * `standalone` sends the question with no history behind it.
   *
   * Only follow-up chips set it, and the reason is the whole point of them.
   * `chat.ts` caches first-turn questions and nothing else, because a cached
   * answer keyed on a question alone could land in a conversation it was never
   * about. A chip is written to survive that: it names its own subject, so the
   * history it gives up was carrying nothing it needed. What the visitor sees
   * is untouched - the conversation above stays on screen, and their next typed
   * message carries all of it again.
   */
  async function send(
    text: string,
    opts?: { imageUrl?: string | null; apiMessage?: string; standalone?: boolean },
  ) {
    const question = text.trim();
    if (!question || sending) return;
    setFailed(null);
    setInput("");
    const history = messages;
    setMessages((prev) => [...prev, { role: "user", content: question, imageUrl: opts?.imageUrl ?? null }]);
    setSending(true);
    try {
      const res = await fetch(apiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // If an enriched message with Vision context was provided, send that
          // to the API instead. The user's bubble still shows the original text.
          message: opts?.apiMessage ?? question,
          // The visitor's own words, sent alongside an enriched `message` so
          // the server can tell the two apart. A photo-check follow-up's
          // `message` is mostly the check's own English prose; answering in
          // the language of that prose rather than of this question is
          // exactly the bug this field exists to avoid.
          ...(opts?.apiMessage ? { question } : {}),
          lang,
          history: opts?.standalone ? [] : history.map(({ role, content }) => ({ role, content })),
          // Read per send, not once on mount: a visitor can pick a different
          // Site in another tab, and the answer must follow where they are now.
          // Where the visitor is wins over the Site they merely named, because
          // "here" has to mean here. Omitted entirely when neither applies.
          ...(() => {
            const site = readActiveSite() ?? siteContextNamed(question);
            if (!site) return {};
            // A position with no place attached is a number with nothing to be
            // a distance from, so it only travels when the Site does. And it is
            // re-checked on every send rather than once on arrival: a visitor
            // can sit on this page, and a fix that was true when they crossed
            // the Approach is not evidence of where they are ten minutes later.
            const fix = freshProximity(carriedProximity.current);
            return fix ? { site, proximity: fix } : { site };
          })(),
        }),
      });
      if (!res.ok) throw new Error("chat request failed");
      const data = (await res.json()) as ChatResponse;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          source: data.source,
          kind: data.kind,
          ruleIds: data.ruleIds,
          amenities: data.amenities,
        },
      ]);
    } catch {
      setFailed(question);
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    if (handoffCheckedRef.current) return;
    handoffCheckedRef.current = true;

    const payload = consumeHandoffPayload();
    if (!payload) return;

    // Kept before the question is looked at, because the two arrive together
    // but are not the same errand: Explore's "ask about this place" button
    // carries a position and no question at all, and reading it only on the
    // question's branch would throw the position away for exactly the visitor
    // it was measured for. Held in a ref rather than state: nothing renders
    // from it, and `send` needs the current value without waiting for a
    // re-render.
    carriedProximity.current = payload.proximity ?? null;
    setContextFix(freshProximity(payload.proximity));

    if (payload.question) {
      // Build an enriched message that includes the Vision analysis context
      // so the LLM can answer follow-up questions about the photo result,
      // without re-sending the actual image (no extra image token cost).
      let apiMessage = payload.question;
      const ctx = payload.contextResult;
      if (ctx) {
        const contextBlock = [
          `[Photo analysis context — status: ${ctx.status}`,
          ctx.reason ? `reason: "${ctx.reason}"` : "",
          ctx.suggestion ? `suggestion: "${ctx.suggestion}"` : "",
          ctx.reference ? `reference: ${ctx.reference}` : "",
        ]
          .filter(Boolean)
          .join("; ");
        apiMessage = `${contextBlock}]\n\nFollow-up question: ${payload.question}`;
      }

      send(payload.question, {
        imageUrl: payload.imageUrl ?? null,
        apiMessage,
      });
    }
  }, [consumeHandoffPayload]);

  /**
   * The Site the visitor is carrying, read once for the screen.
   *
   * `send` still reads it again per message, and deliberately: somebody can
   * pick a different Site in another tab, and the answer has to follow where
   * they are now. This one only decides what the card says on arrival, which is
   * a different job with a different failure - a card that lags by one
   * navigation costs nothing, an answer that lags by one is about the wrong
   * temple.
   */
  useEffect(() => {
    setContextSite(readActiveSite());
  }, []);

  /**
   * Drops the distance from the card at the same instant `send` stops sending
   * it. Scheduled off the fix's own timestamp rather than off a fresh two
   * minutes, so the card and the request cannot disagree about whether the
   * visitor is still where they were.
   */
  useEffect(() => {
    const carried = carriedProximity.current;
    if (!contextFix || !carried) return;
    const remaining = carried.at + PROXIMITY_TTL_MS - Date.now();
    if (remaining <= 0) {
      setContextFix(null);
      return;
    }
    const timer = setTimeout(() => setContextFix(null), remaining);
    return () => clearTimeout(timer);
  }, [contextFix]);

  /**
   * Lets go of the place, everywhere at once.
   *
   * The stored Site goes too, not just the card. `send` reads storage on every
   * message, so clearing only what is drawn would leave the Site riding along
   * on every question with nothing on screen admitting it - a card whose close
   * button hides the evidence rather than changing the behaviour.
   */
  function clearContext() {
    writeActiveSite(null);
    carriedProximity.current = null;
    setContextSite(null);
    setContextFix(null);
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <DecorativeBackground />

      {/* Mobile topic chips — below header, above chat */}
      <div className="relative z-[1] px-4 pt-3 sm:px-6 lg:hidden">
        <MobileTopicChips onSelect={send} disabled={sending} />
      </div>

      <ChatLayout sidebar={<GuideSidebar onTopicSelect={send} disabled={sending} />}>
        {/* Above the fork on purpose: the screen a visitor lands on from
            Explore is the empty one, and that is the screen that used to say
            nothing about where they had come from. It sits in the same place
            once the conversation starts, so the answer's context does not
            vanish the moment it starts mattering. */}
        {contextSite && (
          <div className="pt-4">
            <SiteContextCard site={contextSite} proximity={contextFix} onClear={clearContext} />
          </div>
        )}

        {isEmpty ? (
          /* ── Welcome state ── */
          <div className="flex flex-1 flex-col py-8 lg:py-12">
            {/* Hero */}
            <div className="flex flex-col items-center text-center animate-fadeUp">
              {/* Eyebrow */}
              <p className="mb-4 text-xs font-medium uppercase tracking-widest text-accent-strong">
                {t(lang, "assistant.eyebrow")}
              </p>
              <SasanaAvatar size="lg" />
              <h1 className="mt-5 font-display text-h2 font-semibold text-text">
                {t(lang, "assistant.welcome.title")}
              </h1>
              <p className="mt-2 max-w-prose text-base text-text-secondary">
                {t(lang, "assistant.welcome.body")}
              </p>
              {/* Trust indicator */}
              <p className="mt-3 flex items-center gap-1.5 text-sm text-text-secondary">
                <ShieldCheck size={16} strokeWidth={1.75} className="text-accent-strong" aria-hidden />
                {t(lang, "assistant.trust")}
              </p>
            </div>

            {/* Topic explorer */}
            <div className="mt-10">
              <TopicExplorer onSelect={send} disabled={sending} />
            </div>

            {/* Suggested questions */}
            <div className="mt-8">
              <SuggestedQuestions onSelect={send} disabled={sending} site={contextSite} />
            </div>
          </div>
        ) : (
          /* ── Conversation state ── */
          <div className="flex min-h-0 flex-1 flex-col">
            {/* Compact chat header */}
            <div className="border-b border-border py-4">
              <h1 className="font-display text-lg font-semibold text-text">
                {t(lang, "assistant.chatheader.title")}
              </h1>
              <p className="text-xs text-text-muted">
                {t(lang, "assistant.chatheader.subtitle")}
              </p>
            </div>

            {/* Message list */}
            <ul
              role="log"
              aria-live="polite"
              aria-relevant="additions"
              className="flex-1 space-y-3 overflow-y-auto py-6"
            >
              {messages.map((message, i) => (
                <ChatBubble
                  key={i}
                  role={message.role}
                  content={message.content}
                  imageUrl={message.imageUrl}
                  source={message.source}
                  kind={message.kind}
                  amenities={message.amenities}
                  isFirstOfTurn={message.role === "user" || messages[i - 1]?.role !== "assistant"}
                />
              ))}
              {sending && (
                <li className="flex items-end gap-2 animate-msgIn">
                  <SasanaAvatar />
                  <div className="rounded-lg rounded-bl-sm border border-border bg-surface px-4 py-3">
                    <LoadingSpinner variant="dots" label={t(lang, "assistant.typing")} />
                  </div>
                </li>
              )}
              {failed && (
                <li className="max-w-[85%] md:max-w-[75%]">
                  <ErrorFallback compact message={t(lang, "assistant.error")} onRetry={() => send(failed)} />
                </li>
              )}
            </ul>
            <div ref={bottomRef} />
          </div>
        )}

        {/* ── Floating composer ── */}
        <div className="sticky bottom-0 rounded-xl bg-bg py-4">
          {/* Hidden while an answer is on its way. The chips belong to the
              message above them, and that message is about to be replaced. */}
          {!sending && (
            <ChipRow
              label={t(lang, "assistant.followup.group")}
              chips={followUpChips(messages, usedChips).map((chip) => ({
                id: chip.id,
                label: t(lang, chip.short),
                question: t(lang, chip.question),
              }))}
              onPick={(chip) => {
                setUsedChips((prev) => new Set(prev).add(chip.id));
                // The whole question, not the two words on the chip. It is what
                // the bubble shows and what the server is asked, and with no
                // history behind it there is nothing else to say what it means.
                send(chip.question, { standalone: true });
              }}
            />
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 rounded-xl border border-border bg-surface px-3 py-2 shadow-md"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t(lang, "assistant.input.placeholder.long")}
              aria-label={t(lang, "assistant.input.placeholder.long")}
              className="h-12 flex-1 bg-transparent px-2 text-base text-text placeholder:text-text-muted focus:outline-none"
            />
            <Button
              type="submit"
              icon={Send}
              disabled={!input.trim() || sending}
              aria-label={t(lang, "assistant.send")}
            />
          </form>
          <p className="mt-2 text-center text-xs text-text-muted">{t(lang, "assistant.helper")}</p>
        </div>
      </ChatLayout>
    </div>
  );
}
