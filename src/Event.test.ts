import { FormArguments } from './Arguments';
import { FormEvent, FormEventProducer, triggerEvent } from './Event';
import { Form } from './form';
import { FormHub } from './Hub';
import { EventAction, FormAction } from './Primitives';

const createFormHub = (): FormHub => {
  return {
    entrypoint: 'multi',
    forms: {
      multi: {
        type: 'multi-button',
        title: 'title',
        elements: [
          {
            type: 'button',
            text: 'foobar',
          },
        ],
      },
      dual: {
        type: 'dual-button',
        title: 'title',
        topButton: {
          type: 'button',
          text: 'top',
        },
        bottomButton: {
          type: 'button',
          text: 'bottom',
        },
      },
      input: {
        type: 'input',
        title: 'title',
        elements: [
          {
            type: 'toggle',
            text: 'text',
          },
        ],
      },
    },
  };
};

const createFormEvent = (eventAction?: EventAction, formArgument?: FormArguments, form?: Form) => {
  const event = new FormEvent(createFormHub(), eventAction, formArgument ?? new FormArguments());
  event.form = form;
  return event;
};

const createFormEventProducer = (formAction?: FormAction, formArgument?: FormArguments) => {
  return new FormEventProducer(createFormHub(), formAction, formArgument);
};

