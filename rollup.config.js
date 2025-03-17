const ts = require('rollup-plugin-ts');

module.exports = [
  {
    input: 'src/index.ts',
    external: [],
    output: {
      file: 'dist/MinecraftEventDrivenForm.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      ts({
        tsconfig: (resolvedOptions) => ({
          ...resolvedOptions,
        }),
      }),
    ],
  },
];
