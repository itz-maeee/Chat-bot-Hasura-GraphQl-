// src/graphql/queries.js
import { gql } from '@apollo/client'

// List of chats
const GET_CHATS = `
  query {
    chats {
      id
      name
      created_at
    }
  }
`;

const GET_MESSAGES = `
  subscription($chatId: uuid!) {
    messages(where: {chat_id: {_eq: $chatId}}, order_by: {created_at: asc}) {
      id
      sender_id
      text
      created_at
    }
  }
`;

const INSERT_CHAT = `
  mutation($name: String!) {
    insert_chats_one(object: { name: $name }) {
      id
    }
  }
`;

const INSERT_MESSAGE = `
  mutation($chatId: uuid!, $text: String!) {
    insert_messages_one(object: { chat_id: $chatId, text: $text }) {
      id
    }
  }
`;
