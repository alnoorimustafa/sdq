<template>
  <UHeader>
    <template #left>
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-heroicons-arrow-left"
        @click="router.back()"
      />
    </template>
    <template #default>
      <p>Me and My Feeling</p>
      <p class="px-2">-</p>
      <p>مقياس انا ومشاعري</p>
    </template>
  </UHeader>
  <MemyRTL />
</template>

<script setup lang="ts">
const router = useRouter()
</script>
