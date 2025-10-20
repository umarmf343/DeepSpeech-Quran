import { FlatCompat } from '@eslint/eslintrc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'DeepSpeech/**',
      'quranic-universal-library-main/**',
      'lib/**',
      'public/**',
      'styles/**',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@next/next/no-page-custom-font': 'off',
      '@next/next/no-img-element': 'off',
      'import/no-anonymous-default-export': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
];
