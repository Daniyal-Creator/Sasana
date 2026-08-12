"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ChatBubble, SasanaAvatar } from "@/components/assistant/ChatBubble";
import { QuickChips } from "@/components/assistant/QuickChips";
import { ErrorFallback } from "@/components/ui/ErrorFallback";
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
    <div className="mx-auto flex w-full max-w-tool flex-1 flex-col px-4 sm:px-6">
      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center animate-fadeUp">
          <SasanaAvatar size="lg" />
          <h1 className="mt-4 font-display text-h2 font-semibold text-text">
            {t(lang, "assistant.welcome.title")}
          </h1>
          <p className="mt-2 max-w-prose text-base text-text-secondary">{t(lang, "assistant.welcome.body")}</p>
          <p className="mb-3 mt-8 text-sm font-medium text-text-secondary">{t(lang, "assistant.tryasking")}</p>
          <QuickChips chips={chips} onPick={send} disabled={sending} />
        </div>
      ) : (
        <ul role="log" aria-live="polite" aria-relevant="additions" className="flex-1 space-y-3 py-6">
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
      )}
      <div ref={bottomRef} />

      <div className="sticky bottom-0 border-t border-border bg-bg py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t(lang, "assistant.input.placeholder")}
            aria-label={t(lang, "assistant.input.placeholder")}
            className="h-11 flex-1 rounded-md border border-border-strong bg-surface px-4 text-base text-text placeholder:text-text-muted focus-visible:shadow-focus"
          />
          <Button
            type="submit"
            icon={Send}
            disabled={!input.trim() || sending}
            aria-label={t(lang, "assistant.send")}
          />
        </form>
        <p className="mt-2 text-xs text-text-muted">{t(lang, "assistant.helper")}</p>
      </div>
    </div>
  );
}
