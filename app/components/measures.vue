<script setup>
const posts = ref([
  {
    title: 'SDQ',
    description: 'مقياس نقاط القوة والصعوبات',
    date: '25',
    to: '/sdq'
  },
  {
    title: 'WEMWBS',
    description: 'مقياس وارويك-إدنبرة للصحة العقلية',
    date: '14',
    to: '/wemwbs'
  },
  {
    title: 'Me & My Feelings',
    description: 'مقياس انا ومشاعري',
    date: '16',
    to: '/memy'
  }
])
</script>

<template>
  <UBlogPosts :posts="posts">
    <UBlogPost
      :ui="{ title: 'text-emerald-500' }"
      v-for="post in posts"
      :key="post.title"
      :title="post.title"
      :date="post.date"
      :description="post.description"
    />
  </UBlogPosts>
</template>

<style></style>
