class FormError extends Error {
    constructor(msg) {
        super(msg);
    }
}
class FormArgumentError extends FormError {
    path;
    step;
    current;
    constructor(path, step, current) {
        super(`Invalid path: ${path} at step: ${step} in object: ${JSON.stringify(current)}`);
        this.path = path;
        this.step = step;
        this.current = current;
    }
}

class FormArguments {
    _args = {};
    set(name, arg) {
        this._args[name] = arg;
    }
    setAll(args) {
        this._args = {
            ...this._args,
            ...args,
        };
    }
    getAll() {
        return this._args;
    }
    get(name) {
        return this._args[name];
    }
    resolvePath(path) {
        let current = this._args;
        const splitPath = path.split('.');
        for (const step of splitPath) {
            if (typeof current === 'object' && step in current) {
                current = current[step];
            }
            else {
                throw new FormArgumentError(path, step, current);
            }
        }
        return current;
    }
    resolveTemplate(template) {
        return template.replace(/\{\s*([^}\s]+)\s*\}/g, (_, p1) => {
            return this.resolvePath(p1).toString();
        });
    }
    normalize(content) {
        if (typeof content === 'string') {
            return {
                type: 'text',
                text: this.resolveTemplate(content),
            };
        }
        else if (Array.isArray(content)) {
            return {
                type: 'array',
                array: content.map((c) => this.normalize(c)),
            };
        }
        else {
            return {
                type: 'translate',
                translate: this.resolveTemplate(content.translate),
                args: content.args ? content.args.map((a) => this.normalize(a)) : undefined,
            };
        }
    }
}

class FormEventProducer {
    _hub;
    _formAction;
    _args;
    static fromFormHub(hub) {
        if (typeof hub.entrypoint === 'string') {
            return new FormEventProducer(hub, {
                form: hub.entrypoint,
            });
        }
        else {
            return new FormEventProducer(hub, {
                form: hub.entrypoint.form,
                event: hub.entrypoint.events,
                eventArgs: hub.entrypoint.eventArgs,
                setArgs: hub.entrypoint.initialArgs,
            });
        }
    }
    constructor(hub, formAction, previousArgs) {
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
            }
            else if (typeof this._formAction.event === 'string') {
                yield new FormEvent(this._hub, {
                    event: this._formAction.event,
                    args: this._formAction.eventArgs,
                }, this._args);
            }
            else {
                for (const event of this._formAction.event) {
                    yield new FormEvent(this._hub, {
                        event: event.event,
                        args: event.args ?? this._formAction.eventArgs,
                    }, this._args);
                }
            }
        }
    }
}
class FormEvent {
    _form = undefined;
    _name = undefined;
    _continueProcessing = true;
    _hub;
    _args;
    _eventArgs = [];
    constructor(hub, eventAction, args) {
        this._hub = hub;
        this._args = args;
        if (eventAction) {
            this._name = eventAction.event;
            if (eventAction.args) {
                this._eventArgs = eventAction.args;
            }
        }
    }
    loadForm(name, type) {
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
const triggerEvent = async (eventProducer, receiver) => {
    let form = eventProducer.getInitialForm();
    if (receiver) {
        for (const event of eventProducer.iterator()) {
            event.form = form;
            if (event.name) {
                if (typeof receiver === 'function') {
                    await receiver(event);
                }
                else if (event.name in receiver) {
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

const _ = (value, ...args) => ({
    translate: value,
    args: args.length > 0 ? args : undefined,
});

export { FormArgumentError, FormArguments, FormError, FormEvent, FormEventProducer, _, triggerEvent };
//# sourceMappingURL=MinecraftEventDrivenForm.js.map
