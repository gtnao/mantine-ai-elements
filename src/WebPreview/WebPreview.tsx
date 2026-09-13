'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  type ElementProps,
  type Factory,
  factory,
  Paper,
  type PaperCssVariables,
  type PaperProps,
  useProps,
  useStyles,
} from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';
import { createContext, useContext } from 'react';
import classes from './WebPreview.module.css';
import { WebPreviewBody } from './WebPreviewBody';
import { WebPreviewConsole } from './WebPreviewConsole';
import { WebPreviewNavigation } from './WebPreviewNavigation';
import { WebPreviewNavigationButton } from './WebPreviewNavigationButton';
import { WebPreviewUrl } from './WebPreviewUrl';
export interface WebPreviewContextValue {
  url: string;
  setUrl: (url: string) => void;
  consoleOpen: boolean;
  setConsoleOpen: (opened: boolean) => void;
}
const Context = createContext<WebPreviewContextValue | null>(null);
export function useWebPreview() {
  const context = useContext(Context);
  if (!context)
    throw new Error('WebPreview components must be used within a WebPreview');
  return context;
}
export interface WebPreviewProps
  extends PaperProps,
    ElementProps<'div', keyof PaperProps> {
  url?: string;
  defaultUrl?: string;
  onUrlChange?: (url: string) => void;
  consoleOpened?: boolean;
  defaultConsoleOpened?: boolean;
  onConsoleOpenedChange?: (opened: boolean) => void;
}
export type WebPreviewFactory = Factory<{
  props: WebPreviewProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
  vars: PaperCssVariables;
  staticComponents: {
    Navigation: typeof WebPreviewNavigation;
    NavigationButton: typeof WebPreviewNavigationButton;
    Url: typeof WebPreviewUrl;
    Body: typeof WebPreviewBody;
    Console: typeof WebPreviewConsole;
  };
}>;
export const WebPreview = factory<WebPreviewFactory>(({ ref, ..._props }) => {
  const props = useProps(
    'WebPreview',
    { withBorder: true, radius: 'lg' },
    _props,
  );
  const {
    url: controlledUrl,
    defaultUrl,
    onUrlChange,
    consoleOpened,
    defaultConsoleOpened,
    onConsoleOpenedChange,
    children,
    className,
    style,
    classNames,
    styles,
    vars,
    attributes,
    unstyled,
    ...others
  } = props;
  const [url, setUrl] = useUncontrolled({
    value: controlledUrl,
    defaultValue: defaultUrl,
    finalValue: '',
    onChange: onUrlChange,
  });
  const [consoleOpen, setConsoleOpen] = useUncontrolled({
    value: consoleOpened,
    defaultValue: defaultConsoleOpened,
    finalValue: false,
    onChange: onConsoleOpenedChange,
  });
  const getStyles = useStyles<WebPreviewFactory>({
    name: 'WebPreview',
    props,
    classes,
    className,
    style,
    classNames,
    styles,
    vars,
    attributes,
    unstyled,
  });
  return (
    <Context.Provider value={{ url, setUrl, consoleOpen, setConsoleOpen }}>
      <Paper {...others} {...getStyles('root')} ref={ref} unstyled={unstyled}>
        {children}
      </Paper>
    </Context.Provider>
  );
});
WebPreview.displayName = 'WebPreview';
WebPreview.classes = { root: classes.root };

WebPreview.Navigation = WebPreviewNavigation;
WebPreview.NavigationButton = WebPreviewNavigationButton;
WebPreview.Url = WebPreviewUrl;
WebPreview.Body = WebPreviewBody;
WebPreview.Console = WebPreviewConsole;
