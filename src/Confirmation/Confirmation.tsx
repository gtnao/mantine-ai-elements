'use client';
/* Adapted from AI Elements (Apache-2.0). See NOTICE. */
import {
  Alert,
  type AlertCssVariables,
  type AlertProps,
  type AlertStylesNames,
  Button,
  type ButtonCssVariables,
  type ButtonProps,
  type ButtonStylesNames,
  type ElementProps,
  type Factory,
  factory,
  Group,
  type GroupCssVariables,
  type GroupProps,
  type GroupStylesCtx,
  getSpacing,
  Text,
  type TextProps,
  useProps,
  useStyles,
} from '@mantine/core';
import type { ChatAddToolApproveResponseFunction } from 'ai';
import {
  Children,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { ToolPart } from '../Tool/Tool';

export type ConfirmationApproval = ToolPart['approval'];
interface ConfirmationContextValue {
  approval: ConfirmationApproval;
  state: ToolPart['state'];
  pending: boolean;
  canRespond: boolean;
  respond: (approved: boolean, reason?: string) => void;
}
const Context = createContext<ConfirmationContextValue | null>(null);
function useConfirmation() {
  const value = useContext(Context);
  if (!value)
    throw new Error('Confirmation components must be used within Confirmation');
  return value;
}
export interface ConfirmationProps extends AlertProps {
  approval?: ConfirmationApproval;
  state: ToolPart['state'];
  /** Receives the same approval payload accepted by useChat.addToolApprovalResponse. */
  onResponse?: ChatAddToolApproveResponseFunction;
  onResponseError?: (error: unknown) => void;
  /** Also disables direct onClick actions controlled by the application. */
  pending?: boolean;
}
export type ConfirmationFactory = Factory<{
  props: ConfirmationProps;
  ref: HTMLDivElement;
  stylesNames: AlertStylesNames;
  vars: AlertCssVariables;
  staticComponents: {
    Title: typeof ConfirmationTitle;
    Request: typeof ConfirmationRequest;
    Accepted: typeof ConfirmationAccepted;
    Rejected: typeof ConfirmationRejected;
    Actions: typeof ConfirmationActions;
    Action: typeof ConfirmationAction;
  };
}>;
export const Confirmation = factory<ConfirmationFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('Confirmation', { pending: false }, _props);
    const {
      approval,
      state,
      onResponse,
      onResponseError,
      pending,
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
    const getStyles = useStyles<ConfirmationFactory>({
      name: 'Confirmation',
      props,
      classes: {},
      className,
      style,
      classNames,
      styles,
      vars,
      attributes,
      unstyled,
    });
    const resolved = Object.fromEntries(
      (Object.keys(Alert.classes) as AlertStylesNames[]).map((slot) => [
        slot,
        getStyles(slot),
      ]),
    );
    const [flight, setFlight] = useState<object | null>(null);
    const active = useRef<object | null>(null);
    const mounted = useRef(true);
    useEffect(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
        active.current = null;
      };
    }, []);
    // biome-ignore lint/correctness/useExhaustiveDependencies: A new approval or state transition invalidates the previous request lock.
    useEffect(() => {
      active.current = null;
      setFlight(null);
    }, [approval?.id, state]);
    const respond = (approved: boolean, reason?: string) => {
      if (
        !approval ||
        state !== 'approval-requested' ||
        approval.approved !== undefined ||
        pending ||
        active.current ||
        !onResponse
      )
        return;
      const token = {};
      active.current = token;
      setFlight(token);
      const failed = (error: unknown) => {
        if (!mounted.current || active.current !== token) return;
        active.current = null;
        setFlight(null);
        onResponseError?.(error);
      };
      try {
        // Keep success locked until the application supplies the response state.
        // Late failures from a different approval must not unlock the current one.
        Promise.resolve(
          onResponse({ id: approval.id, approved, reason }),
        ).catch(failed);
      } catch (error) {
        failed(error);
      }
    };
    if (!approval || state === 'input-streaming' || state === 'input-available')
      return null;
    return (
      <Context.Provider
        value={{
          approval,
          state,
          pending: pending || flight !== null,
          canRespond: Boolean(onResponse),
          respond,
        }}
      >
        <Alert
          aria-busy={pending || flight !== null}
          {...others}
          ref={ref}
          unstyled={unstyled}
          attributes={attributes}
          classNames={Object.fromEntries(
            Object.entries(resolved).map(([key, value]) => [
              key,
              value.className,
            ]),
          )}
          styles={Object.fromEntries(
            Object.entries(resolved).map(([key, value]) => [key, value.style]),
          )}
        >
          {children}
        </Alert>
      </Context.Provider>
    );
  },
);
export interface ConfirmationTitleProps
  extends TextProps,
    ElementProps<'div', keyof TextProps> {}
