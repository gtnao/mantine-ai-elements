'use client';

import type { FileUIPart, SourceDocumentUIPart } from 'ai';
import {
  createContext,
  type PropsWithChildren,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

export type PromptInputAttachment = FileUIPart & { id: string };
export interface AttachmentsContext {
  files: PromptInputAttachment[];
  add: (files: File[] | FileList) => void;
  remove: (id: string) => void;
  clear: () => void;
  openFileDialog: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
}
export interface TextInputContext {
  value: string;
  setInput: (value: string) => void;
  clear: () => void;
}
export interface PromptInputControllerProps {
  textInput: TextInputContext;
  attachments: AttachmentsContext;
}
export interface ReferencedSourcesContext {
  sources: (SourceDocumentUIPart & { id: string })[];
  add: (sources: SourceDocumentUIPart | SourceDocumentUIPart[]) => void;
  remove: (id: string) => void;
  clear: () => void;
}
export interface PromptInputAttachmentError {
  code: 'accept' | 'max_file_size' | 'max_files';
  message: string;
}
export interface PromptInputAttachmentConstraints {
  accept?: string;
  maxFiles?: number;
  maxFileSize?: number;
  onAttachmentError?: (error: PromptInputAttachmentError) => void;
}

export function validateFiles(
  incoming: File[] | FileList,
  count: number,
  constraints: PromptInputAttachmentConstraints,
) {
  const { accept, maxFiles, maxFileSize, onAttachmentError } = constraints;
  const patterns =
    accept
      ?.toLowerCase()
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean) ?? [];
  const files = Array.from(incoming);
  const accepted = files.filter(
    (file) =>
      !patterns.length ||
      patterns.some((pattern) => {
        if (pattern.startsWith('.'))
          return file.name.toLowerCase().endsWith(pattern);
        if (pattern.endsWith('/*'))
          return file.type.toLowerCase().startsWith(pattern.slice(0, -1));
        return file.type.toLowerCase() === pattern;
      }),
  );
  if (accepted.length < files.length)
    onAttachmentError?.({
      code: 'accept',
      message: 'Some files do not match the accepted types.',
    });
  const sized = accepted.filter(
    (file) => maxFileSize === undefined || file.size <= maxFileSize,
  );
  if (sized.length < accepted.length)
    onAttachmentError?.({
      code: 'max_file_size',
      message: 'Some files exceed the maximum size.',
    });
  const capacity =
    maxFiles === undefined
      ? sized.length
      : Math.max(0, Math.floor(maxFiles) - count);
  if (sized.length > capacity)
    onAttachmentError?.({
      code: 'max_files',
      message: 'Too many files. Some were not added.',
    });
  return sized.slice(0, capacity);
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('Unable to read attachment'));
    reader.onerror = () =>
      reject(reader.error ?? new Error('Unable to read attachment'));
    reader.onabort = () =>
      reject(new Error('Attachment reading was cancelled'));
    reader.readAsDataURL(file);
  });
}

/** Object URLs are owned by this store, never by render or state updater callbacks. */
export function useAttachmentStore() {
  const [files, setFiles] = useState<PromptInputAttachment[]>([]);
  const current = useRef<PromptInputAttachment[]>([]);
  const raw = useRef(new Map<string, File>());
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      for (const file of current.current) URL.revokeObjectURL(file.url);
      current.current = [];
      raw.current.clear();
    };
  }, []);
  const add = useCallback((incoming: File[] | FileList) => {
    if (!mounted.current) return;
    const created: PromptInputAttachment[] = [];
    try {
      for (const file of Array.from(incoming)) {
        const id = crypto.randomUUID();
        const url = URL.createObjectURL(file);
        created.push({
          id,
          type: 'file',
          filename: file.name,
          mediaType: file.type || 'application/octet-stream',
          url,
        });
        raw.current.set(id, file);
      }
    } catch (error) {
      for (const file of created) {
        URL.revokeObjectURL(file.url);
        raw.current.delete(file.id);
      }
      throw error;
    }
    if (!created.length) return;
    current.current = [...current.current, ...created];
    setFiles(current.current);
  }, []);
  const removeMany = useCallback((ids: Set<string>) => {
    if (!mounted.current) return;
    current.current = current.current.filter((file) => {
      if (!ids.has(file.id)) return true;
      URL.revokeObjectURL(file.url);
      raw.current.delete(file.id);
      return false;
    });
    setFiles(current.current);
  }, []);
  const remove = useCallback(
    (id: string) => removeMany(new Set([id])),
    [removeMany],
  );
  const clear = useCallback(
    () => removeMany(new Set(current.current.map((file) => file.id))),
    [removeMany],
  );
  const snapshot = useCallback(() => {
    const entries = current.current.map(({ id, ...part }) => ({
      id,
      part,
      file: raw.current.get(id),
    }));
    return {
      ids: new Set(entries.map(({ id }) => id)),
      convert: () =>
        Promise.all(
          entries.map(async ({ part, file }) => {
            if (!file) throw new Error('Attachment is no longer available');
            return { ...part, url: await readFile(file) };
          }),
        ),
    };
  }, []);
  return { files, current, add, remove, removeMany, clear, snapshot };
}

