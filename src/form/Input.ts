import { FormAction, TextContent } from '../Primitives';

export interface InputForm {
  type: 'input';
  title: TextContent;
  submit?: TextContent;
  elements: Array<InputElement>;
  action?: FormAction;
}

type InputValue = string | number | boolean;

type InputElement = InputElementSlider | InputElementDropdown | InputElementText | InputElementToggle;

type InputElementSlider = {
  type: 'slider';
  name?: string;
  text: TextContent;
  min: number;
  max: number;
  step: number;
  defaultValue?: number;
};

type InputElementDropdown = {
  type: 'dropdown';
  name?: string;
  text: TextContent;
  defaultValue?: InputValue;
  options: Array<{
    text: TextContent;
    value: InputValue;
  }>;
};

type InputElementText = {
  type: 'text';
  name?: string;
  text: TextContent;
  placeholder: TextContent;
  defaultValue?: string;
};

type InputElementToggle = {
  type: 'toggle';
  name?: string;
  text: TextContent;
  defaultValue?: boolean;
};
