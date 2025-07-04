import { TextContent } from '../Primitives';

export interface Divider {
  type: 'divider';
}

export interface Label {
  type: 'label';
  text: TextContent;
}

export interface Header {
  type: 'header';
  text: TextContent;
}

export type UIElement = Divider | Label | Header;
