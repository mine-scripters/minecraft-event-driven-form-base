/**
 * @inline
 */
interface ToString {
    toString(): string;
}
/**
 * @inline
 */
type StringResolvableMap = {
    [key: string]: StringResolvable;
};
type StringResolvable = ToString | StringResolvableMap;
declare class FormArguments {
    private _args;
    set(name: string, arg: StringResolvable): void;
    setAll(args: Record<string, StringResolvable>): void;
    getAll(): Record<string, StringResolvable>;
    get<Arg extends StringResolvable>(name: string): Arg;
    resolvePath(path: string): StringResolvable;
    resolveTemplate(template: string): string;
    normalize(content: TextContent): NormalizedTextContent;
}
interface Translate {
    translate: string;
    args?: Array<TextContent>;
}
type TextContent = string | Translate | Array<TextContent>;
type NormalizedTextContent = {
    type: "translate";
    translate: string;
    args?: Array<string> | Array<NormalizedTextContent>;
} | {
    type: "text";
    text: string;
} | {
    type: "array";
    array: Array<NormalizedTextContent>;
};
interface EventAction {
    event: string;
    args?: Array<unknown>;
}
interface FormAction {
    form?: string;
    event?: string | Array<EventAction>;
    eventArgs?: Array<unknown>;
    setArgs?: Record<string, StringResolvable>;
    copyArgs?: boolean;
}
interface DualButtonForm {
    type: "dual-button";
    title: TextContent;
    body?: TextContent;
    topButton: DualButtonElementButton;
    bottomButton: DualButtonElementButton;
}
type DualButtonElement = DualButtonElementButton;
interface DualButtonElementButton {
    type: "button";
    text: TextContent;
    action?: FormAction;
}
interface InputForm {
    type: "input";
    title: TextContent;
    submit?: TextContent;
    elements: Array<InputElement>;
    action?: FormAction;
}
type InputValue = string | number | boolean;
type InputElement = InputElementSlider | InputElementDropdown | InputElementText | InputElementToggle;
type InputElementSlider = {
    type: "slider";
    name?: string;
    text: TextContent;
    min: number;
    max: number;
    step: number;
    defaultValue?: number;
};
type InputElementDropdown = {
    type: "dropdown";
    name?: string;
    text: TextContent;
    defaultValue?: InputValue;
    options: Array<{
        text: TextContent;
        value: InputValue;
    }>;
};
type InputElementText = {
    type: "text";
    name?: string;
    text: TextContent;
    placeholder: TextContent;
    defaultValue?: string;
};
type InputElementToggle = {
    type: "toggle";
    name?: string;
    text: TextContent;
    defaultValue?: boolean;
};
interface MultiButtonForm {
    type: "multi-button";
    title: TextContent;
    body?: TextContent;
    elements: Array<MultiButtonElement>;
}
type MultiButtonElement = MultiButtonElementButton;
interface MultiButtonElementButton {
    type: "button";
    text: TextContent;
    icon?: string;
    action?: FormAction;
}
type Form = MultiButtonForm | InputForm | DualButtonForm;
declare class FormError extends Error {
    constructor(msg: string);
}
declare class FormArgumentError extends FormError {
    readonly path: string;
    readonly step: string;
    readonly current: unknown;
    constructor(path: string, step: string, current: unknown);
}
interface Entrypoint {
    form?: string;
    events?: string | Array<EventAction>;
    eventArgs?: Array<unknown>;
    initialArgs: Record<string, StringResolvable>;
}
interface FormHub {
    entrypoint: string | Entrypoint;
    forms: Record<string, Form>;
}
declare class FormEventProducer {
    protected _hub: FormHub;
    protected _formAction: FormAction | undefined;
    protected _args: FormArguments;
    static fromFormHub(hub: FormHub): FormEventProducer;
    constructor(hub: FormHub, formAction?: FormAction, previousArgs?: FormArguments);
    get args(): FormArguments;
    getInitialForm(): Form | undefined;
    iterator(): Generator<FormEvent, void, unknown>;
}
declare class FormEvent {
    protected _form: Form | undefined;
    protected _name: string | undefined;
    protected _continueProcessing: boolean;
    protected readonly _hub: FormHub;
    protected _args: FormArguments;
    protected _eventArgs: Array<unknown>;
    constructor(hub: FormHub, eventAction: EventAction | undefined, args: FormArguments);
    loadForm(name: string): Form;
    loadForm(name: string, type: "multi-button"): MultiButtonForm;
    loadForm(name: string, type: "input"): InputForm;
    loadForm(name: string, type: "dual-button"): InputForm;
    set form(form: Form | undefined);
    get form(): Form | undefined;
    get name(): string | undefined;
    get args(): FormArguments;
    get eventArgs(): unknown[];
    get continueProcessing(): boolean;
    cancelProcessing(): void;
}
/**
 * @inline
 */
type EventReceiverFunction = (event: FormEvent) => Promise<void>;
/**
 * @inline
 */
type EventReceiverMap = Record<string, EventReceiverFunction>;
type EventReceiver = EventReceiverFunction | EventReceiverMap | undefined;
declare const triggerEvent: (eventProducer: FormEventProducer, receiver: EventReceiver) => Promise<Form | undefined>;
declare const _: (value: string, ...args: Array<TextContent>) => Translate;
export { InputForm, InputValue, InputElement, InputElementSlider, InputElementDropdown, InputElementText, InputElementToggle, MultiButtonForm, MultiButtonElement, MultiButtonElementButton, DualButtonForm, DualButtonElement, DualButtonElementButton, Form, StringResolvable, FormArguments, FormError, FormArgumentError, FormEventProducer, FormEvent, EventReceiver, triggerEvent, Entrypoint, FormHub, Translate, TextContent, NormalizedTextContent, EventAction, FormAction, _ };
