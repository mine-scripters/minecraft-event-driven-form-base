import { Form } from './form';
import { EventAction } from './Primitives';

export interface Entrypoint {
  form?: string;
  events?: string | Array<EventAction>;
  eventArgs?: Array<unknown>;
}

export interface FormHub {
  entrypoint: string | Entrypoint;
  forms: Record<string, Form>;
}
