import { FormArgumentError } from './Errors';
import { NormalizedTextContent, TextContent } from './Primitives';

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

export type StringResolvable = ToString | StringResolvableMap;

export class FormArguments {
  private _args: Record<string, StringResolvable> = {};
  set(name: string, arg: StringResolvable) {
    this._args[name] = arg;
  }

  setAll(args: Record<string, StringResolvable>) {
    this._args = {
      ...this._args,
      ...args,
    };
  }

  getAll() {
    return this._args;
  }

  get<Arg extends StringResolvable>(name: string): Arg {
    return this._args[name] as Arg;
  }

  resolvePath(path: string): string {
    let current: StringResolvable = this._args;
    const splitPath = path.split('.');
    for (const step of splitPath) {
      if (typeof current === 'object' && step in current) {
        current = (current as StringResolvableMap)[step];
      } else {
        throw new FormArgumentError(path, step, current);
      }
    }

    return current.toString();
  }

  resolveTemplate(template: string) {
    return template.replace(/\{\s*([^}\s]+)\s*\}/g, (_, p1) => {
      return this.resolvePath(p1);
    });
  }

  normalize(content: TextContent): NormalizedTextContent {
    if (typeof content === 'string') {
      return {
        type: 'text',
        text: this.resolveTemplate(content),
      };
    } else if (Array.isArray(content)) {
      return {
        type: 'array',
        array: content.map((c) => this.normalize(c)),
      };
    } else {
      return {
        type: 'translate',
        translate: this.resolveTemplate(content.translate),
        args: content.args ? content.args.map((a) => this.normalize(a)) : undefined,
      };
    }
  }
}
