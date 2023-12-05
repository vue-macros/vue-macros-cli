import antfu from '@antfu/eslint-config'

export default antfu(
  {
    typescript: true,
    vue: true,
    overrides: {
      vue: {
        'vue/no-export-in-script-setup': 'off',
        'vue/no-use-v-if-with-v-for': 'off',
        'vue/v-slot-style': 'off',
      },
      typescript: {
        'no-console': 'off',
      },
      yaml: {
        'yaml/indent': 'off',
      },
    },
  },
)
