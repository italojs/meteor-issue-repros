import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['.meteor/**', '_build/**', 'node_modules/**', 'public/build-*/**'] },
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: { '@typescript-eslint/no-floating-promises': 'error' },
  },
);
