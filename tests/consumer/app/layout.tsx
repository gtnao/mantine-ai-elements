import '@mantine/core/styles.layer.css';
import 'mantine-ai-elements/styles.layer.css';
import './globals.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:," />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  );
}
