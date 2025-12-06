<template>
  <UContainer class="m-my-app my-10">
    <div class="text-center">
      <p class="dark:text-neutral-400 text-sm">
        أدناه بعض الجمل حول ما تشعر به. لكل جملة، يرجى وضع علامة في المربع الذي
        يصف شعورك.
      </p>
    </div>

    <div dir="ltr" class="text-left my-4">
      <UColorModeSwitch />
    </div>

    <UCard class="mb-4 shadow">
      <template #default>
        <div class="space-y-4">
          <div>
            <label class="block mb-2 font-medium">الاسم</label>
            <UInput
              v-model="userName"
              class="w-full"
              placeholder="اكتب اسمك هنا"
            />
          </div>

          <div>
            <label class="block w-full mb-2 font-medium">سنة الميلاد</label>
            <UInput
              v-model="birthYear"
              class="w-full"
              type="number"
              placeholder="مثال: 2015"
            />
          </div>

          <div>
            <label class="block mb-2 font-medium">الجنس</label>
            <URadioGroup
              v-model="sex"
              class="w-full"
              variant="table"
              :items="[
                { label: 'ذكر', value: 'ذكر' },
                { label: 'أنثى', value: 'أنثى' }
              ]"
            />
          </div>
        </div>
      </template>
    </UCard>

    <form class="m-my-form" @submit.prevent="handleSubmit">
      <UCard v-for="q in questions" :key="q.id" class="mb-4 shadow">
        <template #default>
          <div>
            <p class="font-medium">{{ q.id }} - {{ q.text }}</p>
          </div>
        </template>
        <template #footer>
          <div class="options">
            <URadioGroup
              v-model="responses[q.id]"
              :items="answerOptions"
              variant="table"
              indicator="end"
              class="w-full"
              size="md"
            />
          </div>
        </template>
      </UCard>

      <div class="actions">
        <button v-if="!showResults" type="submit" class="primary-btn linear-g">
          عرض نتائجي
        </button>

        <button
          v-else
          type="button"
          class="primary-btn linear-r"
          @click="resetForm"
        >
          إعادة الحساب
        </button>

        <p v-if="validationError" class="error">
          {{ validationError }}
        </p>
      </div>
    </form>

    <!-- Results -->
    <section v-if="showResults" class="results">
      <h2>النتيجة</h2>

      <div class="scores-grid">
        <!-- Emotional Scale -->
        <div
          class="score-card"
          :class="getBandClass('emotional', emotionalScore)"
        >
          <h3>المشاعر (Emotional)</h3>
          <p class="score-value">{{ emotionalScore }} / 20</p>
          <p class="score-band">
            {{ getInterpretation('emotional', emotionalScore) }}
          </p>
        </div>

        <!-- Behavioral Scale -->
        <div
          class="score-card"
          :class="getBandClass('behavioral', behavioralScore)"
        >
          <h3>السلوك (Behavioral)</h3>
          <p class="score-value">{{ behavioralScore }} / 12</p>
          <p class="score-band">
            {{ getInterpretation('behavioral', behavioralScore) }}
          </p>
        </div>
      </div>

      <p class="mt-8 text-neutral-500 text-xs text-justify">
        هذه النتائج أولية ولا تعتبر تشخيصاً طبياً. الدرجات المرتفعة قد تشير إلى
        وجود صعوبات تتطلب الانتباه.
      </p>
    </section>
  </UContainer>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'

const router = useRouter()
const userName = ref('')
const birthYear = ref('')
const sex = ref('')

