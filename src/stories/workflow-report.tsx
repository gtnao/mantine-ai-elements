import { Button, Stack, Text } from '@mantine/core';
import { isToolUIPart, type UIMessage } from 'ai';
import { useEffect, useRef, useState } from 'react';
import { Artifact, ChainOfThought, Message, Source, Sources } from '../index';

export function WorkflowReport({
  message,
  complete,
  busy,
}: {
  message: UIMessage;
  complete: boolean;
  busy: boolean;
}) {
  const [opened, setOpened] = useState(true);
  const [notice, setNotice] = useState('');
  const mounted = useRef(true);
  const copying = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const tool = message.parts.find(isToolUIPart);
  const sources = message.parts.filter((part) => part.type === 'source-url');
  const content = message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');
  const available = tool?.state === 'output-available';
  const denied = tool?.state === 'output-denied';
  const ready = available && complete && content.length > 0;
  async function copy() {
    if (!ready || copying.current) return;
    copying.current = true;
    try {
      await navigator.clipboard.writeText(content);
      if (mounted.current) setNotice('Report copied.');
    } catch {
      if (mounted.current)
        setNotice('Copy failed. Select the report text to copy it manually.');
    } finally {
      copying.current = false;
    }
  }
  function download() {
    if (!ready) return;
    const url = URL.createObjectURL(
      new Blob([content], { type: 'text/markdown;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'team-notes-report.md';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    setNotice('Report downloaded.');
  }
  return (
    <Stack gap="xs">
      <ChainOfThought defaultOpened>
        <ChainOfThought.Header>Report progress</ChainOfThought.Header>
        <ChainOfThought.Content>
          <ChainOfThought.Step
            label={
              denied
                ? 'Lookup declined'
                : available
                  ? 'Notes retrieved'
                  : 'Awaiting lookup approval'
            }
            status={available || denied ? 'complete' : 'active'}
          />
          <ChainOfThought.Step
            label={
              ready
                ? 'Report ready'
                : denied
                  ? 'Report skipped'
                  : busy && available
                    ? 'Writing report'
                    : 'Report not complete'
            }
            status={
              ready || denied
                ? 'complete'
                : busy && available
                  ? 'active'
                  : 'pending'
            }
          />
        </ChainOfThought.Content>
      </ChainOfThought>
      {sources.length > 0 && (
        <Sources defaultOpened>
          <Sources.Trigger count={sources.length} />
          <Sources.Content>
            {sources.map((source) => (
              <Source
                key={source.sourceId}
                href={source.url}
                title={source.title}
              />
            ))}
          </Sources.Content>
        </Sources>
      )}
      {available &&
        (opened ? (
          <Artifact>
            <Artifact.Header>
              <div>
                <Artifact.Title>Team notes report</Artifact.Title>
                <Artifact.Description>
                  {ready ? 'Ready to export' : 'Draft — not ready to export'}
                </Artifact.Description>
              </div>
              <Artifact.Actions>
                <Artifact.Action
                  label="Copy report"
                  disabled={!ready}
                  onClick={() => void copy()}
                >
                  ⧉
                </Artifact.Action>
                <Artifact.Action
                  label="Download report"
                  disabled={!ready}
                  onClick={download}
                >
                  ↓
                </Artifact.Action>
                <Artifact.Close
                  label="Close report"
                  onClick={() => setOpened(false)}
                />
              </Artifact.Actions>
            </Artifact.Header>
            <Artifact.Content>
              <Message.Response>
                {content || 'Receiving the report…'}
              </Message.Response>
            </Artifact.Content>
          </Artifact>
        ) : (
          <Button variant="default" onClick={() => setOpened(true)}>
            Reopen report
          </Button>
        ))}
      {notice && (
        <Text role="status" size="sm">
          {notice}
        </Text>
      )}
    </Stack>
  );
}
