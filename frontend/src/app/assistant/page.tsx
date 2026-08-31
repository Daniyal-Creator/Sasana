"use client";

import { useEffect, useRef, useState } from "react";
import { Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ChatBubble, SasanaAvatar } from "@/components/assistant/ChatBubble";
import { QuickChips } from "@/components/assistant/QuickChips";
import { ErrorFallback } from "@/components/ui/ErrorFallback";
import { DecorativeBackground } from "@/components/assistant/DecorativeBackground";
import { ChatLayout } from "@/components/assistant/ChatLayout";
import { GuideSidebar } from "@/components/assistant/GuideSidebar";
import { TopicExplorer } from "@/components/assistant/TopicExplorer";
import { SuggestedQuestions } from "@/components/assistant/SuggestedQuestions";
import { MobileTopicChips } from "@/components/assistant/MobileTopicChips";
import { useLang } from "@/lib/language";
import { apiUrl } from "@/lib/api";
import { t } from "@/lib/i18n";
import type { ChatMessage, ChatResponse } from "@shared/contract";

export default function AssistantPage() {
  const { lang } = useLang();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const chips = [
    t(lang, "assistant.chip.shorts"),
    t(lang, "assistant.chip.drone"),
    t(lang, "assistant.chip.canang"),
    t(lang, "assistant.chip.photo"),
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending, failed]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || sending) return;
    setFailed(null);
    setInput("");
    const history = messages;
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setSending(true);
    try {
      const res = await fetch(apiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          lang,
          history: history.map(({ role, content }) => ({ role, content })),
        }),
      });
      if (!res.ok) throw new Error("chat request failed");
      const data = (await res.json()) as ChatResponse;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, source: data.source, grounded: data.grounded },
      ]);
    } catch {
      setFailed(question);
    } finally {
      setSending(false);
    }
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
              <SuggestedQuestions onSelect={send} disabled={sending} />
            </div>

            {/* Quick chips fallback — visible only if topic cards above aren't enough */}
            <div className="mt-6 hidden">
              <QuickChips chips={chips} onPick={send} disabled={sending} />
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
                  source={message.source}
                  grounded={message.grounded}
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
