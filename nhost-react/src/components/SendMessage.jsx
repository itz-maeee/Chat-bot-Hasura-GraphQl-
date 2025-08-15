// SendMessage.jsx
import { useState } from "react";
import { nhost } from "../lib/nhost";
import { SEND_MESSAGE_ACTION } from "../queries"; // Hasura Action that calls n8n

export default function SendMessage({ chatId }) {
  const [text, setText] = useState("");

  const send = async () => {
    if (!text.trim() || !chatId) return;

    await nhost.graphql.request(SEND_MESSAGE_ACTION, {
      chatId,
      text,
    });

    setText("");
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message"
        onKeyDown={(e) => e.key === "Enter" && send()}
      />
      <button onClick={send} disabled={!chatId}>
        Send
      </button>
    </div>
  );
}
