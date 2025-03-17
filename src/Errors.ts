export class FormError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class FormArgumentError extends FormError {
  constructor(
    readonly path: string,
    readonly step: string,
    readonly current: unknown
  ) {
    super(`Invalid path: ${path} at step: ${step} in object: ${JSON.stringify(current)}`);
  }
}
