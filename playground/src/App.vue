<script setup lang="ts">
import { shallowRef } from 'vue'
import Comp from './components/Comp.vue'

const list = [{ id: 1 }]
const bind = { }
const on = { submit: () => {} }
let select = $ref<{ id: number }>(list[0])
const compRef = shallowRef()
</script>

<template>
  <Comp
    v-for="i in list"
    v-if="select"
    :key="i.id"
    v-bind="bind"
    ref="compRef"
    v-model:id="i.id"
    v-loading.fullscreen.lock="true"
    v-memo="[select?.id === i.id]"
    v-on="on"
    v-on:click="alert"
    @sub-mit.prevent
    @click.once="select = i"
    @submit="alert"
    @update:model-value="select.id = $event"
  >
    <template v-slot:default="{ id }">
      <el-input>{{ id }}</el-input>
    </template>
    <template #bottom="{ foo }">
      <div>{{ `${foo}` }}</div>
    </template>
  </Comp>
</template>

<style scoped>
/* Test comment */
body {
  font-size: 14px;
}
</style>
