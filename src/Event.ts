import { FormError } from './Errors';
import { FormHub } from './Hub';
import { Form } from './form';
import { InputForm } from './form/Input';
import { MultiButtonForm } from './form/MultiButton';
import { FormArguments } from './Arguments';
import { FormAction } from './Primitives';

export class FormEvent {
  protected _form: Form | undefined = undefined;
  protected _name: string | undefined = undefined;
  protected _continueProcessing: boolean = true;
  protected readonly _hub: FormHub;
  protected _args: FormArguments = new FormArguments();
  protected _eventArgs: Array<unknown> = [];

  constructor(hub: FormHub, action?: FormAction, previousArgs?: FormArguments) {
    this._hub = hub;

    if (action) {
      if (action.event) {
        this._name = action.event;
      }

      if (action.form) {
        this._form = this._hub.forms[action.form];
      }

      if (action.copyArgs && previousArgs) {
        this._args.setAll(previousArgs.getAll());
      }

      if (action.eventArgs) {
        this._eventArgs = action.eventArgs;
      }
    }
  }

  loadForm(name: string): Form;
  loadForm(name: string, type: 'multi-button'): MultiButtonForm;
  loadForm(name: string, type: 'input'): InputForm;
  loadForm(name: string, type: 'dual-button'): InputForm;

  loadForm(name: string, type?: 'multi-button' | 'input' | 'dual-button'): Form {
    if (name in this._hub.forms) {
      const form = this._hub.forms[name];
      if (type && form.type !== type) {
        throw new FormError(`Invalid type ${type} for form named ${name}. The actual type is ${form.type}`);
      }

      return JSON.parse(JSON.stringify(form));
    }

    throw new FormError(`Unknown form named ${name}`);
  }

  set form(form) {
    this._form = form;
  }

  get form() {
    return this._form;
  }

  get name() {
    return this._name;
  }

  get args() {
    return this._args;
  }

  get eventArgs() {
    return this._eventArgs;
  }

  get continueProcessing() {
    return this._continueProcessing;
  }

  cancelProcessing() {
    this._continueProcessing = false;
  }
}

type EventReceiverFunction = (event: FormEvent) => Promise<void>;
type EventReceiverMap = Record<string, EventReceiverFunction>;
export type EventReceiver = EventReceiverFunction | EventReceiverMap | undefined;

export const triggerEvent = async (event: FormEvent, receiver: EventReceiver): Promise<Form | undefined> => {
  if (event.name) {
    if (receiver === undefined) {
      return;
    } else if (typeof receiver === 'function') {
      await receiver(event);
    } else {
      for (const [key, eventReceiver] of Object.entries(receiver)) {
        if (!event.continueProcessing) {
          break;
        }

        if (key === event.name) {
          await eventReceiver(event);
        }
      }
    }
  }

  return event.form;
};
