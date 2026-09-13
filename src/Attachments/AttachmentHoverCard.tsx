'use client';
import {
  type Factory,
  factory,
  Popover,
  type PopoverDropdownProps,
  type PopoverProps,
  type PopoverStylesNames,
  type PopoverTargetProps,
  useProps,
} from '@mantine/core';
import { useMergedRef, useUncontrolled } from '@mantine/hooks';
import {
  cloneElement,
  createContext,
  Fragment,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useRef,
} from 'react';

interface HoverContextValue {
  enter: () => void;
  leave: (relatedTarget?: EventTarget | null) => void;
  target: RefObject<HTMLElement | null>;
  dropdown: RefObject<HTMLDivElement | null>;
}
const HoverContext = createContext<HoverContextValue | null>(null);
function useHoverContext() {
  const context = useContext(HoverContext);
  if (!context)
    throw new Error('AttachmentHoverCard children require AttachmentHoverCard');
  return context;
}
export interface AttachmentHoverCardProps extends PopoverProps {
  openDelay?: number;
  closeDelay?: number;
}
export type AttachmentHoverCardFactory = Factory<{
  props: AttachmentHoverCardProps;
  stylesNames: PopoverStylesNames;
  staticComponents: {
    Trigger: typeof AttachmentHoverCardTrigger;
    Content: typeof AttachmentHoverCardContent;
  };
}>;
export const AttachmentHoverCard = factory<AttachmentHoverCardFactory>(
  (_props) => {
    const props = useProps(
      'AttachmentHoverCard',
      { openDelay: 0, closeDelay: 0, position: 'bottom-start', offset: 4 },
      _props,
    );
    const {
      children,
      openDelay,
      closeDelay,
      opened,
      defaultOpened,
      onChange,
      onDismiss,
      ...others
    } = props;
    const [value, setValue] = useUncontrolled({
      value: opened,
      defaultValue: defaultOpened,
      finalValue: false,
      onChange,
    });
    const disabledRef = useRef(others.disabled);
    disabledRef.current = others.disabled;
    const target = useRef<HTMLElement>(null);
    const dropdown = useRef<HTMLDivElement>(null);
    const opening = useRef<ReturnType<typeof setTimeout> | undefined>(
      undefined,
    );
    const closing = useRef<ReturnType<typeof setTimeout> | undefined>(
      undefined,
    );
    const clear = () => {
      clearTimeout(opening.current);
      clearTimeout(closing.current);
      opening.current = undefined;
      closing.current = undefined;
    };
    const dismiss = () => {
      clear();
      setValue(false);
      onDismiss?.();
    };
    const enter = () => {
      clear();
      if (others.disabled || value) return;
      opening.current = setTimeout(() => {
        opening.current = undefined;
        if (!disabledRef.current) setValue(true);
      }, openDelay);
    };
    const leave = (relatedTarget?: EventTarget | null) => {
      if (
        relatedTarget instanceof Node &&
        (target.current?.contains(relatedTarget) ||
          dropdown.current?.contains(relatedTarget))
      )
        return;
      clear();
      closing.current = setTimeout(() => {
        closing.current = undefined;
        const selection = document.getSelection();
        if (
          selection &&
          !selection.isCollapsed &&
          selection.anchorNode &&
          dropdown.current?.contains(selection.anchorNode)
        )
          return;
        setValue(false);
      }, closeDelay);
    };
    useEffect(
      () => () => {
        clearTimeout(opening.current);
        clearTimeout(closing.current);
      },
      [],
    );
    useEffect(() => {
      const handler = (event: KeyboardEvent) => {
        if (
          event.key === 'Escape' &&
          !(
            event.target instanceof Node &&
            dropdown.current?.contains(event.target)
          ) &&
          !event.defaultPrevented &&
          others.closeOnEscape !== false &&
          (value || opening.current !== undefined)
        )
          dismiss();
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    });
    return (
      <HoverContext.Provider value={{ enter, leave, target, dropdown }}>
        <Popover
          {...others}
          opened={value}
          onChange={(next) => {
            clear();
            setValue(next);
          }}
          onDismiss={() => {
            clear();
            onDismiss?.();
          }}
          __staticSelector="AttachmentHoverCard"
        >
          {children}
        </Popover>
      </HoverContext.Provider>
    );
  },
);
export interface AttachmentHoverCardTriggerProps
  extends Omit<PopoverTargetProps, 'children'> {
  children: ReactNode;
}
export const AttachmentHoverCardTrigger = factory<{
  props: AttachmentHoverCardTriggerProps;
  ref: HTMLElement;
}>(({ ref, children, ...props }) => {
  const context = useHoverContext();
  const mergedRef = useMergedRef(context.target, ref);
  if (
    !isValidElement<HTMLAttributes<HTMLElement>>(children) ||
    children.type === Fragment
  )
    throw new Error(
      'AttachmentHoverCard.Trigger requires one element that forwards its ref',
    );
  const childProps = children.props;
  return (
    <Popover.Target {...props} ref={mergedRef}>
      {cloneElement(children, {
        onPointerEnter: (event) => {
          childProps.onPointerEnter?.(event);
          if (!event.defaultPrevented && event.pointerType !== 'touch')
            context.enter();
        },
        onPointerLeave: (event) => {
          childProps.onPointerLeave?.(event);
          if (!event.defaultPrevented && event.pointerType !== 'touch')
            context.leave(event.relatedTarget);
        },
        onFocus: (event) => {
          childProps.onFocus?.(event);
          if (!event.defaultPrevented) context.enter();
        },
        onBlur: (event) => {
          childProps.onBlur?.(event);
          if (!event.defaultPrevented) context.leave(event.relatedTarget);
        },
      })}
    </Popover.Target>
  );
});
export interface AttachmentHoverCardContentProps extends PopoverDropdownProps {}
export const AttachmentHoverCardContent = factory<{
  props: AttachmentHoverCardContentProps;
  ref: HTMLDivElement;
}>(({ ref, onPointerEnter, onPointerLeave, onFocus, onBlur, ...props }) => {
  const context = useHoverContext();
  const mergedRef = useMergedRef(context.dropdown, ref);
  return (
    <Popover.Dropdown
      p="xs"
      {...props}
      ref={mergedRef}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (!event.defaultPrevented && event.pointerType !== 'touch')
          context.enter();
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        if (!event.defaultPrevented && event.pointerType !== 'touch')
          context.leave(event.relatedTarget);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (!event.defaultPrevented) context.enter();
      }}
      onBlur={(event) => {
        onBlur?.(event);
        if (!event.defaultPrevented) context.leave(event.relatedTarget);
      }}
    />
  );
});
AttachmentHoverCard.displayName = 'AttachmentHoverCard';
AttachmentHoverCardTrigger.displayName = 'AttachmentHoverCard.Trigger';
AttachmentHoverCardContent.displayName = 'AttachmentHoverCard.Content';
AttachmentHoverCard.Trigger = AttachmentHoverCardTrigger;
AttachmentHoverCard.Content = AttachmentHoverCardContent;
