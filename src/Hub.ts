import { Form } from './form';

export interface FormHub {
  entrypoint: string;
  forms: Record<string, Form>;
}
