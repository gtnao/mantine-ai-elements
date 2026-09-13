'use client';
import { Alert, Button, Group, Menu, Modal, Table } from '@mantine/core';
import {
  type ComponentProps,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  type ExtraProps,
  extractTableDataFromElement,
  StreamdownContext,
  tableDataToCSV,
  tableDataToMarkdown,
  tableDataToTSV,
} from 'streamdown';
import { downloadBlob, useResponse } from './response-context';

export function ResponseTable({
  children,
  node: _node,
  ...props
}: ComponentProps<'table'> & ExtraProps) {
  const { controls, isAnimating, tableMaxHeight } =
    useContext(StreamdownContext);
  const { translations: t } = useResponse();
  const tableRef = useRef<HTMLTableElement>(null);
  const [opened, setOpened] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);
  const config = typeof controls === 'object' ? controls.table : controls;
  const options = typeof config === 'object' ? config : {};
  const enabled = config !== false;
  const copy = enabled && options.copy !== false;
  const download = enabled && options.download !== false;
  const fullscreen = enabled && options.fullscreen !== false;
  const filename =
    typeof options.download === 'object' ? options.download.filename : 'table';
  const serialize = (format: 'csv' | 'markdown' | 'tsv') => {
    if (!tableRef.current) throw new Error('Table is not mounted');
    const data = extractTableDataFromElement(tableRef.current);
    if (format === 'markdown') return tableDataToMarkdown(data);
    if (format === 'tsv') return tableDataToTSV(data);
    return tableDataToCSV(data, options.csvSeparator);
  };
  const menu = (operation: 'copy' | 'download') => (
    <Menu withinPortal>
      <Menu.Target>
        <Button size="compact-xs" variant="subtle" disabled={isAnimating}>
          {operation === 'copy'
            ? copied
              ? t.copied
              : t.copyTable
            : t.downloadTable}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {(
          [
            'csv',
            'markdown',
            ...(operation === 'copy' ? (['tsv'] as const) : []),
          ] as const
        ).map((format) => (
          <Menu.Item
            key={format}
            onClick={async () => {
              try {
                const text = serialize(format);
                if (operation === 'copy') {
                  await navigator.clipboard.writeText(text);
                  setCopied(true);
                } else
                  downloadBlob(
                    new Blob([text], {
                      type: format === 'csv' ? 'text/csv' : 'text/markdown',
                    }),
                    `${filename}.${format === 'markdown' ? 'md' : format}`,
                  );
                setError('');
              } catch (cause) {
                setError(
                  cause instanceof Error ? cause.message : String(cause),
                );
              }
            }}
          >
            {format === 'csv'
              ? operation === 'copy'
                ? t.copyTableAsCsv
                : t.downloadTableAsCsv
              : format === 'markdown'
                ? operation === 'copy'
                  ? t.copyTableAsMarkdown
                  : t.downloadTableAsMarkdown
                : t.copyTableAsTsv}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
  const toolbar = (
    <Group justify="flex-end" gap={4} mb="xs">
      {copy && menu('copy')}
      {download && menu('download')}
      {fullscreen && (
        <Button
          variant="subtle"
          size="compact-xs"
          disabled={isAnimating}
          onClick={() => setOpened(true)}
        >
          {t.viewFullscreen}
        </Button>
      )}
    </Group>
  );
  return (
    <div data-message-response="table">
      {toolbar}
      {error && <Alert color="red">{error}</Alert>}
      <div
        style={{
          overflow: 'auto',
          maxHeight:
            tableMaxHeight === 0 || tableMaxHeight === Infinity
              ? undefined
              : tableMaxHeight,
        }}
      >
        <Table
          {...props}
          ref={tableRef}
          withTableBorder
          withColumnBorders
          highlightOnHover
        >
          {children}
        </Table>
      </div>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        fullScreen
        title={t.viewFullscreen}
        closeButtonProps={{ 'aria-label': t.exitFullscreen }}
      >
        <Group justify="flex-end" mb="md">
          {copy && menu('copy')}
          {download && menu('download')}
        </Group>
        {error && <Alert color="red">{error}</Alert>}
        <Table.ScrollContainer minWidth={400}>
          <Table {...props} withTableBorder withColumnBorders>
            {children}
          </Table>
        </Table.ScrollContainer>
      </Modal>
    </div>
  );
}
