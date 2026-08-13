import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import justlife from 'eslint-plugin-justlife';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/generated/**',
      '**/*.generated.ts',
      '**/storybook-static/**',
      '**/.turbo/**',
      '**/node_modules/**',
      '**/*.config.js',
      '**/*.config.cjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // System integrity: components and patterns may only use design tokens,
    // never raw colour/size literals. This is the code-level expression of the
    // "no arbitrary values" governance rule.
    files: ['packages/ui/**/*.{ts,tsx}', 'packages/patterns/**/*.{ts,tsx}'],
    plugins: { justlife },
    rules: {
      'justlife/no-raw-values': 'error',
    },
  },
  {
    // A horizontal scroller spans the full width and pads its CONTENT — never its box, and never via a
    // padded wrapper. Applies to screens and the app hosts too: this is a layout mistake, not a token one.
    files: ['packages/**/*.{ts,tsx}', 'apps/**/*.{ts,tsx}'],
    plugins: { justlife },
    rules: {
      'justlife/scroller-gutter-inside': 'error',
    },
  },
  {
    // Tests, stories, and shared SCREEN compositions: screens assemble components into full pages and
    // legitimately need placeholder/overlay raw values (green "missing artwork" blocks, white-over-media,
    // status-bar insets) that aren't design tokens — the no-raw-values rule targets reusable components.
    files: ['**/*.test.{ts,tsx}', '**/*.stories.{ts,tsx}', '**/*.mjs', 'packages/ui/src/screens/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'justlife/no-raw-values': 'off',
    },
  },
  {
    // The Slack bot is a Node service, not DS source: it talks to SDKs whose payload types it reads
    // defensively, so `any` is the honest annotation there rather than a fiction.
    files: ['prototyper-bot/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    // Node-side scripts (build/import/tools/eslint plugin): provide Node globals.
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        module: 'writable',
        require: 'readonly',
        exports: 'writable',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        globalThis: 'readonly',
      },
    },
  },
);