type AttachmentStore = ReturnType<typeof useAttachmentStore>;
interface InternalController extends PromptInputControllerProps {
  store: AttachmentStore;
  textRef: RefObject<{ value: string; revision: number }>;
  register: (input: HTMLInputElement) => () => void;
}
export const PromptInputControllerContext =
  createContext<InternalController | null>(null);
export const LocalAttachmentsContext = createContext<AttachmentsContext | null>(
  null,
);
export const LocalReferencedSourcesContext =
  createContext<ReferencedSourcesContext | null>(null);
export function usePromptInputController(): PromptInputControllerProps {
  const context = useContext(PromptInputControllerContext);
  if (!context)
    throw new Error('usePromptInputController requires a PromptInputProvider');
  return context;
}
export function useProviderAttachments(): AttachmentsContext {
  return usePromptInputController().attachments;
}
export function usePromptInputAttachments(): AttachmentsContext {
  const local = useContext(LocalAttachmentsContext);
  const provider = useContext(PromptInputControllerContext);
  const context = local ?? provider?.attachments;
  if (!context)
    throw new Error(
      'usePromptInputAttachments requires a PromptInput or PromptInputProvider',
    );
  return context;
}
export function usePromptInputReferencedSources(): ReferencedSourcesContext {
  const context = useContext(LocalReferencedSourcesContext);
  if (!context)
    throw new Error('usePromptInputReferencedSources requires a PromptInput');
  return context;
}
export type PromptInputProviderProps = PropsWithChildren<{
  initialInput?: string;
}>;
export function PromptInputProvider({
  initialInput = '',
  children,
}: PromptInputProviderProps) {
  const [value, setValue] = useState(initialInput);
  const textRef = useRef({ value: initialInput, revision: 0 });
  const setInput = useCallback((next: string) => {
    textRef.current = { value: next, revision: textRef.current.revision + 1 };
    setValue(next);
  }, []);
  const clear = useCallback(() => setInput(''), [setInput]);
  const store = useAttachmentStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const register = useCallback((input: HTMLInputElement) => {
    fileInputRef.current = input;
    return () => {
      if (fileInputRef.current === input) fileInputRef.current = null;
    };
  }, []);
  const openFileDialog = useCallback(() => fileInputRef.current?.click(), []);
  return (
    <PromptInputControllerContext.Provider
      value={{
        textInput: { value, setInput, clear },
        attachments: {
          files: store.files,
          add: store.add,
          remove: store.remove,
          clear: store.clear,
          fileInputRef,
          openFileDialog,
        },
        store,
        textRef,
        register,
      }}
    >
      {children}
    </PromptInputControllerContext.Provider>
  );
}

export function useReferencedSources() {
  const [sources, setSources] = useState<ReferencedSourcesContext['sources']>(
    [],
  );
  const current = useRef(sources);
  const removeMany = (ids: Set<string>) => {
    current.current = current.current.filter((source) => !ids.has(source.id));
    setSources(current.current);
  };
  const context: ReferencedSourcesContext = {
    sources,
    add: (incoming) => {
      current.current = [
        ...current.current,
        ...(Array.isArray(incoming) ? incoming : [incoming]).map((source) => ({
          ...source,
          id: crypto.randomUUID(),
        })),
      ];
      setSources(current.current);
    },
    remove: (id) => removeMany(new Set([id])),
    clear: () =>
      removeMany(new Set(current.current.map((source) => source.id))),
  };
  return { context, current, removeMany };
}
