import {
  Component,
  lazy,
  type ReactNode,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { loadPreviewParser, type PreviewParserProps } from './parser-adapter';

const Parser = lazy(loadPreviewParser);
type Input = Pick<PreviewParserProps, 'jsx' | 'components' | 'bindings'>;
type Result = (error: Error | null) => void;

class RenderBoundary extends Component<
  { input: Input; onResult: Result; children: ReactNode },
  { input: Input; failed: boolean }
> {
  state = { input: this.props.input, failed: false };
  static getDerivedStateFromProps(
    props: { input: Input },
    state: { input: Input },
  ) {
    return props.input !== state.input
      ? { input: props.input, failed: false }
      : null;
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    this.props.onResult(error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Evaluation({ input, onResult }: { input: Input; onResult: Result }) {
  // The dependency invokes onError during render. Capture it locally and only
  // notify the owning preview after this render actually commits.
  const outcome: { error: Error | null } = { error: null };
  useEffect(() => onResult(outcome.error));
  return (
    <Parser
      {...input}
      renderInWrapper={false}
      onError={(error) => {
        outcome.error ??= error;
      }}
    />
  );
}

export function PreviewRenderer({
  jsx,
  components,
  bindings,
  isStreaming,
  lastGoodJsx,
  onSuccess,
  onError,
  loading,
}: Input & {
  isStreaming: boolean;
  lastGoodJsx: string;
  onSuccess: (jsx: string) => void;
  onError: (error: Error) => void;
  loading?: ReactNode;
}) {
  const input = useMemo(
    () => ({ jsx, components, bindings, isStreaming }),
    [jsx, components, bindings, isStreaming],
  );
  const [failure, setFailure] = useState<Input | null>(null);
  const reported = useRef<{ input: Input; streaming: boolean } | null>(null);
  const fallback = useMemo(
    () => ({ ...input, jsx: lastGoodJsx }),
    [input, lastGoodJsx],
  );
  const handleResult: Result = (error) => {
    if (
      reported.current?.input === input &&
      reported.current.streaming === isStreaming
    )
      return;
    reported.current = { input, streaming: isStreaming };
    if (error) {
      setFailure(input);
      if (!isStreaming) onError(error);
    } else onSuccess(jsx);
  };
  const failed = failure === input;
  // A final stream transition must retry the original input to report its
  // real error, even when the streaming preview was showing a fallback.
  const showFallback = failed && isStreaming;
  if (failed && !isStreaming) return null;
  return (
    <Suspense fallback={loading}>
      <RenderBoundary
        input={showFallback ? fallback : input}
        onResult={showFallback ? () => {} : handleResult}
      >
        <Evaluation
          input={showFallback ? fallback : input}
          onResult={showFallback ? () => {} : handleResult}
        />
      </RenderBoundary>
    </Suspense>
  );
}
