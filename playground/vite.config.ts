import VueJsx from '@vitejs/plugin-vue-jsx'
import Vue from '@vitejs/plugin-vue'
import VueMacros from 'unplugin-vue-macros/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    VueMacros({
      setupSFC: true,
      defineRender: true,
      defineSlots: true,
      exportRender: true,
      reactivityTransform: true,

      plugins: {
        vue: Vue({
          script: {
            propsDestructure: true,
          },
        }),

        vueJsx: VueJsx(),
      },
    }),
  ],
})