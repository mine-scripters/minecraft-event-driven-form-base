import { FormAction, TextContent } from '../Primitives';

export interface InputForm {
  type: 'input';
  title: TextContent;
  submit?: TextContent;
  elements: Array<InputElement>;
  action?: FormAction;
}

export type InputValue = string | number | boolean;

export type InputElement = InputElementSlider | InputElementDropdown | InputElementText | InputElementToggle;

export type InputElementSlider = {
  type: 'slider';
  name?: string;
  text: TextContent;
  min: number;
  max: number;
  step: number;
  defaultValue?: number;
};

export type InputElementDropdown = {
  type: 'dropdown';
  name?: string;
  text: TextContent;
  defaultValue?: InputValue;
  options: Array<{
    text: TextContent;
    value: InputValue;
  }>;
};

export type InputElementText = {
  type: 'text';
  name?: string;
  text: TextContent;
  placeholder: TextContent;
  defaultValue?: string;
};

export type InputElementToggle = {
  type: 'toggle';
  name?: string;
  text: TextContent;
  defaultValue?: boolean;
};
