'use client';
import {
  Alert,
  Box,
  Button,
  Code,
  Group,
  Loader,
  Menu,
  Modal,
  Stack,
  useComputedColorScheme,
} from '@mantine/core';
import { useContext, useEffect, useId, useRef, useState } from 'react';
import { StreamdownContext } from 'streamdown';
import { CodeBlockCopyButton } from '../CodeBlock/CodeBlock';
import classes from './ResponseMermaid.module.css';
import { downloadBlob, useResponse } from './response-context';

function serializeSvg(source: string) {
  const svg = new DOMParser()
    .parseFromString(source, 'text/html')
    .querySelector('svg');
  if (!svg) throw new Error('Diagram SVG is unavailable');
  const viewBox = svg.getAttribute('viewBox')?.split(/[ ,]+/).map(Number);
  if (viewBox?.length === 4 && viewBox[2] && viewBox[3]) {
    svg.setAttribute('width', String(viewBox[2]));
    svg.setAttribute('height', String(viewBox[3]));
  }
  return new XMLSerializer().serializeToString(svg);
}
async function svgToPng(svg: string): Promise<Blob> {
  const image = new Image();
  // XML serialization closes embedded HTML tags; a data URL keeps SVG with
  // foreignObject labels origin-clean when it is drawn onto a canvas.
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serializeSvg(svg))}`;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = (image.naturalWidth || 1200) * 2;
  canvas.height = (image.naturalHeight || 800) * 2;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('PNG export failed'))),
      'image/png',
    ),
  );
}
export function ResponseMermaid({
  code,
  incomplete,
}: {
  code: string;
  incomplete: boolean;
}) {
  const { plugins, translations: t } = useResponse();
  const {
    controls,
    isAnimating,
    mermaid: mermaidOptions,
  } = useContext(StreamdownContext);
  const scheme = useComputedColorScheme('light');
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [opened, setOpened] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{
    x: number;
    y: number;
    startX: number;
    startY: number;
  } | null>(null);
  const requestId = useRef(0);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Retry explicitly restarts the render.
  useEffect(() => {
    let active = true;
    const sequence = ++requestId.current;
    setLoading(true);
    void (async () => {
      try {
        const plugin = plugins.mermaid;
        if (!plugin) return;
        const instance = plugin.getMermaid({
          theme: scheme === 'dark' ? 'dark' : 'default',
          ...mermaidOptions?.config,
        });
        const result = await instance.render(`diagram-${id}-${sequence}`, code);
        if (active) {
          setSvg(result.svg);
          setError('');
        }
      } catch (cause) {
        if (active)
          setError(cause instanceof Error ? cause.message : String(cause));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [code, id, plugins.mermaid, mermaidOptions?.config, scheme, retryCount]);
  const config = typeof controls === 'object' ? controls.mermaid : controls;
  const options = typeof config === 'object' ? config : {};
  const enabled = config !== false;
  const showPanZoom = enabled && options.panZoom !== false;
  const baseFilename =
    typeof options.download === 'object'
      ? options.download.filename
      : 'diagram';
  const ErrorComponent = mermaidOptions?.errorComponent;
  const retry = () => setRetryCount((value) => value + 1);
  const toolbar = (
    <Group justify="flex-end" gap={4} wrap="wrap">
      {enabled && options.copy !== false && (
        <CodeBlockCopyButton
          code={code}
          {...(typeof options.copy === 'object' ? options.copy : {})}
          copyLabel={t.copyCode}
          copiedLabel={t.copied}
          disabled={isAnimating}
        />
      )}
      {enabled && options.download !== false && (
        <Menu>
          <Menu.Target>
            <Button
              variant="subtle"
              size="compact-xs"
              disabled={isAnimating || !svg}
            >
              {t.downloadDiagram}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {(['svg', 'png', 'mmd'] as const).map((format) => (
              <Menu.Item
                key={format}
                onClick={async () => {
                  try {
                    const blob =
                      format === 'png'
                        ? await svgToPng(svg)
                        : new Blob(
                            [format === 'svg' ? serializeSvg(svg) : code],
                            {
                              type:
                                format === 'svg'
                                  ? 'image/svg+xml'
                                  : 'text/plain',
                            },
                          );
                    downloadBlob(blob, `${baseFilename}.${format}`);
                  } catch (cause) {
                    setError(
                      cause instanceof Error ? cause.message : String(cause),
                    );
                  }
                }}
              >
                {format === 'svg'
                  ? t.downloadDiagramAsSvg
                  : format === 'png'
                    ? t.downloadDiagramAsPng
                    : t.downloadDiagramAsMmd}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      )}
      {enabled && options.fullscreen !== false && !opened && (
        <Button
          variant="subtle"
          size="compact-xs"
          disabled={isAnimating}
          onClick={() => setOpened(true)}
        >
          {t.viewFullscreen}
        </Button>
      )}
      {showPanZoom && (
        <>
          <Button
            size="compact-xs"
            variant="subtle"
            onClick={() => setZoom((value) => Math.min(4, value + 0.25))}
          >
            {t.zoomIn}
          </Button>
          <Button
            size="compact-xs"
            variant="subtle"
            onClick={() => setZoom((value) => Math.max(0.25, value - 0.25))}
          >
            {t.zoomOut}
          </Button>
          <Button
            size="compact-xs"
            variant="subtle"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
          >
            {t.resetView}
          </Button>
        </>
      )}
    </Group>
  );
  const drawing = (
    <Box
      style={{
        overflow: 'hidden',
        touchAction: showPanZoom ? 'none' : 'auto',
        cursor: showPanZoom ? 'grab' : undefined,
        minHeight: 120,
      }}
      onPointerDown={(event) => {
        if (!showPanZoom) return;
        drag.current = {
          x: event.clientX,
          y: event.clientY,
          startX: pan.x,
          startY: pan.y,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const start = drag.current;
        if (start)
          setPan({
            x: start.startX + event.clientX - start.x,
            y: start.startY + event.clientY - start.y,
          });
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
    >
      <Box
        className={classes.drawing}
        data-message-response="diagram"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center',
        }}
        /* biome-ignore lint/security/noDangerouslySetInnerHtml: SVG is produced by Mermaid strict mode, not raw Markdown. Custom plugins own their SVG trust boundary. */
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </Box>
  );
  return (
    <Stack gap="xs">
      {toolbar}
      {loading && !svg && <Loader size="sm" />}
      {error &&
        (!incomplete || !svg) &&
        (ErrorComponent ? (
          <ErrorComponent chart={code} error={error} retry={retry} />
        ) : (
          <Alert color="red" title="Diagram could not be rendered">
            <Button variant="subtle" size="xs" onClick={retry}>
              Retry
            </Button>
            <details>
              <summary>Show source</summary>
              <Code block>{code}</Code>
            </details>
          </Alert>
        ))}
      {!opened && drawing}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        fullScreen
        title={t.viewFullscreen}
        closeButtonProps={{ 'aria-label': t.exitFullscreen }}
      >
        {toolbar}
        {drawing}
      </Modal>
    </Stack>
  );
}