export type ConfirmationTitleFactory = Factory<{
  props: ConfirmationTitleProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
}>;
export const ConfirmationTitle = factory<ConfirmationTitleFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('ConfirmationTitle', { size: 'sm' }, _props);
    const { className, style, classNames, styles, vars, unstyled, ...others } =
      props;
    const getStyles = useStyles<ConfirmationTitleFactory>({
      name: 'ConfirmationTitle',
      props,
      classes: {},
      className,
      style,
      classNames,
      styles,
      vars,
      unstyled,
    });
    return (
      <Text
        component="div"
        {...others}
        {...getStyles('root')}
        unstyled={unstyled}
        ref={ref}
      />
    );
  },
);
export interface ConfirmationRequestProps {
  children?: ReactNode;
}
export interface ConfirmationAcceptedProps {
  children?: ReactNode;
}
export interface ConfirmationRejectedProps {
  children?: ReactNode;
}
export function ConfirmationRequest({ children }: ConfirmationRequestProps) {
  return useConfirmation().state === 'approval-requested' ? children : null;
}
function isResponseState(state: ToolPart['state']) {
  return (
    state === 'approval-responded' ||
    state === 'output-available' ||
    state === 'output-denied' ||
    state === 'output-error'
  );
}
export function ConfirmationAccepted({ children }: ConfirmationAcceptedProps) {
  const { approval, state } = useConfirmation();
  return approval?.approved === true && isResponseState(state)
    ? children
    : null;
}
export function ConfirmationRejected({ children }: ConfirmationRejectedProps) {
  const { approval, state } = useConfirmation();
  return approval?.approved === false && isResponseState(state)
    ? children
    : null;
}
export interface ConfirmationActionsProps
  extends GroupProps,
    ElementProps<'div', keyof GroupProps> {}
export type ConfirmationActionsFactory = Factory<{
  props: ConfirmationActionsProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
  ctx: GroupStylesCtx;
  vars: GroupCssVariables;
}>;
export const ConfirmationActions = factory<ConfirmationActionsFactory>(
  ({ ref, ..._props }) => {
    const props = useProps(
      'ConfirmationActions',
      { justify: 'flex-end', gap: 'xs', mt: 'sm' },
      _props,
    );
    const { className, style, classNames, styles, vars, unstyled, ...others } =
      props;
    const count = Children.toArray(others.children).filter(Boolean).length;
    const gap = getSpacing(others.gap ?? 'md');
    const stylesCtx = {
      childWidth: `calc(${100 / count}% - (${gap} - ${gap} / ${count}))`,
    };
    const getStyles = useStyles<ConfirmationActionsFactory>({
      stylesCtx,
      name: 'ConfirmationActions',
      props,
      classes: {},
      className,
      style,
      classNames,
      styles,
      vars,
      unstyled,
    });
    return useConfirmation().state === 'approval-requested' ? (
      <Group {...others} {...getStyles('root')} unstyled={unstyled} ref={ref} />
    ) : null;
  },
);
export interface ConfirmationActionProps
  extends ButtonProps,
    ElementProps<'button', keyof ButtonProps> {
  /** Dispatches onResponse on the root. Omit to use an application-owned onClick. */
  approved?: boolean;
  reason?: string;
}
export type ConfirmationActionFactory = Factory<{
  props: ConfirmationActionProps;
  ref: HTMLButtonElement;
  stylesNames: ButtonStylesNames;
  vars: ButtonCssVariables;
}>;
export const ConfirmationAction = factory<ConfirmationActionFactory>(
  ({ ref, ..._props }) => {
    const props = useProps('ConfirmationAction', { size: 'xs' }, _props);
    const {
      approved,
      reason,
      onClick,
      disabled,
      loading,
      children,
      className,
      style,
      classNames,
      styles,
      vars,
      unstyled,
      ...others
    } = props;
    const context = useConfirmation();
    const getStyles = useStyles<ConfirmationActionFactory>({
      name: 'ConfirmationAction',
      props,
      classes: {},
      className,
      style,
      classNames,
      styles,
      vars,
      unstyled,
    });
    const resolved = Object.fromEntries(
      (Object.keys(Button.classes) as ButtonStylesNames[]).map((slot) => [
        slot,
        getStyles(slot),
      ]),
    );
    const unavailable =
      disabled ||
      loading ||
      context.pending ||
      context.state !== 'approval-requested' ||
      context.approval?.approved !== undefined ||
      (approved !== undefined && !context.canRespond);
    return (
      <Button
        {...others}
        ref={ref}
        type="button"
        unstyled={unstyled}
        disabled={unavailable}
        loading={loading}
        classNames={Object.fromEntries(
          Object.entries(resolved).map(([key, value]) => [
            key,
            value.className,
          ]),
        )}
        styles={Object.fromEntries(
          Object.entries(resolved).map(([key, value]) => [key, value.style]),
        )}
        onClick={(event) => {
          if (unavailable || others['data-disabled']) return;
          onClick?.(event);
          if (!event.defaultPrevented && approved !== undefined)
            context.respond(approved, reason);
        }}
      >
        {children}
      </Button>
    );
  },
);
Confirmation.displayName = 'Confirmation';
ConfirmationTitle.displayName = 'ConfirmationTitle';
ConfirmationActions.displayName = 'ConfirmationActions';
ConfirmationAction.displayName = 'ConfirmationAction';
Confirmation.Title = ConfirmationTitle;
Confirmation.Request = ConfirmationRequest;
Confirmation.Accepted = ConfirmationAccepted;
Confirmation.Rejected = ConfirmationRejected;
Confirmation.Actions = ConfirmationActions;
Confirmation.Action = ConfirmationAction;
