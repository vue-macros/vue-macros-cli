<template>
  <div @click="()=> $emit('update', 2)">
    <slot name="top" v-bind="{ foo: id }" />
    <slot :id="`${id}`">{{ id }}</slot>
    <slot name="bottom" v-bind="{ foo: id }">bottom</slot>
  </div>
  
  <img>
  <div>Fragment</div>
</template>

<script setup lang="ts">
const { id } = defineProps<{ id: number }>()

defineEmits<{
  update: [id: number]
}>()

defineSlots<{
  default: (props: { id: string }) => any
  top: (props: { foo: number }) => any
  bottom: (props: { foo: number }) => any
}>()
</script>