'use client';
import { Button, Stack, Text } from '@mantine/core';
import type { UIMessage } from 'ai';
import { Conversation } from 'mantine-ai-elements';
import { useState } from 'react';
export default function ConversationDemo() {
  const [count, setCount] = useState(30);
  const messages: UIMessage[] = Array.from({ length: count }, (_, index) => ({
    id: String(index),
    role: 'assistant',
    parts: [{ type: 'text', text: `History message ${index + 1}` }],
  }));
  return (
    <Stack mt="xl">
      <Button onClick={() => setCount((value) => value + 1)}>
        Append history
      </Button>
      <Conversation
        h={240}
        aria-label="History"
        classNames={{ viewport: 'history-viewport' }}
        styles={{ content: { gap: 20 } }}
      >
        <Conversation.Content>
          {messages.map((message) => (
            <Text key={message.id}>
              {message.parts
                .map((part) => (part.type === 'text' ? part.text : ''))
                .join('')}
            </Text>
          ))}
        </Conversation.Content>
        <Conversation.ScrollButton />
        <Conversation.Download messages={messages} filename="history.md" />
      </Conversation>
    </Stack>
  );
}
