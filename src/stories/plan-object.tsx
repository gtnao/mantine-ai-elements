import { useObject } from '@ai-sdk/react';
import { Alert, Button, Group, List, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Plan } from '../index';
import { fetchPlan, type PlanDocument, planSchema } from './plan-stream';
export function PlanObjectExample() {
  const [validated, setValidated] = useState<PlanDocument>();
  const [validationError, setValidationError] = useState<string>();
  const [notice, setNotice] = useState('Generate a plan to review.');
  const { object, submit, isLoading, error, stop } = useObject({
    api: '/demo/plan',
    schema: planSchema,
    fetch: fetchPlan,
    onFinish: ({ object, error }) => {
      setValidated(object);
      setValidationError(error?.message);
      setNotice(error ? 'Plan validation failed.' : 'Plan ready for review.');
    },
  });
  useEffect(() => () => stop(), [stop]);
  function generate(fail = false) {
    setValidated(undefined);
    setValidationError(undefined);
    setNotice('Generating plan…');
    submit({ fail });
  }
  return (
    <Stack maw={640}>
      <Group>
        <Button disabled={isLoading} onClick={() => generate()}>
          Generate plan
        </Button>
        <Button
          variant="default"
          disabled={isLoading}
          onClick={() => generate(true)}
        >
          Simulate failure
        </Button>
        {isLoading && (
          <Button
            variant="default"
            onClick={() => {
              stop();
              setNotice('Stopped. Review the partial plan or generate again.');
            }}
          >
            Stop plan
          </Button>
        )}
      </Group>
      {(error || validationError) && (
        <Alert color="red" title="Unable to generate plan">
          {error?.message ?? validationError}
        </Alert>
      )}
      <Plan defaultOpened isStreaming={isLoading}>
        <Plan.Header>
          <div>
            <Plan.Title>{object?.title || 'Your execution plan'}</Plan.Title>
            <Plan.Description>
              {object?.description || 'Generated steps will appear here.'}
            </Plan.Description>
          </div>
          <Plan.Trigger />
        </Plan.Header>
        <Plan.Content>
          <List spacing="xs" size="sm">
            {object?.steps?.map((step, index) => (
              // This fixed-order streaming array only appends text and steps; position is stable while a step grows.
              // biome-ignore lint/suspicious/noArrayIndexKey: SDK partial string steps have no IDs and their order is fixed in this demo.
              <List.Item key={index}>{step || 'Receiving step…'}</List.Item>
            ))}
          </List>
        </Plan.Content>
        <Plan.Footer justify="flex-end">
          <Plan.Action>
            <Button
              disabled={!validated || isLoading}
              onClick={() => setNotice(`Selected plan: ${validated?.title}`)}
            >
              Use this plan
            </Button>
          </Plan.Action>
        </Plan.Footer>
      </Plan>
      <Text role="status">{error ? 'Plan request failed.' : notice}</Text>
      <Text size="xs" c="dimmed">
        Selecting a validated plan updates this demo only. Execution and
        persistence belong to the application.
      </Text>
    </Stack>
  );
}
