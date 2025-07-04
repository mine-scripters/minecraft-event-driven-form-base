import { FormAction, TextContent } from '../Primitives';
import { UIElement } from './UIElement';

export interface MultiButtonForm {
  type: 'multi-button';
  title: TextContent;
  body?: TextContent;
  elements: Array<MultiButtonElement>;
}

export type MultiButtonElement = MultiButtonElementButton | UIElement;

export interface MultiButtonElementButton {
  type: 'button';
  text: TextContent;
  icon?: string;
  action?: FormAction;
}
