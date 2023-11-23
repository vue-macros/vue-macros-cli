import antfu from '@antfu/eslint-config'

export default antfu({
  files: ['**/bench/**'],
  rules: {
    'no-console': 'off',
  },
})
