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
interface FormAction {
    form?: string;
    event?: string;
    eventArgs?: Array<unknown>;
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
    resolvePath(path: string): string;
    resolveTemplate(template: string): string;
    normalize(content: TextContent): NormalizedTextContent;
}
declare class FormError extends Error {
    constructor(msg: string);
}
declare class FormArgumentError extends FormError {
    readonly path: string;
    readonly step: string;
    readonly current: unknown;
    constructor(path: string, step: string, current: unknown);
}
interface FormHub {
    entrypoint: string;
    forms: Record<string, Form>;
}
declare class FormEvent {
    protected _form: Form | undefined;
    protected _name: string | undefined;
    protected _continueProcessing: boolean;
    protected readonly _hub: FormHub;
    protected _args: FormArguments;
    protected _eventArgs: Array<unknown>;
    constructor(hub: FormHub, action?: FormAction, previousArgs?: FormArguments);
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
declare const triggerEvent: (event: FormEvent, receiver: EventReceiver) => Promise<Form | undefined>;
declare const _: (value: string, ...args: Array<TextContent>) => Translate;
export { InputForm, InputValue, InputElement, InputElementSlider, InputElementDropdown, InputElementText, InputElementToggle, MultiButtonForm, MultiButtonElement, MultiButtonElementButton, DualButtonForm, DualButtonElement, DualButtonElementButton, Form, StringResolvable, FormArguments, FormError, FormArgumentError, FormEvent, EventReceiver, triggerEvent, FormHub, Translate, TextContent, NormalizedTextContent, FormAction, _ };