describe('Event', () => {
  it('FormEvent loadForm', () => {
    const formEvent = createFormEvent();

    // Equal but not the same
    expect(formEvent.loadForm('multi')).toEqual(formEvent['_hub'].forms.multi);
    expect(formEvent.loadForm('multi')).not.toBe(formEvent['_hub'].forms.multi);

    expect(formEvent.loadForm('dual')).toEqual(formEvent['_hub'].forms.dual);
    expect(formEvent.loadForm('dual')).not.toBe(formEvent['_hub'].forms.dual);

    expect(formEvent.loadForm('input')).toEqual(formEvent['_hub'].forms.input);
    expect(formEvent.loadForm('input')).not.toBe(formEvent['_hub'].forms.input);

    expect(() => formEvent.loadForm('multi', 'multi-button')).not.toThrow();
    expect(() => formEvent.loadForm('multi', 'dual-button')).toThrow();
    expect(() => formEvent.loadForm('multi', 'input')).toThrow();

    expect(() => formEvent.loadForm('dual', 'multi-button')).toThrow();
    expect(() => formEvent.loadForm('dual', 'dual-button')).not.toThrow();
    expect(() => formEvent.loadForm('dual', 'input')).toThrow();

    expect(() => formEvent.loadForm('input', 'multi-button')).toThrow();
    expect(() => formEvent.loadForm('input', 'dual-button')).toThrow();
    expect(() => formEvent.loadForm('input', 'input')).not.toThrow();
  });

  it('FormEventProducer getInitialForm', () => {
    const producer = createFormEventProducer();
    expect(producer.getInitialForm()).toEqual(undefined);
  });

  it('FormEventProducer getInitialForm from action', () => {
    const producer = createFormEventProducer({
      form: 'input',
    });
    expect(producer.getInitialForm()).toEqual(createFormHub().forms.input);
  });

  it('FormEventProducer defaults with empty args', () => {
    const producer = createFormEventProducer();
    expect(producer['_args'].getAll()).toEqual({});
  });

  it('FormEventProducer allows to set args from action', () => {
    const producer = createFormEventProducer({
      form: 'input',
      setArgs: {
        foo: '123',
        bar: '456',
      },
    });
    expect(producer['_args'].getAll()).toEqual({
      foo: '123',
      bar: '456',
    });
  });

  it('FormEventProducer allows to copy args', () => {
    const prevArgs = new FormArguments();
    prevArgs.setAll({
      foo: true,
      etc: 123,
    });

    const producer = createFormEventProducer(
      {
        form: 'input',
        copyArgs: true,
      },
      prevArgs
    );

    expect(producer['_args'].getAll()).toEqual({
      foo: true,
      etc: 123,
    });
  });

  it('FormEventProducer allows to copy and set args, copy is done before the set', () => {
    const prevArgs = new FormArguments();
    prevArgs.setAll({
      foo: true,
      etc: 123,
    });

    const producer = createFormEventProducer(
      {
        form: 'input',
        copyArgs: true,
        setArgs: {
          foo: '123',
          bar: '456',
        },
      },
      prevArgs
    );

    expect(producer['_args'].getAll()).toEqual({
      foo: '123',
      bar: '456',
      etc: 123,
    });
  });

  it('FormEventProducer iterator - no named event is a single event', () => {
    expect([
      ...createFormEventProducer({
        form: 'multi',
      }).iterator(),
    ]).toEqual([createFormEvent()]);
  });

  it('FormEventProducer iterator - using string events', () => {
    expect([
      ...createFormEventProducer({
        form: 'multi',
        event: 'foobar',
      }).iterator(),
    ]).toEqual([
      createFormEvent({
        event: 'foobar',
      }),
    ]);
  });

  it('FormEventProducer iterator - using args', () => {
    expect([
      ...createFormEventProducer({
        form: 'multi',
        event: 'foobar',
        eventArgs: ['1', '2'],
      }).iterator(),
    ]).toEqual([
      createFormEvent({
        event: 'foobar',
        args: ['1', '2'],
      }),
    ]);
  });

  it('FormEventProducer iterator - multiple events', () => {
    expect([
      ...createFormEventProducer({
        form: 'multi',
        event: [
          {
            event: 'foobar1',
            // no args
          },
          {
            event: 'foobar2',
            args: [1, 2, 3],
          },
          {
            event: 'foobar3',
          },
        ],
      }).iterator(),
    ]).toEqual([
      createFormEvent({
        event: 'foobar1',
      }),
      createFormEvent({
        event: 'foobar2',
        args: [1, 2, 3],
      }),
      createFormEvent({
        event: 'foobar3',
      }),
    ]);
  });

  it('FormEventProducer iterator - multiple events with default args if not specified', () => {
    expect([
      ...createFormEventProducer({
        form: 'multi',
        event: [
          {
            event: 'foobar1',
            // no args
          },
          {
            event: 'foobar2',
            args: [1, 2, 3],
          },
          {
            event: 'foobar3',
          },
        ],
        eventArgs: [true, false],
      }).iterator(),
    ]).toEqual([
      createFormEvent({
        event: 'foobar1',
        args: [true, false],
      }),
      createFormEvent({
        event: 'foobar2',
        args: [1, 2, 3],
      }),
      createFormEvent({
        event: 'foobar3',
        args: [true, false],
      }),
    ]);
  });

  it('trigger events calls all the events produced if they exist', async () => {
    const producer = createFormEventProducer({
      form: 'multi',
      event: [
        {
          event: 'foobar1',
          // no args
        },
        {
          event: 'foobar2',
          args: [1, 2, 3],
        },
        {
          event: 'foobar3',
        },
      ],
      eventArgs: [true, false],
    });

    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const fn3 = jest.fn();

    const next = await triggerEvent(producer, {
      foobar1: fn1,
      foobar2: fn2,
      foobar3: fn3,
    });

    expect(fn1).toHaveBeenCalledWith(
      createFormEvent(
        {
          event: 'foobar1',
          args: [true, false],
        },
        undefined,
        createFormHub().forms.multi
      )
    );

    expect(fn2).toHaveBeenCalledWith(
      createFormEvent(
        {
          event: 'foobar2',
          args: [1, 2, 3],
        },
        undefined,
        createFormHub().forms.multi
      )
    );

    expect(fn3).toHaveBeenCalledWith(
      createFormEvent(
        {
          event: 'foobar3',
          args: [true, false],
        },
        undefined,
        createFormHub().forms.multi
      )
    );

    expect(next).toEqual(createFormHub().forms.multi);
  });

  it('receiver can be a single function', async () => {
    const producer = createFormEventProducer({
      form: 'multi',
      event: [
        {
          event: 'foobar1',
          // no args
        },
        {
          event: 'foobar2',
          args: [1, 2, 3],
        },
        {
          event: 'foobar3',
        },
      ],
      eventArgs: [true, false],
    });

    const fn1 = jest.fn();

    const next = await triggerEvent(producer, fn1);

    expect(fn1).toHaveBeenCalledTimes(3);

    expect(fn1).toHaveBeenCalledWith(
      createFormEvent(
        {
          event: 'foobar1',
          args: [true, false],
        },
        undefined,
        createFormHub().forms.multi
      )
    );

    expect(fn1).toHaveBeenCalledWith(
      createFormEvent(
        {
          event: 'foobar2',
          args: [1, 2, 3],
        },
        undefined,
        createFormHub().forms.multi
      )
    );

    expect(fn1).toHaveBeenCalledWith(
      createFormEvent(
        {
          event: 'foobar3',
          args: [true, false],
        },
        undefined,
        createFormHub().forms.multi
      )
    );

    expect(next).toEqual(createFormHub().forms.multi);
  });

  it('trigger events only calls specified events', async () => {
    const producer = createFormEventProducer({
      form: 'multi',
      event: [
        {
          event: 'foobar1',
          // no args
        },
        {
          event: 'foobar3',
        },
      ],
      eventArgs: [true, false],
    });

    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const fn3 = jest.fn();

    const next = await triggerEvent(producer, {
      foobar1: fn1,
      foobar2: fn2,
      foobar3: fn3,
    });

    expect(fn1).toHaveBeenCalledWith(
      createFormEvent(
        {
          event: 'foobar1',
          args: [true, false],
        },
        undefined,
        createFormHub().forms.multi
      )
    );

    expect(fn2).not.toHaveBeenCalled();

    expect(fn3).toHaveBeenCalledWith(
      createFormEvent(
        {
          event: 'foobar3',
          args: [true, false],
        },
        undefined,
        createFormHub().forms.multi
      )
    );

    expect(next).toEqual(createFormHub().forms.multi);
  });

  it('events allows to change the next form', async () => {
    const producer = createFormEventProducer({
      form: 'multi',
      event: [
        {
          event: 'foobar1',
          // no args
        },
        {
          event: 'foobar2',
          args: [1, 2, 3],
        },
        {
          event: 'foobar3',
        },
      ],
      eventArgs: [true, false],
    });

    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const fn3 = jest.fn();

    const next = await triggerEvent(producer, {
      foobar1: async (event) => {
        fn1({ ...event });
        event.form = event.loadForm('input');
      },
      foobar2: fn2,
      foobar3: async (event) => {
        fn3({ ...event });
        event.form = event.loadForm('dual');
      },
    });

    expect(fn1).toHaveBeenCalledWith(
      createFormEvent(
        {
          event: 'foobar1',
          args: [true, false],
        },
        undefined,
        createFormHub().forms.multi
      )
    );

    expect(fn2).toHaveBeenCalledWith(
      createFormEvent(
        {
          event: 'foobar2',
          args: [1, 2, 3],
        },
        undefined,
        createFormHub().forms.input
      )
    );

    expect(fn3).toHaveBeenCalledWith(
      createFormEvent(
        {
          event: 'foobar3',
          args: [true, false],
        },
        undefined,
        createFormHub().forms.input
      )
    );

    expect(next).toEqual(createFormHub().forms.dual);
  });

  it('events allows to halt the execution', async () => {
    const producer = createFormEventProducer({
      form: 'multi',
      event: [
        {
          event: 'foobar1',
          // no args
        },
        {
          event: 'foobar2',
          args: [1, 2, 3],
        },
        {
          event: 'foobar3',
        },
      ],
      eventArgs: [true, false],
    });

    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const fn3 = jest.fn();

    const next = await triggerEvent(producer, {
      foobar1: async (event) => {
        fn1({ ...event });
        event.cancelProcessing();
      },
      foobar2: fn2,
      foobar3: fn3,
    });

    expect(fn1).toHaveBeenCalledWith(
      createFormEvent(
        {
          event: 'foobar1',
          args: [true, false],
        },
        undefined,
        createFormHub().forms.multi
      )
    );

    expect(fn2).not.toHaveBeenCalled();
    expect(fn3).not.toHaveBeenCalled();
    expect(next).toEqual(createFormHub().forms.multi);
  });

  it('entrypoint other than a string', async () => {
    const producer = FormEventProducer.fromFormHub({
      entrypoint: {
        form: 'test',
        initialArgs: {
          myVal: 4,
        },
      },
      forms: {
        test: {
          type: 'multi-button',
          title: 'myVal is: {myVal}',
          elements: [],
        },
      },
    });

    const next = await triggerEvent(producer, {});

    expect(next).toEqual({
      type: 'multi-button',
      title: 'myVal is: {myVal}',
      elements: [],
    });

    expect(producer.args.resolveTemplate('myVal is: {myVal}')).toBe('myVal is: 4');
  });
});
