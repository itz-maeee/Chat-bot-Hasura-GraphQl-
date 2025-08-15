// Messages.jsx
import { useSubscription } from "@apollo/client";
import { GET_MESSAGES } from "../queries";

export default function Messages({ chatId }) {
  const { data, loading, error } = useSubscription(GET_MESSAGES, {
    variables: { chatId },
    skip: !chatId,
  });

  if (!chatId) return <div>Select a chat…</div>;
  if (loading) return <div>Loading messages…</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
      {data?.messages?.map((m) => (
        <div key={m.id} style={{ marginBottom: "8px" }}>
          <strong>{m.sender}:</strong> {m.text}
        </div>
      ))}
    </div>
  );
}
