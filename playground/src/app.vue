<script setup lang="tsx">
import Comp from './components/Comp.vue'

const list = [{ id: 1 }]
const bind = { }
const on = { submit: () => {} }
</script>

<template>
  <Comp
    v-for="i in list"
    v-if="list"
    :key="i"
    v-bind="bind"
    v-on="on"
  >
    <template #default="{ id }">
      <div>{{ id }}</div>
    </template>
    <template #bottom="{ foo }">
      <div>{{ foo }}</div>
    </template>
  </Comp>
</template>
