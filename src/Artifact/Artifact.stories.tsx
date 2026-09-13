import { createTheme, MantineProvider } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Artifact, ArtifactAction, ArtifactHeader } from '../index';
import { ArtifactObjectExample } from '../stories/artifact-object';

const meta = { title: 'Artifact', component: Artifact } satisfies Meta<
  typeof Artifact
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {
  render: () => (
    <Artifact>
      <Artifact.Header>
        <div>
          <Artifact.Title>Implementation report</Artifact.Title>
          <Artifact.Description>
            Generated content supplied by the application.
          </Artifact.Description>
        </div>
        <Artifact.Actions>
          <Artifact.Action
            component="a"
            href="https://mantine.dev"
            tooltip="Open reference"
          >
            ↗
          </Artifact.Action>
        </Artifact.Actions>
      </Artifact.Header>
      <Artifact.Content>
        Compose documents, code blocks, images, or other output inside the
        content area.
      </Artifact.Content>
    </Artifact>
  ),
};
export const Themed: Story = {
  render: () => (
    <MantineProvider
      theme={createTheme({
        components: {
          Artifact: Artifact.extend({
            defaultProps: { radius: 'xl' },
            styles: { root: { borderColor: 'var(--mantine-color-grape-5)' } },
          }),
          ArtifactHeader: ArtifactHeader.extend({
            defaultProps: { gap: 'lg' },
          }),
          ArtifactAction: ArtifactAction.extend({
            defaultProps: { color: 'grape', variant: 'light' },
            styles: { icon: { fontWeight: 700 } },
          }),
        },
      })}
    >
      <Artifact>
        <Artifact.Header>
          <div>
            <Artifact.Title component="h2">
              A detailed implementation report with a long title that wraps on a
              narrow screen
            </Artifact.Title>
            <Artifact.Description>
              Native Mantine theme defaults and independent component styles.
            </Artifact.Description>
          </div>
          <Artifact.Actions>
            <Artifact.Action
              tooltip="Open Mantine documentation"
              component="a"
              href="https://mantine.dev"
            >
              ↗
            </Artifact.Action>
            <Artifact.Close disabled />
          </Artifact.Actions>
        </Artifact.Header>
        <Artifact.Content
          mah={180}
          tabIndex={0}
          role="region"
          aria-label="Scrollable report"
        >
          {Array.from({ length: 12 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Fixed static paragraphs never reorder.
            <p key={`paragraph-${i}`}>
              Report section {i + 1}: verify accessible interaction and clear
              application-owned actions.
            </p>
          ))}
        </Artifact.Content>
      </Artifact>
    </MantineProvider>
  ),
};
export const WithUseObject: Story = { render: () => <ArtifactObjectExample /> };
