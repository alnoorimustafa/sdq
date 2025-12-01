<template>
  <div class="sdq-app">
    <header class="sdq-header">
      <h1>Strengths and Difficulties Questionnaire (Self)</h1>
      <p class="subtitle">
        Please answer how things have been for you over the last six months.
      </p>
    </header>

    <!-- Form -->
    <form class="sdq-form" @submit.prevent="onSubmit">
      <div v-for="q in questions" :key="q.id" class="question-card">
        <div class="question-number">Question {{ q.id }}</div>
        <div class="question-text">{{ q.text }}</div>

        <div class="options">
          <label v-for="opt in answerOptions" :key="opt.value" class="option">
            <input
              type="radio"
              :name="'q-' + q.id"
              :value="opt.value"
              v-model.number="responses[q.id]"
              :disabled="showResults"
            />
            <span>{{ opt.label }}</span>
          </label>
        </div>
      </div>

      <div class="actions">
        <button type="submit" class="primary-btn">
          {{ showResults ? 'Recalculate' : 'See my results' }}
        </button>
        <p v-if="validationError" class="error">
          {{ validationError }}
        </p>
      </div>
    </form>

    <!-- Results -->
    <section v-if="showResults" class="results">
      <h2>Your scores</h2>

      <div class="scores-grid">
        <div
          class="score-card"
          :class="getBandClass('total', totalDifficulties)"
        >
          <h3>Total Difficulties</h3>
          <p class="score-value">{{ totalDifficulties }} / 40</p>
          <p class="score-band">
            {{ getBandLabel('total', totalDifficulties) }}
          </p>
        </div>

        <div
          class="score-card"
          :class="getBandClass('emotional', emotionalScore)"
        >
          <h3>Emotional Symptoms</h3>
          <p class="score-value">{{ emotionalScore }} / 10</p>
          <p class="score-band">
            {{ getBandLabel('emotional', emotionalScore) }}
          </p>
        </div>

        <div class="score-card" :class="getBandClass('conduct', conductScore)">
          <h3>Conduct Problems</h3>
          <p class="score-value">{{ conductScore }} / 10</p>
          <p class="score-band">{{ getBandLabel('conduct', conductScore) }}</p>
        </div>

        <div
          class="score-card"
          :class="getBandClass('hyperactivity', hyperScore)"
        >
          <h3>Hyperactivity</h3>
          <p class="score-value">{{ hyperScore }} / 10</p>
          <p class="score-band">
            {{ getBandLabel('hyperactivity', hyperScore) }}
          </p>
        </div>

        <div class="score-card" :class="getBandClass('peer', peerScore)">
          <h3>Peer Problems</h3>
          <p class="score-value">{{ peerScore }} / 10</p>
          <p class="score-band">{{ getBandLabel('peer', peerScore) }}</p>
        </div>

        <div
          class="score-card"
          :class="getBandClass('prosocial', prosocialScore)"
        >
          <h3>Prosocial Behaviour</h3>
          <p class="score-value">{{ prosocialScore }} / 10</p>
          <p class="score-band">
            {{ getBandLabel('prosocial', prosocialScore) }}
          </p>
        </div>
      </div>

      <p class="disclaimer">
        These scores are for screening only and do not give a diagnosis. If you
        are worried by these results, please talk to a trusted adult or
        professional.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'

type ScaleKey =
  | 'total'
  | 'emotional'
  | 'conduct'
  | 'hyperactivity'
  | 'peer'
  | 'prosocial'

type AnswerValue = 0 | 1 | 2

interface Question {
  id: number
  text: string
}

// --- Questions: SDQ Self-report 11–17, items 1–25 ---
const questions: Question[] = [
  {
    id: 1,
    text: 'I try to be nice to other people. I care about their feelings.'
  },
  { id: 2, text: 'I am restless; I cannot stay still for long.' },
  { id: 3, text: 'I get a lot of headaches, stomach-aches or sickness.' },
  { id: 4, text: 'I usually share with others, for example CDs, games, food.' },
  { id: 5, text: 'I get very angry and often lose my temper.' },
  { id: 6, text: 'I would rather be alone than with people my age.' },
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
  { id: 25, text: 'I finish the work I’m doing. My attention is good.' }
]

// Response options (data entry values 0,1,2)
const answerOptions = [
  { label: 'Not true', value: 0 },
  { label: 'Somewhat true', value: 1 },
  { label: 'Certainly true', value: 2 }
]

// Responses keyed by item id
const responses = reactive<Record<number, AnswerValue | null>>(
  Object.fromEntries(questions.map((q) => [q.id, null]))
)

const showResults = ref(false)
const validationError = ref('')

// Reverse-scored items (0→2, 1→1, 2→0)
const reverseScoredItems = new Set([7, 11, 14, 21, 25])

// Helper: get item score with reverse scoring applied
function getItemScore(id: number): number {
  const raw = responses[id]
  if (raw === null || raw === undefined) return NaN
  if (!reverseScoredItems.has(id)) return raw
  if (raw === 0) return 2
  if (raw === 2) return 0
  return 1
}

