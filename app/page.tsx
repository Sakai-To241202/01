"use client";

import { useState, FormEvent, useRef } from "react";
import styles from "./page.module.scss";

export default function Home() {
  // チャット履歴: role 2user|ai, text, isError可
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; text: string; isError?: boolean }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const addMessage = (msg: { role: "user" | "ai"; text: string; isError?: boolean }) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt) {
      addMessage({ role: "user", text: "", isError: true });
      addMessage({ role: "ai", text: "質問を入力してください", isError: true });
      return;
    }
    addMessage({ role: "user", text: prompt });
    setIsLoading(true);
    setInput("");
    // textareaRef.current?.focus();
    try {
      // Gemini APIにこれまでのmessages + 今回ユーザー入力を送信
      const userAndPrevMsgs = [...messages, { role: "user", text: prompt }];
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: userAndPrevMsgs }),
      });
      const data = await res.json();
      if (!res.ok) {
        addMessage({ role: "ai", text: `サーバーエラー: ${data.error || res.statusText}`, isError: true });
        return;
      }
      addMessage({ role: "ai", text: data.text });
    } catch (err) {
      addMessage({ role: "ai", text: `通信エラー: ${err instanceof Error ? err.message : String(err)}`, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.promptForm}>
        <textarea name="prompt" rows={4} ref={textareaRef} placeholder="Geminiに質問してください" className={styles.promptInput} value={input} onChange={(e) => setInput(e.target.value)} disabled={isLoading} />
        <button type="submit" disabled={isLoading || !input.trim()} className={styles.submitButton}>
          {isLoading ? "生成中..." : "送信"}
        </button>
      </form>
      <div className={styles.app}>
        {messages.map((m, idx) => (
          <div key={idx} className={m.isError ? styles.errorMessage : styles.responseMessage}>
            <span style={{ fontWeight: "bold" }}>{m.role === "user" ? "あなた: " : "Gemini: "}</span>
            {m.text}
          </div>
        ))}
      </div>
    </main>
  );
}
