/**
 * Component generator. Scaffolds a token-only @justlife/ui component with
 * stories, MDX docs, and tests, and wires the export into the package barrel.
 *
 *   pnpm new:component
 */
export default function (plop) {
  plop.setGenerator('component', {
    description: 'Scaffold a token-only @justlife/ui component (stories + docs + tests)',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name (PascalCase, e.g. Chip):',
        validate: (v) => (/^[A-Z][A-Za-z0-9]+$/.test(v) ? true : 'Use PascalCase, e.g. Chip'),
      },
      {
        type: 'input',
        name: 'purpose',
        message: 'One-line purpose:',
        default: 'TODO: describe what this component is for.',
      },
    ],
    actions: () => {
      const base = '../../packages/ui/src/components/{{pascalCase name}}';
      return [
        { type: 'add', path: `${base}/{{pascalCase name}}.tsx`, templateFile: 'templates/component.tsx.hbs' },
        { type: 'add', path: `${base}/index.ts`, templateFile: 'templates/index.ts.hbs' },
        {
          type: 'add',
          path: `${base}/{{pascalCase name}}.stories.tsx`,
          templateFile: 'templates/stories.tsx.hbs',
        },
        {
          type: 'add',
          path: `${base}/{{pascalCase name}}.docs.mdx`,
          templateFile: 'templates/docs.mdx.hbs',
        },
        { type: 'add', path: `${base}/{{pascalCase name}}.test.tsx`, templateFile: 'templates/test.tsx.hbs' },
        {
          type: 'append',
          path: '../../packages/ui/src/index.ts',
          pattern: /\/\/ Components/,
          template:
            "export { {{pascalCase name}}, type {{pascalCase name}}Props } from './components/{{pascalCase name}}';",
        },
      ];
    },
  });
}
