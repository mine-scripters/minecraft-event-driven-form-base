import { FormArguments } from './Arguments';
import { FormArgumentError } from './Errors';

describe('Arguments.FormArguments', () => {
  it('Sets values', () => {
    const formArgs = new FormArguments();
    formArgs.set('abc', 'true');

    expect(formArgs.getAll()).toEqual({
      abc: 'true',
    });
  });

  it('Gets values', () => {
    const formArgs = new FormArguments();
    formArgs.set('abc', 'true');
    expect(formArgs.get('abc')).toEqual('true');
  });

  it('Can set multiple values', () => {
    const formArgs = new FormArguments();
    formArgs.setAll({
      abc: 'true',
      cde: 44,
      hij: false,
    });

    expect(formArgs.get('abc')).toEqual('true');
    expect(formArgs.get('cde')).toEqual(44);
    expect(formArgs.get('hij')).toEqual(false);
  });

  it('Can resolve a string path', () => {
    const formArgs = new FormArguments();
    formArgs.setAll({
      simple: '123',
      first: {
        second: '456',
      },
      complex: {
        more: {
          stuff: {
            here: '789',
          },
        },
        branch: {
          here: 'foobar',
        },
      },
    });

    expect(formArgs.resolvePath('simple')).toBe('123');
    expect(formArgs.resolvePath('first.second')).toBe('456');
    expect(formArgs.resolvePath('complex.more.stuff.here')).toBe('789');
    expect(formArgs.resolvePath('complex.branch.here')).toBe('foobar');

    // or objects
    expect(formArgs.resolvePath('first')).toEqual({
      second: '456',
    });
    expect(formArgs.resolvePath('complex')).toEqual({
      more: {
        stuff: {
          here: '789',
        },
      },
      branch: {
        here: 'foobar',
      },
    });
  });

  it('Throws if it can not resolve a path', () => {
    const formArgs = new FormArguments();
    formArgs.setAll({
      simple: '123',
      first: {
        second: '456',
      },
      complex: {
        more: {
          stuff: {
            here: '789',
          },
        },
        branch: {
          here: 'foobar',
        },
      },
    });

    expect(() => formArgs.resolvePath('not.here')).toThrow(FormArgumentError);
    expect(() => formArgs.resolvePath('first.third')).toThrow(FormArgumentError);
    expect(() => formArgs.resolvePath('complex.more.typo')).toThrow(FormArgumentError);
  });

  it('Can resolve template', () => {
    const formArgs = new FormArguments();
    formArgs.setAll({
      simple: '123',
      first: {
        second: '456',
      },
      complex: {
        more: {
          stuff: {
            here: '789',
          },
        },
        branch: {
          here: 'foobar',
        },
      },
    });

    expect(formArgs.resolveTemplate('nothing to resolve')).toBe('nothing to resolve');
    expect(formArgs.resolveTemplate('hello {simple}')).toBe('hello 123');
    expect(formArgs.resolveTemplate('hello {simple} - how {first.second} and {complex.more.stuff.here}')).toBe(
      'hello 123 - how 456 and 789'
    );
  });

  it('Throws if resolving a template with an invalid path', () => {
    const formArgs = new FormArguments();
    expect(() => formArgs.resolveTemplate('hello {bad}')).toThrow(FormArgumentError);
  });

  it('Can normalize input by resolving what is needed', () => {
    const formArgs = new FormArguments();
    formArgs.setAll({
      simple: '123',
      first: {
        second: '456',
      },
      complex: {
        more: {
          stuff: {
            here: '789',
          },
        },
        branch: {
          here: 'foobar',
        },
      },
    });

    expect(formArgs.normalize('hello {simple}')).toEqual({
      type: 'text',
      text: 'hello 123',
    });

    expect(
      formArgs.normalize({
        translate: 'hello {first.second}',
        args: ['1', '{simple}'],
      })
    ).toEqual({
      type: 'translate',
      translate: 'hello 456',
      args: [
        {
          type: 'text',
          text: '1',
        },
        {
          type: 'text',
          text: '123',
        },
      ],
    });

    expect(
      formArgs.normalize([
        'hello {simple}',
        'how are {first.second}',
        ['nesting'],
        {
          translate: 'hello {complex.more.stuff.here}',
          args: [
            ['hello', 'world'],
            {
              translate: 'messy {simple}',
              args: ['1', '2'],
            },
          ],
        },
      ])
    ).toEqual({
      type: 'array',
      array: [
        {
          type: 'text',
          text: 'hello 123',
        },
        {
          type: 'text',
          text: 'how are 456',
        },
        {
          type: 'array',
          array: [
            {
              type: 'text',
              text: 'nesting',
            },
          ],
        },
        {
          type: 'translate',
          translate: 'hello 789',
          args: [
            {
              type: 'array',
              array: [
                {
                  type: 'text',
                  text: 'hello',
                },
                {
                  type: 'text',
                  text: 'world',
                },
              ],
            },
            {
              type: 'translate',
              translate: 'messy 123',
              args: [
                {
                  type: 'text',
                  text: '1',
                },
                {
                  type: 'text',
                  text: '2',
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
