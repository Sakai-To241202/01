// Client-side script: fetches generated text from server endpoint /api/generate
// This file runs in the browser and MUST NOT import server-only modules.

// DOM要素の取得
const appArea = document.getElementById("app");
const promptForm = document.getElementById("prompt-form");
const promptInput = document.getElementById("prompt-input");

// 結果を表示する関数
function displayResponse(text, isError = false) {
  const div = document.createElement("div");
  div.className = isError ? "error-message" : "response-message";
  div.textContent = text;
  appArea.appendChild(div);
}

async function generateResponse(prompt) {
  appArea.innerHTML = "";
  displayResponse("Gemini API で応答を生成中です...");

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    appArea.innerHTML = "";

    if (!res.ok) {
      displayResponse(`サーバーエラー: ${data.error || res.statusText}`, true);
      return;
    }

    displayResponse("--- Gemini の応答 ---");
    displayResponse(data.text);
    displayResponse("-----------------------");
  } catch (err) {
    appArea.innerHTML = "";
    displayResponse(`通信エラー: ${err.message}`, true);
  }
}

// フォームの送信イベントを処理
promptForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const prompt = promptInput.value.trim();

  if (!prompt) {
    displayResponse("質問を入力してください", true);
    return;
  }

  await generateResponse(prompt);
});
