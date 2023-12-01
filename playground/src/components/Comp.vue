<template>
  <div @click="()=> $emit('update', 2)">
    <slot :id="`${id}`"/>
    <slot name="bottom" v-bind="{ foo: id }" />
  </div>
</template>

<script setup lang="ts">
const { id } = defineProps<{ id: number }>()

defineEmits<{
  update: [id: number]
}>()

defineSlots<{
  default: (props: { id: string }) => any
  bottom: (props: { foo: number }) => any
}>()
</script>