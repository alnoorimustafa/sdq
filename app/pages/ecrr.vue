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
      <p>ECR-R</p>
      <p class="px-2">-</p>
      <p>مقياس الخبرات في العلاقات الحميمة</p>
    </template>
  </UHeader>
  <EcrrRTL />
</template>

<script setup lang="ts">
const router = useRouter()
</script>
