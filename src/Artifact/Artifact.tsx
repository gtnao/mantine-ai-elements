'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  Box,
  type BoxProps,
  Flex,
  type FlexProps,
  Paper,
  type PaperCssVariables,
  type PaperProps,
  type PolymorphicFactory,
  polymorphicFactory,
  type StylesApiProps,
  Text,
  type TextCssVariables,
  type TextProps,
  useProps,
  useStyles,
} from '@mantine/core';
import classes from './Artifact.module.css';
import { ArtifactAction, ArtifactClose } from './ArtifactAction';

export interface ArtifactProps extends PaperProps {}
export type ArtifactFactory = PolymorphicFactory<{
  props: ArtifactProps;
  defaultComponent: 'div';
  defaultRef: HTMLDivElement;
  stylesNames: 'root';
  vars: PaperCssVariables;
  staticComponents: {
    Header: typeof ArtifactHeader;
    Title: typeof ArtifactTitle;
    Description: typeof ArtifactDescription;
    Actions: typeof ArtifactActions;
    Action: typeof ArtifactAction;
    Close: typeof ArtifactClose;
    Content: typeof ArtifactContent;
  };
}>;
export const Artifact = polymorphicFactory<ArtifactFactory>((_props) => {
  const props = useProps(
    'Artifact',
    { withBorder: true, radius: 'lg', shadow: 'sm' },
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
  const getStyles = useStyles<ArtifactFactory>({
    name: 'Artifact',
    props,
    classes: { root: classes.root },
    className,
    style,
    classNames,
    styles,
    vars,
    attributes,
    unstyled,
  });
  return <Paper {...others} {...getStyles('root')} unstyled={unstyled} />;
});
Artifact.displayName = 'Artifact';
Artifact.classes = { root: classes.root };

export interface ArtifactHeaderProps extends FlexProps {}
export type ArtifactHeaderFactory = PolymorphicFactory<{
  props: ArtifactHeaderProps;
  defaultComponent: 'div';
  defaultRef: HTMLDivElement;
  stylesNames: 'root';
}>;
export const ArtifactHeader = polymorphicFactory<ArtifactHeaderFactory>(
  (_props) => {
    const props = useProps(
      'ArtifactHeader',
      { align: 'center', justify: 'space-between', gap: 'sm', wrap: 'wrap' },
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
    const getStyles = useStyles<ArtifactHeaderFactory>({
      name: 'ArtifactHeader',
      props,
      classes: { root: classes.header },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    return <Flex {...others} {...getStyles('root')} unstyled={unstyled} />;
  },
);
ArtifactHeader.displayName = 'ArtifactHeader';
ArtifactHeader.classes = { root: classes.header };

export interface ArtifactTitleProps extends TextProps {}
export type ArtifactTitleFactory = PolymorphicFactory<{
  props: ArtifactTitleProps;
  defaultComponent: 'p';
  defaultRef: HTMLParagraphElement;
  stylesNames: 'root';
  vars: TextCssVariables;
}>;
export const ArtifactTitle = polymorphicFactory<ArtifactTitleFactory>(
  (_props) => {
    const props = useProps('ArtifactTitle', { size: 'sm', fw: 500 }, _props);
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
    const getStyles = useStyles<ArtifactTitleFactory>({
      name: 'ArtifactTitle',
      props,
      classes: { root: classes.title },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    return <Text {...others} {...getStyles('root')} unstyled={unstyled} />;
  },
);
ArtifactTitle.displayName = 'ArtifactTitle';
ArtifactTitle.classes = { root: classes.title };

export interface ArtifactDescriptionProps extends TextProps {}
export type ArtifactDescriptionFactory = PolymorphicFactory<{
  props: ArtifactDescriptionProps;
  defaultComponent: 'p';
  defaultRef: HTMLParagraphElement;
  stylesNames: 'root';
  vars: TextCssVariables;
}>;
export const ArtifactDescription =
  polymorphicFactory<ArtifactDescriptionFactory>((_props) => {
    const props = useProps(
      'ArtifactDescription',
      { size: 'sm', c: 'dimmed' },
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
    const getStyles = useStyles<ArtifactDescriptionFactory>({
      name: 'ArtifactDescription',
      props,
      classes: { root: classes.description },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    return <Text {...others} {...getStyles('root')} unstyled={unstyled} />;
  });
ArtifactDescription.displayName = 'ArtifactDescription';
ArtifactDescription.classes = { root: classes.description };

export interface ArtifactActionsProps extends FlexProps {}
export type ArtifactActionsFactory = PolymorphicFactory<{
  props: ArtifactActionsProps;
  defaultComponent: 'div';
  defaultRef: HTMLDivElement;
  stylesNames: 'root';
}>;
export const ArtifactActions = polymorphicFactory<ArtifactActionsFactory>(
  (_props) => {
    const props = useProps(
      'ArtifactActions',
      { gap: 4, align: 'center', wrap: 'wrap' },
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
    const getStyles = useStyles<ArtifactActionsFactory>({
      name: 'ArtifactActions',
      props,
      classes: { root: classes.actions },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    return <Flex {...others} {...getStyles('root')} unstyled={unstyled} />;
  },
);
ArtifactActions.displayName = 'ArtifactActions';
ArtifactActions.classes = { root: classes.actions };

export interface ArtifactContentProps
  extends BoxProps,
    StylesApiProps<ArtifactContentFactory> {}
export type ArtifactContentFactory = PolymorphicFactory<{
  props: ArtifactContentProps;
  defaultComponent: 'div';
  defaultRef: HTMLDivElement;
  stylesNames: 'root';
}>;
export const ArtifactContent = polymorphicFactory<ArtifactContentFactory>(
  (_props) => {
    const props = useProps('ArtifactContent', {}, _props);
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
    const getStyles = useStyles<ArtifactContentFactory>({
      name: 'ArtifactContent',
      props,
      classes: { root: classes.content },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    return <Box {...others} {...getStyles('root')} />;
  },
);
ArtifactContent.displayName = 'ArtifactContent';
ArtifactContent.classes = { root: classes.content };

Artifact.Header = ArtifactHeader;
Artifact.Title = ArtifactTitle;
Artifact.Description = ArtifactDescription;
Artifact.Actions = ArtifactActions;
Artifact.Action = ArtifactAction;
Artifact.Close = ArtifactClose;
Artifact.Content = ArtifactContent;
