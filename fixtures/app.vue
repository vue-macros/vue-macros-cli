<script setup lang="tsx">
const list = 4
const bind = { }
const on = { submit: () => {} }
</script>

<template>
  <Comp 
    v-if="list"
    v-for="i in list" 
    :key="i" 
    v-bind="bind"
    v-on="on"
  > 
    <template v-slot="{ id }">
      <div>{{ id }}</div>
    </template>
    <template #bottom="{ foo }">
      <div>{{ foo }}</div>
    </template>
  </Comp>
</template>