import { _ } from './Translate';

describe('Translate', () => {
  it('_ creates a Translate', () => {
    expect(_('hello')).toEqual({
      translate: 'hello',
    });
  });

  it('_ accepts arguments', () => {
    expect(_('hello', '\n', '\n\n')).toEqual({
      translate: 'hello',
      args: ['\n', '\n\n'],
    });
  });

  it('_ can be nested', () => {
    expect(_('hello', _('arg1'), _('arg2', 'with-arg'))).toEqual({
      translate: 'hello',
      args: [
        {
          translate: 'arg1',
        },
        {
          translate: 'arg2',
          args: ['with-arg'],
        },
      ],
    });
  });
});
