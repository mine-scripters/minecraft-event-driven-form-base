import { TextContent, Translate } from './Primitives';

export const _ = (value: string, ...args: Array<TextContent>): Translate => ({
  translate: value,
  args: args.length > 0 ? args : undefined,
});
