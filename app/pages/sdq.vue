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
      <p>SDQ</p>
      <p class="px-2">-</p>
      <p>استبيان نقاط القوة والصعوبات (نسخة ذاتية)</p>
    </template>
  </UHeader>
  <SdqSelfFormRTL />
</template>

<script setup lang="ts">
const router = useRouter()
</script>
