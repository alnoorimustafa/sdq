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
  },
  {
    title: 'ECR-R',
    description: 'مقياس الخبرات في العلاقات الحميمة (أنماط التعلّق)',
    date: '36',
    to: '/ecrr'
  },
  {
    title: 'PedsQL 4.0 - الطفل',
    description: 'مقياس جودة حياة الطفل - تقرير الطفل',
    date: '23',
    to: '/pedsql-child'
  },
  {
    title: 'PedsQL 4.0 - الأم',
    description: 'مقياس جودة حياة الطفل - تقرير الأم / الوالدين',
    date: '23',
    to: '/pedsql-parent'
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
      :to="post.to"
    />
  </UBlogPosts>
</template>

<style></style>
