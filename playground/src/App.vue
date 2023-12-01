<script setup lang="ts">
import Comp from './components/Comp.vue'

const list = [{ id: 1 }]
const bind = { }
const on = { submit: () => {} }
const select = $ref<{ id: number }>(list[0])
</script>

<template>
  <Comp
    v-for="i in list"
    v-if="select"
    :key="i.id"
    v-bind="bind"
    v-model:id="i.id"
    v-loading.fullscreen.lock="true"
    v-memo="[select?.id === i.id]"
    v-on="on"
    @click.once="select = i"
    @submit="alert"
    @update="select.id = $event"
  >
    <template v-slot:default="{ id }">
      <div>{{ id }}</div>
    </template>
    <template #bottom="{ foo }">
      <div>{{ `${foo}` }}</div>
    </template>
  </Comp>
</template>
