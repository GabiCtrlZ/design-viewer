module.exports = {
  plugins: [
    'filenames',
    'no-loops',
    'promise',
  ],
  extends: [
    'airbnb-base',
    'eslint:recommended',
    'plugin:promise/recommended',
  ],
  rules: {
    'react/jsx-filename-extension': [0],
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': ['error'],
    'import/order': [
      'error',
      {
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        },
        'groups': [
          ['builtin', 'external'],
          ['internal', 'parent', 'sibling', 'index']
        ],
        'newlines-between': 'always'
      }
    ],
    'filenames/match-regex': [2, '^[a-z-.]+$', true],
    'max-len': 'off',
    'no-underscore-dangle': [2, { allow: ['_id', '_parsedOriginalUrl', '_parsedUrl'] }],
    'no-unexpected-multiline': 'error',
    'no-duplicate-imports': 'error',
    'require-await': 'error',
    'newline-after-var': 'error',
    'newline-before-return': 'error',
    'linebreak-style': 0,
    'no-loops/no-loops': 2,
    'object-curly-newline': ['error', {
      ObjectExpression: { minProperties: 4, multiline: true, consistent: true },
      ObjectPattern: { minProperties: 4, multiline: true, consistent: true },
      ImportDeclaration: { minProperties: 4, multiline: true, consistent: true },
      ExportDeclaration: { minProperties: 4, multiline: true, consistent: true },
    }],
    'semi': ['error', 'never'],
  },
  env: {
    browser: true,
    node: true,
    webextensions: true
},
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
}
