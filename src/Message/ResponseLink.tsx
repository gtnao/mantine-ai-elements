'use client';
import { Alert, Anchor, Button, Group, Modal, Text } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { type ComponentProps, useContext, useState } from 'react';
import { type ExtraProps, StreamdownContext } from 'streamdown';
import { useResponse } from './response-context';
export function ResponseLink({
  node: _node,
  children,
  href,
  onClick,
  ...props
}: ComponentProps<'a'> & ExtraProps) {
  const { linkSafety } = useContext(StreamdownContext);
  const { translations: t } = useResponse();
  const clipboard = useClipboard({ timeout: 2000 });
  const [opened, setOpened] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  if (!href || href.startsWith('streamdown:')) return <span>{children}</span>;
  const openLink = () => {
    window.open(href, '_blank', 'noopener,noreferrer');
    setOpened(false);
  };
  const modalProps = {
    isOpen: opened,
    onClose: () => setOpened(false),
    onConfirm: openLink,
    url: href,
  };
  return (
    <>
      <Anchor
        {...props}
        href={href}
        target={href.startsWith('#') ? '_self' : (props.target ?? '_blank')}
        rel={props.rel ?? 'noopener noreferrer'}
        aria-busy={checking || undefined}
        onClick={async (event) => {
          onClick?.(event);
          if (
            event.defaultPrevented ||
            !linkSafety?.enabled ||
            href.startsWith('#')
          )
            return;
          event.preventDefault();
          if (checking) return;
          setError('');
          setChecking(true);
          try {
            if (linkSafety.onLinkCheck && (await linkSafety.onLinkCheck(href)))
              openLink();
            else setOpened(true);
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : String(cause));
            setOpened(true);
          } finally {
            setChecking(false);
          }
        }}
      >
        {children}
      </Anchor>
      {linkSafety?.renderModal ? (
        linkSafety.renderModal(modalProps)
      ) : (
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title={t.openExternalLink}
          closeButtonProps={{ 'aria-label': t.close }}
        >
          <Text>{t.externalLinkWarning}</Text>
          <Text size="sm" style={{ overflowWrap: 'anywhere' }}>
            {href}
          </Text>
          {error && <Alert color="red">{error}</Alert>}
          {clipboard.error && (
            <Alert color="red" role="alert">
              {clipboard.error.message}
            </Alert>
          )}
          <Group mt="md" justify="flex-end">
            <Button variant="subtle" onClick={() => clipboard.copy(href)}>
              {clipboard.copied ? t.copied : t.copyLink}
            </Button>
            <Button variant="default" onClick={() => setOpened(false)}>
              {t.close}
            </Button>
            <Button onClick={openLink}>{t.openLink}</Button>
          </Group>
        </Modal>
      )}
    </>
  );
}
