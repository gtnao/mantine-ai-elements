'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  type ElementProps,
  type Factory,
  Flex,
  type FlexProps,
  factory,
  type StylesApiProps,
  Tabs,
  type TabsCssVariables,
  type TabsListProps,
  type TabsPanelProps,
  type TabsProps,
  type TabsTabProps,
  useProps,
  useStyles,
} from '@mantine/core';
import classes from './Sandbox.module.css';

export interface SandboxTabsProps extends TabsProps {}
export type SandboxTabsFactory = Factory<{
  props: SandboxTabsProps;
  ref: HTMLDivElement;
  stylesNames: 'root' | 'list' | 'tab' | 'tabLabel' | 'tabSection' | 'panel';
  vars: TabsCssVariables;
}>;
export const SandboxTabs = factory<SandboxTabsFactory>(({ ref, ..._props }) => {
  const props = useProps('SandboxTabs', { radius: 0 }, _props);
  const {
    className,
    style,
    classNames,
    styles,
    vars,
    attributes,
    unstyled,
    ...others
  } = props;
  const getStyles = useStyles<SandboxTabsFactory>({
    name: 'SandboxTabs',
    rootSelector: 'root',
    props,
    classes: {
      root: classes.tabs,
      list: classes.tabsList,
      tab: classes.tab,
      tabLabel: classes.tabLabel,
      tabSection: classes.tabSection,
      panel: classes.panel,
    },
    className,
    style,
    classNames,
    styles,
    vars,
    attributes,
    unstyled,
  });
  const resolved = Object.fromEntries(
    (['root', 'list', 'tab', 'tabLabel', 'tabSection', 'panel'] as const).map(
      (key) => [key, getStyles(key)],
    ),
  );
  return (
    <Tabs
      {...others}
      ref={ref}
      classNames={Object.fromEntries(
        Object.entries(resolved).map(([key, value]) => [key, value.className]),
      )}
      styles={Object.fromEntries(
        Object.entries(resolved).map(([key, value]) => [key, value.style]),
      )}
      unstyled={unstyled}
      attributes={Object.fromEntries(
        Object.entries(resolved).map(([key, value]) => [
          key,
          Object.fromEntries(
            Object.entries(value).filter(
              ([name]) => name !== 'className' && name !== 'style',
            ),
          ),
        ]),
      )}
    />
  );
});
SandboxTabs.displayName = 'SandboxTabs';
SandboxTabs.classes = {
  root: classes.tabs,
  list: classes.tabsList,
  tab: classes.tab,
  tabLabel: classes.tabLabel,
  tabSection: classes.tabSection,
  panel: classes.panel,
};

export interface SandboxTabsListProps
  extends Omit<
      TabsListProps,
      'classNames' | 'styles' | 'vars' | 'unstyled' | 'attributes'
    >,
    StylesApiProps<SandboxTabsListFactory> {}
export type SandboxTabsListFactory = Factory<{
  props: SandboxTabsListProps;
  ref: HTMLDivElement;
  stylesNames: 'list';
}>;
export const SandboxTabsList = factory<SandboxTabsListFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('SandboxTabsList', {}, _props);
    const {
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      ...others
    } = props;
    const getStyles = useStyles<SandboxTabsListFactory>({
      name: 'SandboxTabsList',
      rootSelector: 'list',
      props,
      classes: { list: classes.tabsList },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    const resolved = Object.fromEntries(
      (['list'] as const).map((key) => [key, getStyles(key)]),
    );
    return (
      <Tabs.List
        {...others}
        ref={ref}
        classNames={Object.fromEntries(
          Object.entries(resolved).map(([key, value]) => [
            key,
            value.className,
          ]),
        )}
        styles={Object.fromEntries(
          Object.entries(resolved).map(([key, value]) => [key, value.style]),
        )}
        {...Object.fromEntries(
          Object.entries(resolved.list ?? {}).filter(
            ([name]) => name !== 'className' && name !== 'style',
          ),
        )}
      />
    );
  },
);
SandboxTabsList.displayName = 'SandboxTabsList';
SandboxTabsList.classes = { list: classes.tabsList };

