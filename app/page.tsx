"use client";

import { useState, FormEvent } from "react";
import styles from "./page.module.scss";

export default function Home() {
  const [responses, setResponses] = useState<Array<{ text: string; isError: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const displayResponse = (text: string, isError = false) => {
    setResponses((prev) => [...prev, { text, isError }]);
  };

  const clearResponses = () => {
    setResponses([]);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const prompt = formData.get("prompt")?.toString().trim();

    if (!prompt) {
      displayResponse("質問を入力してください", true);
      return;
    }

    clearResponses();
    setIsLoading(true);
    displayResponse("Gemini API で応答を生成中です...");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      clearResponses();

      if (!res.ok) {
        displayResponse(`サーバーエラー: ${data.error || res.statusText}`, true);
        return;
      }

      displayResponse("--- Gemini の応答 ---");
      displayResponse(data.text);
      displayResponse("-----------------------");
    } catch (err) {
      clearResponses();
      displayResponse(`通信エラー: ${err instanceof Error ? err.message : String(err)}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.promptForm}>
        <textarea name="prompt" rows={4} placeholder="Geminiに質問してください" className={styles.promptInput} />
        <button type="submit" disabled={isLoading} className={styles.submitButton}>
          {isLoading ? "生成中..." : "送信"}
        </button>
      </form>
      <div className={styles.app}>
        {responses.map((response, index) => (
          <div key={index} className={response.isError ? styles.errorMessage : styles.responseMessage}>
            {response.text}
          </div>
        ))}
      </div>
    </main>
  );
}
