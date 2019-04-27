// if you modify the eslint rules, make sure Prettier will format the code in a way that
// doesn't break these rules.  See .prettierrc

module.exports = {
  extends: 'airbnb',
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 9,
    sourceType: 'module',
  },
  rules: {
    'no-console': 0,
    'class-methods-use-this': 0,
    'prefer-destructuring': 0,
    'max-len': 0,
    'no-param-reassign': 0,
    'no-unused-vars': 0,
    'no-await-in-loop': 0,
    'consistent-return': 0,
    'object-curly-newline': 0,
    'operator-linebreak': 0,
    'arrow-body-style': 0,
    'arrow-parens': [2, 'always'],
    'react/jsx-filename-extension': 0,
    'react/prop-types': 0,
    'react/sort-comp': 0,
    'react/destructuring-assignment': 0,
    'global-require': 0,
    'import/no-dynamic-require': 0,
    'no-use-before-define': 0,
    'no-useless-concat': 0,
    'react/no-array-index-key': 0,
  },
};
