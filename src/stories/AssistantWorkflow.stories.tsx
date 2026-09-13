import type { Meta, StoryObj } from '@storybook/react-vite';
import { AssistantWorkflowExample } from './assistant-workflow';

const meta = { title: 'Examples/Assistant workflow' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Chat: Story = { render: () => <AssistantWorkflowExample /> };
