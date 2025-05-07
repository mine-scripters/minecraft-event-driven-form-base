import { StringResolvable } from './Arguments';

export interface Translate {
  translate: string;
  args?: Array<TextContent>;
}

export type TextContent = string | Translate | Array<TextContent>;

export type NormalizedTextContent =
  | {
      type: 'translate';
      translate: string;
      args?: Array<string> | Array<NormalizedTextContent>;
    }
  | {
      type: 'text';
      text: string;
    }
  | {
      type: 'array';
      array: Array<NormalizedTextContent>;
    };

export interface EventAction {
  event: string;
  args?: Array<unknown>;
}

export interface FormAction {
  form?: string;

  event?: string | Array<EventAction>;
  eventArgs?: Array<unknown>;

  setArgs?: Record<string, StringResolvable>;
  copyArgs?: boolean;
}
