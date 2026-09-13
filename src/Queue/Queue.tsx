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
import classes from './Queue.module.css';
import {
  QueueItem,
  QueueItemAction,
  QueueItemActions,
  QueueItemAttachment,
  QueueItemContent,
  QueueItemDescription,
  QueueItemFile,
  QueueItemImage,
  QueueItemIndicator,
} from './QueueItems';
import { QueueList } from './QueueList';
import {
  QueueSection,
  QueueSectionContent,
  QueueSectionLabel,
  QueueSectionTrigger,
} from './QueueSection';
export interface QueueMessagePart {
  type: string;
  text?: string;
  url?: string;
  filename?: string;
  mediaType?: string;
}
export interface QueueMessage {
  id: string;
  parts: QueueMessagePart[];
}
export interface QueueTodo {
  id: string;
  title: string;
  description?: string;
  status?: 'pending' | 'completed';
}
export interface QueueProps
  extends PaperProps,
    ElementProps<'div', keyof PaperProps> {}
export type QueueFactory = Factory<{
  props: QueueProps;
  ref: HTMLDivElement;
  stylesNames: 'root';
  vars: PaperCssVariables;
  staticComponents: {
    Item: typeof QueueItem;
    ItemAction: typeof QueueItemAction;
    ItemActions: typeof QueueItemActions;
    ItemAttachment: typeof QueueItemAttachment;
    ItemContent: typeof QueueItemContent;
    ItemDescription: typeof QueueItemDescription;
    ItemFile: typeof QueueItemFile;
    ItemImage: typeof QueueItemImage;
    ItemIndicator: typeof QueueItemIndicator;
    List: typeof QueueList;
    Section: typeof QueueSection;
    SectionContent: typeof QueueSectionContent;
    SectionLabel: typeof QueueSectionLabel;
    SectionTrigger: typeof QueueSectionTrigger;
  };
}>;
export const Queue = factory<QueueFactory>(({ ref, ..._props }) => {
  const props = useProps(
    'Queue',
    { withBorder: true, radius: 'lg', shadow: 'xs', px: 'sm', py: 'xs' },
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
  const getStyles = useStyles<QueueFactory>({
    name: 'Queue',
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
    <Paper {...others} {...getStyles('root')} ref={ref} unstyled={unstyled} />
  );
});
Queue.displayName = 'Queue';
Queue.classes = classes;
Queue.Item = QueueItem;
Queue.ItemAction = QueueItemAction;
Queue.ItemActions = QueueItemActions;
Queue.ItemAttachment = QueueItemAttachment;
Queue.ItemContent = QueueItemContent;
Queue.ItemDescription = QueueItemDescription;
Queue.ItemFile = QueueItemFile;
Queue.ItemImage = QueueItemImage;
Queue.ItemIndicator = QueueItemIndicator;
Queue.List = QueueList;
Queue.Section = QueueSection;
Queue.SectionContent = QueueSectionContent;
Queue.SectionLabel = QueueSectionLabel;
Queue.SectionTrigger = QueueSectionTrigger;
