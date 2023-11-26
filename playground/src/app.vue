<script setup>
import Comp from './components/Comp.vue'

const list = [{ id: 1 }]
const bind = { }
const on = { submit: () => {} }
</script>

<template>
  <Comp
    v-for="i in list"
    v-if="list"
    :key="i.id"
    v-bind="bind"
    v-model:id="i.id"
    v-loading.fullscreen.lock="true"
    v-on="on"
    @click.once="alert(1)"
    @submit="alert"
  >
    <template v-slot:default="{ id }">
      <div>{{ id }}</div>
    </template>
    <template #bottom="{ foo }">
      <div>{{ foo }}</div>
    </template>
  </Comp>
</template>
