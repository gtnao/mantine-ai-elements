import { createContext, useContext } from 'react';
import {
  defaultTranslations,
  type PluginConfig,
  type StreamdownTranslations,
} from 'streamdown';
export const ResponseContext = createContext<{
  plugins: PluginConfig;
  translations: StreamdownTranslations;
}>({ plugins: {}, translations: defaultTranslations });
export const useResponse = () => useContext(ResponseContext);
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  try {
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
  } finally {
    anchor.remove();
    URL.revokeObjectURL(url);
  }
}
