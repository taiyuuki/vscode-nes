module.exports = {
  root: true,
  extends: ['@taiyuuki/eslint-config-ts'],
  rules: {
    'import/no-unresolved': [
      'error',
      {
        'ignore': [
          'vscode',
        ],
      },
    ],
  },
}