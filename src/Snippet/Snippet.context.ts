import { createContext, type RefObject, useContext } from 'react';
export const SnippetContext = createContext<{
  code: string;
  input: RefObject<HTMLInputElement | null> | undefined;
  disabled: boolean;
}>({ code: '', input: undefined, disabled: false });
export const useSnippet = () => useContext(SnippetContext);
