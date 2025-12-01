<script setup lang="ts">
import id from '@nuxt/ui/runtime/locale/id.js'
import { reactive, ref, computed } from 'vue'

/* ======================================================
   SDQ — Self Report (11–17 years)
   Scoring rules based on official SDQ documentation:
   - Reverse scored: 7, 11, 14, 21, 25
   - Subscales: Emotional, Conduct, Hyper, Peer, Prosocial
   References:
   • SDQ Self Scoring Guide (Youth) 11–17  :contentReference[oaicite:1]{index=1}
   • SDQ 4–17 Scoring Table  :contentReference[oaicite:2]{index=2}
   ====================================================== */

const questions = [
  {
    id: 1,
    text: 'I try to be nice to other people. I care about their feelings.'
  },
  { id: 2, text: 'I am restless; I cannot stay still for long.' },
  { id: 3, text: 'I get a lot of headaches, stomach-aches or sickness.' },
  { id: 4, text: 'I usually share with others, for example CDs, games, food.' },
  { id: 5, text: 'I get very angry and often lose my temper.' },
  { id: 6, text: 'I would rather be alone than with people of my age.' },
  { id: 7, text: 'I usually do as I am told.' },
  { id: 8, text: 'I worry a lot.' },
  { id: 9, text: 'I am helpful if someone is hurt, upset or feeling ill.' },
  { id: 10, text: 'I am constantly fidgeting or squirming.' },
  { id: 11, text: 'I have one good friend or more.' },
  { id: 12, text: 'I fight a lot. I can make other people do what I want.' },
  { id: 13, text: 'I am often unhappy, depressed or tearful.' },
  { id: 14, text: 'Other people my age generally like me.' },
  {
    id: 15,
    text: 'I am easily distracted; I find it difficult to concentrate.'
  },
  { id: 16, text: 'I am nervous in new situations. I easily lose confidence.' },
  { id: 17, text: 'I am kind to younger children.' },
  { id: 18, text: 'I am often accused of lying or cheating.' },
  { id: 19, text: 'Other children or young people pick on me or bully me.' },
  {
    id: 20,
    text: 'I often volunteer to help others (parents, teachers, children).'
  },
  { id: 21, text: 'I think before I do things.' },
  {
    id: 22,
    text: 'I take things that are not mine from home, school or elsewhere.'
  },
  {
    id: 23,
    text: 'I get along better with adults than with people my own age.'
  },
  { id: 24, text: 'I have many fears; I am easily scared.' },
  { id: 25, text: "I finish the work I'm doing. My attention is good." }
]

const options = [
  { label: 'Not true', value: 0 },
  { label: 'Somewhat true', value: 1 },
  { label: 'Certainly true', value: 2 }
]

const responses = reactive(
  Object.fromEntries(questions.map((q) => [q.id, null]))
)

const reverse = new Set([7, 11, 14, 21, 25])

const scoreItem = (id: number) => {
  if (id) {
    const v = responses[id]
    if (v === null) return NaN
    if (!reverse.has(id)) return v
    return v === 0 ? 2 : v === 2 ? 0 : 1
  }
}

// Subscale item groups
const emotional = [3, 8, 13, 16, 24]
const conduct = [5, 7, 12, 18, 22]
const hyper = [2, 10, 15, 21, 25]
const peer = [6, 11, 14, 19, 23]
const prosocial = [1, 4, 9, 17, 20]

// @ts-ignore
const sum = (arr: number[]) => arr.reduce((a, id) => a + scoreItem(id), 0)
// @ts-ignore

// Computed scores
const emotionalScore = computed(() => sum(emotional))
const conductScore = computed(() => sum(conduct))
const hyperScore = computed(() => sum(hyper))
const peerScore = computed(() => sum(peer))
const prosocialScore = computed(() => sum(prosocial))

const totalScore = computed(
  () =>
    emotionalScore.value +
    conductScore.value +
    hyperScore.value +
    peerScore.value
)

// Banding (Youth Self-Report) — SDQ Self categories  :contentReference[oaicite:3]{index=3}
const classify = (subscale: string, score: number) => {
  switch (subscale) {
    case 'total':
      if (score <= 14) return 'close'
      if (score <= 17) return 'slightly'
      if (score <= 19) return 'high'
      return 'very'
    case 'emotional':
      if (score <= 4) return 'close'
      if (score === 5) return 'slightly'
      if (score === 6) return 'high'
      return 'very'
    case 'conduct':
      if (score <= 3) return 'close'
      if (score === 4) return 'slightly'
      if (score === 5) return 'high'
      return 'very'
    case 'hyper':
      if (score <= 5) return 'close'
      if (score === 6) return 'slightly'
      if (score === 7) return 'high'
      return 'very'
    case 'peer':
      if (score <= 2) return 'close'
      if (score === 3) return 'slightly'
      if (score === 4) return 'high'
      return 'very'
    case 'prosocial':
      if (score >= 7) return 'close'
      if (score === 6) return 'slightly'
      if (score === 5) return 'high'
      return 'very'
    default:
      return 'close'
  }
}

const showResults = ref(false)

const allDone = computed(() => questions.every((q) => responses[q.id] !== null))

function submit() {
  if (!allDone.value) return alert('Please answer all questions.')
  showResults.value = true
}

const colorMap = {
  close: 'green',
  slightly: 'yellow',
  high: 'orange',
  very: 'red'
}
</script>

<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <h1 class="text-xl font-bold">SDQ – Self Report (11–17 years)</h1>
        <p class="text-gray-500">
          How things have been for you over the last 6 months.
        </p>
      </template>

      <div class="space-y-4">
        <div
          v-for="q in questions"
          :key="q.id"
          class="p-4 border rounded-lg bg-gray-50"
        >
          <div class="font-medium mb-2">{{ q.id }}. {{ q.text }}</div>
          <URadioGroup v-model="responses[q.id]" :items="options" />

          <!-- <URadio
            v-for="opt in options"
            :key="opt.value"
            v-model="responses[q.id]"
            :value="opt.value"
            :label="opt.label"
            class="block py-1"
          /> -->
        </div>

        <UButton color="primary" block @click="submit"> Show Results </UButton>
      </div>
    </UCard>

    <!-- RESULTS -->
    <UCard v-if="showResults" class="mt-6">
      <template #header>
        <h2 class="text-lg font-bold">Your SDQ Results</h2>
      </template>

      <div class="space-y-6">
        <!-- Total -->
        <div>
          <div class="text-md font-semibold">
            Total Difficulties: {{ totalScore }} / 40
          </div>
          <UProgress
            :model-value="totalScore"
            :max="40"
            color="primary"
            class="h-2"
          />
          <p class="text-sm mt-1 text-gray-600 capitalize">
            {{ classify('total', totalScore) }} difficulties
          </p>
        </div>

        <!-- Subscales -->
        <div
          v-for="block in [
            {
              label: 'Emotional Symptoms',
              score: emotionalScore,
              id: 'emotional'
            },
            { label: 'Conduct Problems', score: conductScore, id: 'conduct' },
            { label: 'Hyperactivity', score: hyperScore, id: 'hyper' },
            { label: 'Peer Problems', score: peerScore, id: 'peer' },
            {
              label: 'Prosocial Behaviour',
              score: prosocialScore,
              id: 'prosocial'
            }
          ]"
          :key="block.id"
        >
          <div class="font-medium">
            {{ block.label }}: {{ block.score }} / 10
          </div>

          <UProgress
            :model-value="block.score"
            :max="10"
            color="primary"
            class="h-2"
          />

          <p class="text-sm text-gray-600 capitalize">
            {{ classify(block.id, block.score) }}
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>
