import { MantineProvider } from '@mantine/core';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type AttachmentsContext,
  PromptInput,
  type PromptInputProps,
  PromptInputProvider,
  type ReferencedSourcesContext,
  usePromptInputAttachments,
  usePromptInputReferencedSources,
  useProviderAttachments,
} from '../index';

let attachments: AttachmentsContext;
let sources: ReferencedSourcesContext;
function State() {
  attachments = usePromptInputAttachments();
  sources = usePromptInputReferencedSources();
  return (
    <output>{attachments.files.map((file) => file.filename).join(',')}</output>
  );
}
function Input(props: Partial<PromptInputProps>) {
  return (
    <PromptInput onSubmit={() => {}} {...props}>
      <State />
      <PromptInput.Textarea aria-label="Message" />
      <PromptInput.Submit />
    </PromptInput>
  );
}
function mount(children: ReactNode) {
  return render(
    <StrictMode>
      <MantineProvider>{children}</MantineProvider>
    </StrictMode>,
  );
}
const file = (name = 'note.txt', value = 'hello', type = 'text/plain') =>
  new File([value], name, { type });
const createUrl = vi.fn();
const revokeUrl = vi.fn();
beforeEach(() => {
  let id = 0;
  createUrl.mockReset().mockImplementation(() => `blob:attachment-${++id}`);
  revokeUrl.mockReset();
  vi.stubGlobal(
    'URL',
    Object.assign(URL, {
      createObjectURL: createUrl,
      revokeObjectURL: revokeUrl,
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());

describe('PromptInput attachments', () => {
  it('sends attachment-only data URLs without ids, clears successful snapshots, and reclaims URLs once', async () => {
    const onSubmit = vi.fn();
    const view = mount(<Input onSubmit={onSubmit} />);
    await userEvent.upload(screen.getByLabelText('Upload files'), file());
    expect(createUrl).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][0]).toEqual({
      text: '',
      files: [
        {
          type: 'file',
          filename: 'note.txt',
          mediaType: 'text/plain',
          url: 'data:text/plain;base64,aGVsbG8=',
        },
      ],
    });
    expect(attachments.files).toHaveLength(0);
    view.unmount();
    expect(revokeUrl).toHaveBeenCalledExactlyOnceWith('blob:attachment-1');
  });

  it('retains rejected attachments and removes only the files and sources included in a successful submission', async () => {
    const error = new Error('Retry');
    let finish!: () => void;
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(error)
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      );
    const onSubmitError = vi.fn();
    mount(<Input onSubmit={onSubmit} onSubmitError={onSubmitError} />);
    act(() => {
      attachments.add([file()]);
      sources.add({
        type: 'source-document',
        sourceId: 'first',
        title: 'First',
        mediaType: 'text/plain',
      });
    });
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(onSubmitError).toHaveBeenCalledWith(error));
    expect(attachments.files).toHaveLength(1);
    expect(sources.sources).toHaveLength(1);
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    act(() => {
      attachments.add([file('next.txt')]);
      sources.add({
        type: 'source-document',
        sourceId: 'next',
        title: 'Next',
        mediaType: 'text/plain',
      });
    });
    fireEvent.input(screen.getByRole('textbox'), {
      target: { value: 'Next draft' },
    });
    await act(async () => finish());
    expect(attachments.files.map((entry) => entry.filename)).toEqual([
      'next.txt',
    ]);
    expect(sources.sources.map((entry) => entry.sourceId)).toEqual(['next']);
    expect(screen.getByRole('textbox')).toHaveValue('Next draft');
    expect(revokeUrl).toHaveBeenCalledExactlyOnceWith('blob:attachment-1');
  });

  it.each([false, true])(
    'validates batched adds, MIME/extension and zero limits with provider=%s',
    (provider) => {
      const onAttachmentError = vi.fn();
      const input = (
        <Input
          accept="image/*, .PDF"
          maxFiles={2}
          maxFileSize={5}
          onAttachmentError={onAttachmentError}
        />
      );
      const view = mount(
        provider ? <PromptInputProvider>{input}</PromptInputProvider> : input,
      );
      act(() => {
        attachments.add([
          file('bad.txt'),
          file('large.png', '123456', 'image/png'),
          file('scan.PDF', 'pdf', ''),
        ]);
        attachments.add([
          file('image.png', 'png', 'image/png'),
          file('overflow.pdf'),
        ]);
      });
      expect(attachments.files.map((entry) => entry.filename)).toEqual([
        'scan.PDF',
        'image.png',
      ]);
      expect(onAttachmentError.mock.calls.map(([error]) => error.code)).toEqual(
        ['accept', 'max_file_size', 'max_files'],
      );
      expect(attachments.files[0].mediaType).toBe('application/octet-stream');
      expect(createUrl).toHaveBeenCalledTimes(2);
      view.unmount();
      expect(revokeUrl).toHaveBeenCalledTimes(2);
      mount(
        <Input
          maxFiles={0}
          maxFileSize={0}
          onAttachmentError={onAttachmentError}
        />,
      );
      act(() => attachments.add([file(), file('empty', '', '')]));
      expect(attachments.files).toHaveLength(0);
      expect(
        onAttachmentError.mock.calls.slice(-2).map(([error]) => error.code),
      ).toEqual(['max_file_size', 'max_files']);
    },
  );

  it('pastes and drops files once, respects event cancellation, and removes the last file with Backspace', () => {
    const view = mount(<Input globalDrop />);
    const input = screen.getByRole('textbox');
    fireEvent.paste(input, {
      clipboardData: {
        items: [{ kind: 'file', getAsFile: () => file('paste.txt') }],
      },
    });
    fireEvent.drop(input.closest('form') as HTMLFormElement, {
      dataTransfer: { types: ['Files'], files: [file('drop.txt')] },
    });
    expect(attachments.files).toHaveLength(2);
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(attachments.files.map((entry) => entry.filename)).toEqual([
      'paste.txt',
    ]);
    fireEvent.drop(document, {
      dataTransfer: { types: ['Files'], files: [file('global.txt')] },
    });
    expect(attachments.files).toHaveLength(2);
    view.unmount();
    fireEvent.drop(document, {
      dataTransfer: { types: ['Files'], files: [file('after.txt')] },
    });
    expect(createUrl).toHaveBeenCalledTimes(3);
    mount(<Input onDrop={(event) => event.preventDefault()} />);
    fireEvent.drop(
      screen.getByRole('textbox').closest('form') as HTMLFormElement,
      {
        dataTransfer: { types: ['Files'], files: [file()] },
      },
    );
    expect(attachments.files).toHaveLength(0);
  });

  it('retains provider files when the form unmounts, unregisters its picker, and preserves newer provider text', async () => {
    let providerAttachments!: AttachmentsContext;
    let finish!: () => void;
    function Outside() {
      providerAttachments = useProviderAttachments();
      return null;
    }
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const tree = (show: boolean) => (
      <StrictMode>
        <MantineProvider>
          <PromptInputProvider initialInput="First">
            <Outside />
            {show && <Input onSubmit={onSubmit} />}
          </PromptInputProvider>
        </MantineProvider>
      </StrictMode>
    );
    const view = render(tree(true));
    act(() => providerAttachments.add([file()]));
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Next' },
    });
    act(() => attachments.add([file('next.txt')]));
    await act(async () => finish());
    expect(screen.getByRole('textbox')).toHaveValue('Next');
    const oldInput = providerAttachments.fileInputRef
      .current as HTMLInputElement;
    const click = vi.spyOn(oldInput, 'click');
    view.rerender(tree(false));
    expect(providerAttachments.files).toHaveLength(1);
    expect(providerAttachments.fileInputRef.current).toBeNull();
    providerAttachments.openFileDialog();
    expect(click).not.toHaveBeenCalled();
    expect(revokeUrl).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(revokeUrl).toHaveBeenCalledTimes(2);
  });

  it('converts a captured File even when its preview is removed during conversion, and reports read failures', async () => {
    const onSubmit = vi.fn();
    const onSubmitError = vi.fn();
    mount(<Input onSubmit={onSubmit} onSubmitError={onSubmitError} />);
    act(() => attachments.add([file()]));
    fireEvent.submit(
      screen.getByRole('textbox').closest('form') as HTMLFormElement,
    );
    act(() => attachments.clear());
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][0].files[0].url).toBe(
      'data:text/plain;base64,aGVsbG8=',
    );
    const read = vi
      .spyOn(FileReader.prototype, 'readAsDataURL')
      .mockImplementation(function (this: FileReader) {
        this.dispatchEvent(new ProgressEvent('error'));
      });
    act(() => attachments.add([file('retry.txt')]));
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(onSubmitError).toHaveBeenCalledOnce());
    expect(attachments.files).toHaveLength(1);
    expect(onSubmit).toHaveBeenCalledOnce();
    read.mockRestore();
  });
});