export interface SandboxTabsTriggerProps
  extends Omit<
      TabsTabProps,
      'classNames' | 'styles' | 'vars' | 'unstyled' | 'attributes'
    >,
    StylesApiProps<SandboxTabsTriggerFactory> {}
export type SandboxTabsTriggerFactory = Factory<{
  props: SandboxTabsTriggerProps;
  ref: HTMLButtonElement;
  stylesNames: 'tab' | 'tabLabel' | 'tabSection';
}>;
export const SandboxTabsTrigger = factory<SandboxTabsTriggerFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('SandboxTabsTrigger', {}, _props);
    const {
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      ...others
    } = props;
    const getStyles = useStyles<SandboxTabsTriggerFactory>({
      name: 'SandboxTabsTrigger',
      rootSelector: 'tab',
      props,
      classes: {
        tab: classes.tab,
        tabLabel: classes.tabLabel,
        tabSection: classes.tabSection,
      },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    const resolved = Object.fromEntries(
      (['tab', 'tabLabel', 'tabSection'] as const).map((key) => [
        key,
        getStyles(key),
      ]),
    );
    return (
      <Tabs.Tab
        {...others}
        ref={ref}
        classNames={Object.fromEntries(
          Object.entries(resolved).map(([key, value]) => [
            key,
            value.className,
          ]),
        )}
        styles={Object.fromEntries(
          Object.entries(resolved).map(([key, value]) => [key, value.style]),
        )}
        {...Object.fromEntries(
          Object.entries(resolved.tab ?? {}).filter(
            ([name]) => name !== 'className' && name !== 'style',
          ),
        )}
      />
    );
  },
);
SandboxTabsTrigger.displayName = 'SandboxTabsTrigger';
SandboxTabsTrigger.classes = {
  tab: classes.tab,
  tabLabel: classes.tabLabel,
  tabSection: classes.tabSection,
};

export interface SandboxTabContentProps
  extends Omit<
      TabsPanelProps,
      'classNames' | 'styles' | 'vars' | 'unstyled' | 'attributes'
    >,
    StylesApiProps<SandboxTabContentFactory> {}
export type SandboxTabContentFactory = Factory<{
  props: SandboxTabContentProps;
  ref: HTMLDivElement;
  stylesNames: 'panel';
}>;
export const SandboxTabContent = factory<SandboxTabContentFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('SandboxTabContent', {}, _props);
    const {
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      ...others
    } = props;
    const getStyles = useStyles<SandboxTabContentFactory>({
      name: 'SandboxTabContent',
      rootSelector: 'panel',
      props,
      classes: { panel: classes.panel },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    const resolved = Object.fromEntries(
      (['panel'] as const).map((key) => [key, getStyles(key)]),
    );
    return (
      <Tabs.Panel
        {...others}
        ref={ref}
        classNames={Object.fromEntries(
          Object.entries(resolved).map(([key, value]) => [
            key,
            value.className,
          ]),
        )}
        styles={Object.fromEntries(
          Object.entries(resolved).map(([key, value]) => [key, value.style]),
        )}
        {...Object.fromEntries(
          Object.entries(resolved.panel ?? {}).filter(
            ([name]) => name !== 'className' && name !== 'style',
          ),
        )}
      />
    );
  },
);
SandboxTabContent.displayName = 'SandboxTabContent';
SandboxTabContent.classes = { panel: classes.panel };

export interface SandboxTabsBarProps extends FlexProps, ElementProps<'div'> {}
export type SandboxTabsBarFactory = Factory<{
  props: SandboxTabsBarProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
}>;
export const SandboxTabsBar = factory<SandboxTabsBarFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'SandboxTabsBar',
      { align: 'center', gap: 'xs' },
      _props,
    );
    const {
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      ...others
    } = props;
    const getStyles = useStyles<SandboxTabsBarFactory>({
      name: 'SandboxTabsBar',
      props,
      classes: { root: classes.tabsBar },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    return (
      <Flex {...others} {...getStyles('root')} ref={ref} unstyled={unstyled} />
    );
  },
);
SandboxTabsBar.displayName = 'SandboxTabsBar';
SandboxTabsBar.classes = { root: classes.tabsBar };
