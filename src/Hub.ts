import { StringResolvable } from './Arguments';
import { Form } from './form';
import { EventAction } from './Primitives';

export interface Entrypoint {
  form?: string;
  events?: string | Array<EventAction>;
  eventArgs?: Array<unknown>;
  initialArgs?: Record<string, StringResolvable>;
}

export interface FormHub {
  entrypoint: string | Entrypoint;
  forms: Record<string, Form>;
}
