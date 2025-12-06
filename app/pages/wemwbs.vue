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
      <p>WEMWBS</p>
      <p class="px-2">-</p>
      <p>مقياس وارويك-إدنبرة للصحة النفسية</p>
    </template>
  </UHeader>
  <WemwbsRTL />
</template>

<script setup lang="ts">
const router = useRouter()
</script>
