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
import { useId, useUncontrolled } from '@mantine/hooks';
import { createContext, useContext } from 'react';
import classes from './Sandbox.module.css';
import { SandboxContent, SandboxHeader } from './SandboxParts';
import {
  SandboxTabContent,
  SandboxTabs,
  SandboxTabsBar,
  SandboxTabsList,
  SandboxTabsTrigger,
} from './SandboxTabs';

const Context = createContext<{
  opened: boolean;
  setOpened: (opened: boolean) => void;
  disabled: boolean;
  id: string;
} | null>(null);
export function useSandbox() {
  const context = useContext(Context);
  if (!context)
    throw new Error('Sandbox header and content require a Sandbox parent');
  return context;
}
export interface SandboxProps
  extends PaperProps,
    ElementProps<'div', keyof PaperProps | 'onChange'> {
  opened?: boolean;
  defaultOpened?: boolean;
  onChange?: (opened: boolean) => void;
  disabled?: boolean;
}
export type SandboxRootProps = SandboxProps;
export type SandboxFactory = Factory<{
  props: SandboxProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
  vars: PaperCssVariables;
  staticComponents: {
    Header: typeof SandboxHeader;
    Content: typeof SandboxContent;
    Tabs: typeof SandboxTabs;
    TabsBar: typeof SandboxTabsBar;
    TabsList: typeof SandboxTabsList;
    TabsTrigger: typeof SandboxTabsTrigger;
    TabContent: typeof SandboxTabContent;
  };
}>;
export const Sandbox = factory<SandboxFactory>(({ ref, ..._props }) => {
  const props = useProps(
    'Sandbox',
    { withBorder: true, radius: 'sm', defaultOpened: true, disabled: false },
    _props,
  );
  const {
    opened: controlled,
    defaultOpened,
    onChange,
    disabled,
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
  const [opened, setOpened] = useUncontrolled({
    value: controlled,
    defaultValue: defaultOpened,
    finalValue: true,
    onChange,
  });
  const id = useId();
  const getStyles = useStyles<SandboxFactory>({
    name: 'Sandbox',
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
    <Context.Provider value={{ opened, setOpened, disabled, id }}>
      <Paper
        {...others}
        {...getStyles('root')}
        ref={ref}
        unstyled={unstyled}
        data-opened={opened || undefined}
      >
        {children}
      </Paper>
    </Context.Provider>
  );
});
Sandbox.displayName = 'Sandbox';
Sandbox.classes = { root: classes.root };

Sandbox.Header = SandboxHeader;
Sandbox.Content = SandboxContent;
Sandbox.Tabs = SandboxTabs;
Sandbox.TabsBar = SandboxTabsBar;
Sandbox.TabsList = SandboxTabsList;
Sandbox.TabsTrigger = SandboxTabsTrigger;
Sandbox.TabContent = SandboxTabContent;
