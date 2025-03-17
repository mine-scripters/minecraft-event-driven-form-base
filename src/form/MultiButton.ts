import { FormAction, TextContent } from '../Primitives';

export interface MultiButtonForm {
  type: 'multi-button';
  title: TextContent;
  body?: TextContent;
  elements: Array<MultiButtonElement>;
}

export type MultiButtonElement = MultiButtonElementButton;

export interface MultiButtonElementButton {
  type: 'button';
  text: TextContent;
  icon?: string;
  action?: FormAction;
}