// --- Subscale composition (item ids) ---
const emotionalItems = [3, 8, 13, 16, 24]
const conductItems = [5, 7, 12, 18, 22]
const hyperItems = [2, 10, 15, 21, 25]
const peerItems = [6, 11, 14, 19, 23]
const prosocialItems = [1, 4, 9, 17, 20]

// Helper to sum a list of items (ignores missing)
function sumItems(ids: number[]): number {
  return ids.reduce((acc, id) => {
    const val = getItemScore(id)
    if (!Number.isNaN(val)) return acc + val
    return acc
  }, 0)
}

// Computed subscale scores (0–10 each)
const emotionalScore = computed(() => sumItems(emotionalItems))
const conductScore = computed(() => sumItems(conductItems))
const hyperScore = computed(() => sumItems(hyperItems))
const peerScore = computed(() => sumItems(peerItems))
const prosocialScore = computed(() => sumItems(prosocialItems))

// Total difficulties = emotional + conduct + hyper + peer (0–40)
const totalDifficulties = computed(
  () =>
    emotionalScore.value +
    conductScore.value +
    hyperScore.value +
    peerScore.value
)

// --- Banding according to SDQ self-report cut-points (4-band) ---
// From official scoring guide for 4–17 self-report. :contentReference[oaicite:2]{index=2}
function getBandLabel(scale: ScaleKey, score: number): string {
  switch (scale) {
    case 'total':
      if (score <= 14) return 'Close to average'
      if (score <= 17) return 'Slightly raised'
      if (score <= 19) return 'High'
      return 'Very high'
    case 'emotional':
      if (score <= 4) return 'Close to average'
      if (score === 5) return 'Slightly raised'
      if (score === 6) return 'High'
      return 'Very high' // 7–10
    case 'conduct':
      if (score <= 3) return 'Close to average'
      if (score === 4) return 'Slightly raised'
      if (score === 5) return 'High'
      return 'Very high' // 6–10
    case 'hyperactivity':
      if (score <= 5) return 'Close to average'
      if (score === 6) return 'Slightly raised'
      if (score === 7) return 'High'
      return 'Very high' // 8–10
    case 'peer':
      if (score <= 2) return 'Close to average'
      if (score === 3) return 'Slightly raised'
      if (score === 4) return 'High'
      return 'Very high' // 5–10
    case 'prosocial':
      // Prosocial is reversed: lower scores mean more concern
      if (score >= 7) return 'Close to average'
      if (score === 6) return 'Slightly lowered'
      if (score === 5) return 'Low'
      return 'Very low' // 0–4
  }
}

// Map band to a color class (green → yellow → orange → red)
function getBandClass(scale: ScaleKey, score: number): string {
  const label = getBandLabel(scale, score)
  if (label === 'Close to average') return 'band-ok'
  if (label === 'Slightly raised' || label === 'Slightly lowered')
    return 'band-mild'
  if (label === 'High' || label === 'Low') return 'band-high'
  return 'band-very-high' // Very high / Very low
}

// Validate all questions answered
function allAnswered(): boolean {
  return questions.every(
    (q) => responses[q.id] !== null && responses[q.id] !== undefined
  )
}

// Submit handler
function onSubmit() {
  if (!allAnswered()) {
    validationError.value =
      'Please answer all questions before seeing your results.'
    showResults.value = false
    return
  }
  validationError.value = ''
  showResults.value = true
}
</script>

<style scoped>
.sdq-app {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
  color: #111827;
}

.sdq-header {
  text-align: center;
  margin-bottom: 1rem;
}

.sdq-header h1 {
  font-size: 1.6rem;
  margin-bottom: 0.25rem;
}

.subtitle {
  font-size: 0.95rem;
  color: #4b5563;
}

.sdq-form {
  margin-top: 1rem;
}

.question-card {
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: #f9fafb;
}

.question-number {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.35rem;
}

.question-text {
  font-size: 0.95rem;
  margin-bottom: 0.7rem;
}

.options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.option {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.9rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  cursor: pointer;
}

.option input {
  cursor: pointer;
}

.actions {
  margin-top: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
}

.primary-btn {
  border: none;
  border-radius: 999px;
  padding: 0.6rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  background: linear-gradient(to right, #16a34a, #22c55e);
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
}

.primary-btn:hover {
  opacity: 0.95;
}

.error {
  color: #b91c1c;
  font-size: 0.85rem;
}

/* Results */
.results {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.results h2 {
  font-size: 1.3rem;
  margin-bottom: 0.75rem;
}

.scores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.9rem;
}

.score-card {
  border-radius: 0.9rem;
  padding: 0.9rem;
  color: #111827;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}

.score-card h3 {
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.score-value {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 0.1rem;
}

.score-band {
  font-size: 0.85rem;
}

/* Band color classes */
.band-ok {
  background: #ecfdf3;
  border-color: #bbf7d0;
}

.band-mild {
  background: #fefce8;
  border-color: #facc15;
}

.band-high {
  background: #fef3c7;
  border-color: #f97316;
}

.band-very-high {
  background: #fef2f2;
  border-color: #ef4444;
}

.disclaimer {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #4b5563;
}

@media (max-width: 640px) {
  .sdq-app {
    padding: 1rem;
  }
}
</style>
