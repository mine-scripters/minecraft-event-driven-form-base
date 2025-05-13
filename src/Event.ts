import { FormError } from './Errors';
import { FormHub } from './Hub';
import { Form } from './form';
import { InputForm } from './form/Input';
import { MultiButtonForm } from './form/MultiButton';
import { FormArguments } from './Arguments';
import { EventAction, FormAction } from './Primitives';

export class FormEventProducer {
  protected _hub: FormHub;
  protected _formAction: FormAction | undefined;
  protected _args: FormArguments;

  static fromFormHub(hub: FormHub): FormEventProducer {
    if (typeof hub.entrypoint === 'string') {
      return new FormEventProducer(hub, {
        form: hub.entrypoint,
      });
    } else {
      return new FormEventProducer(hub, {
        form: hub.entrypoint.form,
        event: hub.entrypoint.events,
        eventArgs: hub.entrypoint.eventArgs,
        setArgs: hub.entrypoint.initialArgs,
      });
    }
  }

  constructor(hub: FormHub, formAction?: FormAction, previousArgs?: FormArguments) {
    this._hub = hub;
    this._formAction = formAction;
    this._args = new FormArguments();

    if (this._formAction?.copyArgs && previousArgs) {
      this._args.setAll(previousArgs.getAll());
    }

    if (this._formAction?.setArgs) {
      this._args.setAll(this._formAction.setArgs);
    }
  }

  get args() {
    return this._args;
  }

  getInitialForm() {
    return this._formAction?.form ? this._hub.forms[this._formAction.form] : undefined;
  }

  *iterator() {
    if (this._formAction) {
      if (!this._formAction.event) {
        yield new FormEvent(this._hub, undefined, this._args);
      } else if (typeof this._formAction.event === 'string') {
        yield new FormEvent(
          this._hub,
          {
            event: this._formAction.event,
            args: this._formAction.eventArgs,
          },
          this._args
        );
      } else {
        for (const event of this._formAction.event) {
          yield new FormEvent(
            this._hub,
            {
              event: event.event,
              args: event.args ?? this._formAction.eventArgs,
            },
            this._args
          );
        }
      }
    }
  }
}

export class FormEvent {
  protected _form: Form | undefined = undefined;
  protected _name: string | undefined = undefined;
  protected _continueProcessing: boolean = true;
  protected readonly _hub: FormHub;
  protected _args: FormArguments;
  protected _eventArgs: Array<unknown> = [];

  constructor(hub: FormHub, eventAction: EventAction | undefined, args: FormArguments) {
    this._hub = hub;
    this._args = args;

    if (eventAction) {
      this._name = eventAction.event;
      if (eventAction.args) {
        this._eventArgs = eventAction.args;
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

/**
 * @inline
 */
type EventReceiverFunction = (event: FormEvent) => Promise<void>;
/**
 * @inline
 */
type EventReceiverMap = Record<string, EventReceiverFunction>;
export type EventReceiver = EventReceiverFunction | EventReceiverMap | undefined;

export const triggerEvent = async (
  eventProducer: FormEventProducer,
  receiver: EventReceiver
): Promise<Form | undefined> => {
  let form: Form | undefined = eventProducer.getInitialForm();

  if (receiver) {
    for (const event of eventProducer.iterator()) {
      event.form = form;

      if (event.name) {
        if (typeof receiver === 'function') {
          await receiver(event);
        } else if (event.name in receiver) {
          await receiver[event.name](event);
        }
      }

      form = event.form;

      if (!event.continueProcessing) {
        break;
      }
    }
  }

  return form;
};
