import { useObject } from '@ai-sdk/react';
import { Alert, Button, Group, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Task } from '../index';
import { fetchTaskReport, taskReportSchema } from './task-stream';
export function ObjectTasks() {
  const [notice, setNotice] = useState('Choose a report to generate.');
  const [validationError, setValidationError] = useState<string>();
  const { object, submit, isLoading, error, stop, clear } = useObject({
    api: '/demo/tasks',
    schema: taskReportSchema,
    fetch: fetchTaskReport,
    onFinish: ({ error }) => {
      setValidationError(error?.message);
      setNotice(error ? 'Report validation failed.' : 'Report complete.');
    },
  });
  useEffect(() => () => stop(), [stop]);
  function generate(mode: string) {
    setValidationError(undefined);
    setNotice('Receiving task details…');
    submit({ mode });
  }
  return (
    <Stack maw={640}>
      <Group>
        <Button disabled={isLoading} onClick={() => generate('success')}>
          Generate tasks
        </Button>
        <Button
          disabled={isLoading}
          variant="default"
          onClick={() => generate('error')}
        >
          Simulate error
        </Button>
        <Button
          disabled={isLoading}
          variant="default"
          onClick={() => generate('invalid')}
        >
          Invalid report
        </Button>
        {isLoading && (
          <Button
            variant="default"
            onClick={() => {
              stop();
              setNotice('Stopped. Partial task details are retained.');
            }}
          >
            Stop report
          </Button>
        )}
        <Button
          variant="subtle"
          onClick={() => {
            clear();
            setValidationError(undefined);
            setNotice('Report cleared.');
          }}
        >
          Clear
        </Button>
      </Group>
      {(error || validationError) && (
        <Alert color="red" title="Unable to complete report">
          {error?.message ?? validationError}
        </Alert>
      )}
      <Text role="status">{error ? 'Request failed. Try again.' : notice}</Text>
      {object?.tasks
        ?.filter((task) => task?.id)
        .map(
          (task) =>
            task && (
              <Task key={task.id}>
                <Task.Trigger title={task.title || 'Receiving task title…'} />
                <Task.Content>
                  {task.items
                    ?.filter((item) => item?.id)
                    .map(
                      (item) =>
                        item && (
                          <Task.Item key={item.id}>
                            {item.text || 'Receiving details…'}
                            {item.filename && (
                              <>
                                {' '}
                                <Task.ItemFile component="span">
                                  {item.filename}
                                </Task.ItemFile>
                              </>
                            )}
                          </Task.Item>
                        ),
                    )}
                </Task.Content>
              </Task>
            ),
        )}
    </Stack>
  );
}
