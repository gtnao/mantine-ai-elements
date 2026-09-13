'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  type Factory,
  factory,
  TextInput,
  type TextInputFactory,
  type TextInputProps,
  useProps,
  useStyles,
} from '@mantine/core';
import { useState } from 'react';
import { useWebPreview } from './WebPreview';
import classes from './WebPreview.module.css';
export interface WebPreviewUrlProps extends TextInputProps {}
export type WebPreviewUrlFactory = Factory<{
  props: WebPreviewUrlProps;
  ref: HTMLInputElement;
  stylesNames: TextInputFactory['stylesNames'];
}>;
export const WebPreviewUrl = factory<WebPreviewUrlFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'WebPreviewUrl',
      { size: 'xs', placeholder: 'Enter URL…', 'aria-label': 'Preview URL' },
      _props,
    );
    const {
      value,
      onChange,
      onKeyDown,
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
      ...others
    } = props;
    const { url, setUrl } = useWebPreview();
    const [previousUrl, setPreviousUrl] = useState(url);
    const [draft, setDraft] = useState(url);
    if (previousUrl !== url) {
      setPreviousUrl(url);
      setDraft(url);
    }
    const getStyles = useStyles<WebPreviewUrlFactory>({
      name: 'WebPreviewUrl',
      props,
      classes: { root: classes.url },
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    const resolved = Object.fromEntries(
      (Object.keys(TextInput.classes) as TextInputFactory['stylesNames'][]).map(
        (key) => [key, getStyles(key)],
      ),
    );
    return (
      <TextInput
        {...others}
        ref={ref}
        value={value ?? draft}
        unstyled={unstyled}
        onChange={(event) => {
          setDraft(event.currentTarget.value);
          onChange?.(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (
            event.defaultPrevented ||
            event.key !== 'Enter' ||
            event.nativeEvent.isComposing ||
            event.nativeEvent.keyCode === 229 ||
            others.disabled ||
            others.readOnly
          )
            return;
          event.preventDefault();
          setUrl(event.currentTarget.value);
        }}
        classNames={Object.fromEntries(
          Object.entries(resolved).map(([key, value]) => [
            key,
            value.className,
          ]),
        )}
        styles={Object.fromEntries(
          Object.entries(resolved).map(([key, value]) => [key, value.style]),
        )}
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
  },
);
WebPreviewUrl.displayName = 'WebPreviewUrl';
WebPreviewUrl.classes = TextInput.classes;
