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
        return current.toString();
    }
    resolveTemplate(template) {
        return template.replace(/\{\s*([^}\s]+)\s*\}/g, (_, p1) => {
            return this.resolvePath(p1);
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

class FormEvent {
    _form = undefined;
    _name = undefined;
    _continueProcessing = true;
    _hub;
    _args = new FormArguments();
    _eventArgs = [];
    constructor(hub, action, previousArgs) {
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
const triggerEvent = async (event, receiver) => {
    if (event.name) {
        if (receiver === undefined) {
            return;
        }
        else if (typeof receiver === 'function') {
            await receiver(event);
        }
        else {
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

const _ = (value, ...args) => ({
    translate: value,
    args: args.length > 0 ? args : undefined,
});

export { FormArgumentError, FormArguments, FormError, FormEvent, _, triggerEvent };
//# sourceMappingURL=MinecraftEventDrivenForm.js.map