const resetForm = () => {
  // Reset responses
  for (const key in responses) {
    responses[Number(key)] = undefined
  }
  showResults.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

interface Question {
  id: number
  text: string
  reverse?: boolean
}

const questions: Question[] = [
  // Emotional Items (1-10)
  { id: 1, text: 'أشعر بالوحدة' },
  { id: 2, text: 'أبكي كثيراً' },
  { id: 3, text: 'أنا غير سعيد' },
  { id: 4, text: 'لا أحد يحبني' },
  { id: 5, text: 'أقلق كثيراً' },
  { id: 6, text: 'لدي مشاكل في النوم' },
  { id: 7, text: 'أستيقظ في الليل' },
  { id: 8, text: 'أنا خجول' },
  { id: 9, text: 'أشعر بالخوف' },
  { id: 10, text: 'أقلق عندما أكون في المدرسة' },

  // Behavioral Items (11-16)
  { id: 11, text: 'أغضب جداً' },
  { id: 12, text: 'أفقد أعصابي' },
  { id: 13, text: 'أضرب عندما أغضب' },
  { id: 14, text: 'أفعل أشياء تؤذي الناس' },
  { id: 15, text: 'أنا هادئ', reverse: true },
  { id: 16, text: 'أكسر الأشياء عمداً' }
]

const answerOptions = [
  { label: 'أبداً', value: 0 },
  { label: 'أحياناً', value: 1 },
  { label: 'دائماً', value: 2 }
]

const responses = reactive<Record<number, number | undefined>>(
  Object.fromEntries(questions.map((q) => [q.id, undefined]))
)

const showResults = ref(false)
const validationError = ref('')

// Scoring logic
function getItemScore(q: Question): number {
  const val = responses[q.id]
  if (val === undefined) return 0
  if (q.reverse) {
    // 0->2, 1->1, 2->0
    if (val === 0) return 2
    if (val === 2) return 0
    return 1
  }
  return val
}

const emotionalItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const behavioralItems = [11, 12, 13, 14, 15, 16]

const emotionalScore = computed(() => {
  return questions
    .filter((q) => emotionalItems.includes(q.id))
    .reduce((sum, q) => sum + getItemScore(q), 0)
})

const behavioralScore = computed(() => {
  return questions
    .filter((q) => behavioralItems.includes(q.id))
    .reduce((sum, q) => sum + getItemScore(q), 0)
})

// Interpretation Helpers
// Note: Cut-off scores for M&MF are not standard across all populations without norm tables.
// We will use simple thresholds for feedback:
// Emotional (20 max): High concern if > 10?
// Behavioral (12 max): High concern if > 6?
// For now, let's stick to a generic "green/orange" approach based on percentage or raw guess until user refines.
// Let's assume lower is better.

function getInterpretation(
  scale: 'emotional' | 'behavioral',
  score: number
): string {
  if (scale === 'emotional') {
    if (score >= 12) return 'مرتفع'
    if (score >= 8) return 'متوسط'
    return 'طبيعي'
  } else {
    // behavioral
    if (score >= 7) return 'مرتفع'
    if (score >= 4) return 'متوسط'
    return 'طبيعي'
  }
}

function getBandClass(
  scale: 'emotional' | 'behavioral',
  score: number
): string {
  const interp = getInterpretation(scale, score)
  if (interp === 'مرتفع') return 'band-high' // Orange/Red
  if (interp === 'متوسط') return 'band-mild' // Yellow
  return 'band-ok' // Green
}

function allAnswered(): boolean {
  return questions.every(
    (q) => responses[q.id] !== undefined && responses[q.id] !== null
  )
}

function handleSubmit() {
  if (!allAnswered()) {
    validationError.value = 'من فضلك أجب عن جميع الأسئلة قبل عرض النتائج.'
    showResults.value = false
    return
  }
  validationError.value = ''
  showResults.value = true
}
</script>

<style scoped>
.m-my-app {
  font-family: 'Noto Kufi Arabic', 'Scheherazade New', 'Amiri',
    'Noto Sans Arabic', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
  direction: rtl;
  text-align: right;
}

.m-my-form {
  margin-top: 1rem;
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
  width: 100%;
  margin-top: 1rem;
  border-radius: 999px;
  padding: 0.8rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
}

.linear-g {
  background: linear-gradient(to left, #16a34a, #22c55e);
}

.linear-r {
  background: linear-gradient(to left, #fac130, #ffa928);
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
  text-align: center;
}

.score-card h3 {
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.score-value {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.1rem;
}

.score-band {
  font-size: 1rem;
  font-weight: 500;
}

/* Band color classes copied from Wemwbs/SDQ */
.band-ok {
  background: #e8feeb;
  border-color: #15fa5d;
}

.band-mild {
  background: #fefce8;
  border-color: #facc15;
}

.band-high {
  background: #fef2f2;
  border-color: #ef4444;
}
</style>
