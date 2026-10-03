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
      <p>PedsQL 4.0</p>
      <p class="px-2">-</p>
      <p>مقياس جودة حياة الطفل (تقرير الطفل)</p>
    </template>
  </UHeader>
  <PedsqlRTL respondent="child" />
</template>

<script setup lang="ts">
const router = useRouter()
</script>
