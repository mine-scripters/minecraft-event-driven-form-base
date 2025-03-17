import { FormAction, TextContent } from '../Primitives';

export interface DualButtonForm {
  type: 'dual-button';
  title: TextContent;
  body?: TextContent;
  topButton: DualButtonElementButton;
  bottomButton: DualButtonElementButton;
}

export type DualButtonElement = DualButtonElementButton;

export interface DualButtonElementButton {
  type: 'button';
  text: TextContent;
  action?: FormAction;
}
