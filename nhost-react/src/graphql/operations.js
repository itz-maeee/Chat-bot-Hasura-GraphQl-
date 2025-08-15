import { gql } from '@apollo/client'


// Query: list user chats
export const GET_CHATS = gql`
query GetChats {
chats(order_by: { created_at: desc }) {
id
title
created_at
}
}
`


// Subscription: messages in a chat (real-time)
export const GET_MESSAGES = gql`
subscription GetMessages($chat_id: uuid!) {
messages(
where: { chat_id: { _eq: $chat_id } }
order_by: { created_at: asc }
) {
id
chat_id
text
sender
created_at
}
}
`


// Mutation: create new chat
export const INSERT_CHAT = gql`
mutation InsertChat($title: String!) {
insert_chats_one(object: { title: $title }) {
id
title
created_at
}
}
`


// Mutation: save a user message
export const INSERT_MESSAGE = gql`
mutation InsertMessage($chat_id: uuid!, $text: String!) {
insert_messages_one(
object: { chat_id: $chat_id, text: $text, sender: "user" }
) {
id
chat_id
text
sender
created_at
}
}
`