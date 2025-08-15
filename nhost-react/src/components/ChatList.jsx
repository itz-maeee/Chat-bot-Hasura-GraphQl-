// ChatList.jsx
import { useEffect, useState } from "react";
import { nhost } from "../lib/nhost";
import { GET_CHATS, INSERT_CHAT } from "../queries";
import { useAuthenticationStatus } from "@nhost/react";

export default function ChatList({ onSelect }) {
  const { isAuthenticated } = useAuthenticationStatus();
  const [title, setTitle] = useState("");
  const [chats, setChats] = useState([]);

  const fetchChats = async () => {
    if (!isAuthenticated) return;
    const { data, error } = await nhost.graphql.request(GET_CHATS);
    if (!error) setChats(data.chats || []);
  };

  const createChat = async () => {
    if (!title.trim()) return;
    await nhost.graphql.request(INSERT_CHAT, { title });
    setTitle("");
    fetchChats();
  };

  useEffect(() => {
    fetchChats();
  }, [isAuthenticated]);

  return (
    <div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New chat title"
      />
      <button onClick={createChat}>New Chat</button>

      <ul>
        {chats.map((c) => (
          <li key={c.id}>
            <button onClick={() => onSelect(c.id)}>{c.title}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
