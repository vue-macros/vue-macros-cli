import { defineConfig } from 'vite'
import VueMacros from 'unplugin-vue-macros/vite'
import Vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

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
          include: [/\.vue$/, /\.setup\.[cm]?[jt]sx?$/],
          script: {
            propsDestructure: true,
          },
        }),
        vueJsx: vueJsx({
          transformOn: true
        }),
      },
    }),

  ],
})
