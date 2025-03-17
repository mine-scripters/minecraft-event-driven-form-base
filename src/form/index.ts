import { DualButtonForm } from './DualButton';
import { InputForm } from './Input';
import { MultiButtonForm } from './MultiButton';
export * from './Input';
export * from './MultiButton';
export * from './DualButton';

export type Form = MultiButtonForm | InputForm | DualButtonForm;
