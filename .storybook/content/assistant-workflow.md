# Assistant workflow

The **Examples / Assistant workflow** Storybook example combines the input and tool components in one working chat. It uses real AI SDK useChat with a deterministic local transport and requires no model credentials.

1. Answer a Question to populate the shared PromptInput draft, or write a message directly.
2. Choose a model with ModelSelector and attach a file through the input menu.
3. Submit the draft. Conversation and Message show the sent text/files; Reasoning displays the streamed explanation.
4. Review the tool input and approve or reject its Confirmation. AI SDK automatically continues the same assistant message and displays the result.
5. Ask another question once the approval and generation have finished.

The application owns the model selection, request body, topic-to-draft conversion, and decision to disable new messages while approval is outstanding. Files remain in the draft while submission is pending, then their submitted snapshot is removed. The demo transport supplies fixed local lookup results; it does not read an actual database or invoke a selected model.

See [Question](./question.md), [PromptInput](./prompt-input.md), [ModelSelector](./model-selector.md), [Reasoning](./reasoning.md), [Tool](./tool.md), and [Confirmation](./confirmation.md) for the individual contracts and customization options.
