<template>
  <UContainer class="wemwbs-app my-10">
    <div class="text-center">
      <p class="dark:text-neutral-400 text-sm">
        في الأسفل توجد عبارات تصف المشاعر والأفكار. يرجى وضع علامة في الخانة
        التي تصف تجربتك خلال
        <span class="font-bold text-red-400"> الأسبوعين الماضيين. </span>
      </p>
    </div>

    <div dir="ltr" class="text-left my-4">
      <UColorModeSwitch />
    </div>

    <!-- معلومات أساسية اختيارية -->
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
              placeholder="مثال: 1990"
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

    <form class="wemwbs-form" @submit.prevent="handleSubmit">
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

    <!-- النتائج -->
    <section v-if="showResults" class="results">
      <h2>النتيجة</h2>

      <div class="score-card" :class="getBandClass(totalScore)">
        <h3>مجموع الصحة النفسية</h3>
        <p class="score-value">{{ totalScore }} / 70</p>
        <p class="score-band">
          {{ getScoreInterpretation(totalScore) }}
        </p>
      </div>

      <p class="mt-8 text-neutral-500 text-xs text-justify">
        أعلى درجة ممكنة هي 70 وأقل درجة هي 14. النتيجة الأعلى تعني مستوى أعلى من
        الصحة النفسية والرفاهية.
      </p>
    </section>
  </UContainer>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'

const userName = ref('')
const birthYear = ref('')
const sex = ref('')

const router = useRouter()

const resetForm = () => {
  router.go(0)
}

interface Question {
  id: number
  text: string
}

const questions: Question[] = [
  { id: 1, text: 'أشعر بالتفاؤل بما يخص المستقبل' },
  { id: 2, text: 'أشعر بأني مفيد' },
  { id: 3, text: 'أشعر بالاسترخاء' },
  { id: 4, text: 'أشعر بأني مهتم بالآخرين' },
  { id: 5, text: 'أملك الطاقة والحيوية' },
  { id: 6, text: 'أتعامل مع المشاكل بشكل جيد' },
  { id: 7, text: 'أفكر بوضوح' },
  { id: 8, text: 'أشعر بالرضا عن نفسي' },
  { id: 9, text: 'أشعر بأني قريب من الآخرين' },
  { id: 10, text: 'أشعر بالثقة' },
  { id: 11, text: 'أنا قادر على اتخاذ قراراتي بنفسي' },
  { id: 12, text: 'أشعر بأني محبوب' },
  { id: 13, text: 'أشعر بالحماس للأشياء الجديدة' },
  { id: 14, text: 'أشعر بالبهجة' }
]

// 1 to 5 scale
const answerOptions = [
  { label: 'أبداً', value: 1 },
  { label: 'نادراً', value: 2 },
  { label: 'بعض الأوقات', value: 3 },
  { label: 'غالباً', value: 4 },
  { label: 'دائماً', value: 5 }
]

const responses = reactive<Record<number, number | undefined>>(
  Object.fromEntries(questions.map((q) => [q.id, undefined]))
)

const showResults = ref(false)
const validationError = ref('')

const totalScore = computed(() => {
  let sum = 0
  for (const q of questions) {
    const val = responses[q.id]
    if (val !== undefined) {
      sum += val
    }
  }
  return sum
})

function getScoreInterpretation(score: number): string {
  if (score < 33) return 'منخفض جداً'
  if (score < 41) return 'أقل من المتوسط'
  if (score < 60) return 'متوسط'
  return 'اكثر من المتوسط'
}

function getBandClass(score: number): string {
  const label = getScoreInterpretation(score)
  if (label === 'منخفض جداً') return 'band-very-high' // Used for very low wellbeing (red)
  if (label === 'أقل من المتوسط') return 'band-mild' // (yellow)
  if (label === 'متوسط') return 'band-ok' // (green)
  return 'band-ok' // High wellbeing is also good (green)
} // Note: SDQ uses 'band-high' for orange, but WEMWBS might not need it if we map straightforwardly.
// Let's stick to the requested coloring:
// SDQ logic:
// band-ok (green)
// band-mild (yellow)
// band-high (orange)
// band-very-high (red)

// Re-evaluating WEMWBS mapping based on SDQ typical "severity" vs "wellbeing":
// WEMWBS is positive: Higher is better.
// SDQ is negative: Higher is worse.

// user said "same coloring of results according to score like @SdqSelfFormRTL.vue"
// In SDQ:
// Red = Very High Difficulties (Bad)
// Orange = High Difficulties (Bad)
// Yellow = Slightly Raised (Warning)
// Green = Close to Average (Good)

// So for WEMWBS (Higher is better):
// Red = Low score (Bad)
// Yellow = Below average (Warning)
// Green = Average or Above (Good)

// My implementation of getBandClass above:
// < 33 (Very Low) -> band-very-high (Red) -> Correct
// 33-40 (Below Average) -> band-mild (Yellow) -> Correct
// 41-59 (Average) -> band-ok (Green) -> Correct
// >= 60 (Above Average) -> band-ok (Green) -> Correct

// I should probably ensure the orange class is available if needed, but for now I'll just map to these 3 states as per the standard interpretation
// or maybe 'Average' should be Green and 'Above Average' also Green? Yes.

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
.wemwbs-app {
  font-family: 'Noto Kufi Arabic', 'Scheherazade New', 'Amiri',
    'Noto Sans Arabic', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
  direction: rtl;
  text-align: right;
}

.wemwbs-form {
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

.band-ok {
  background: #e8feeb;
  border-color: #15fa5d;
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
</style>
