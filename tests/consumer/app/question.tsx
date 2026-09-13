'use client';
import { Stack, Text } from '@mantine/core';
import {
  Question,
  QuestionInput,
  type QuestionResponse,
} from 'mantine-ai-elements';
import { useState } from 'react';
export default function QuestionExample() {
  const [response, setResponse] = useState<QuestionResponse>();
  return (
    <Stack data-testid="question">
      <Question onSubmit={setResponse} styles={{ root: { borderRadius: 19 } }}>
        <Question.Prompt>Choose a feature</Question.Prompt>
        <Question.Options aria-label="Features">
          <Question.Option value="search">Search</Question.Option>
          <Question.Option value="disabled" disabled>
            Unavailable
          </Question.Option>
          <Question.Option value="export">Export</Question.Option>
        </Question.Options>
        <QuestionInput aria-label="Details" />
        <Question.Actions>
          <Question.Submit>Answer</Question.Submit>
        </Question.Actions>
      </Question>
      <Text role="status">{response && JSON.stringify(response)}</Text>
    </Stack>
  );
}
