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

export interface FormAction {
  form?: string;
  event?: string;
  eventArgs?: Array<unknown>;
  copyArgs?: boolean;
}
