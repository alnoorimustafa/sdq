<template>
  <UContainer class="sdq-app">
    <div class="text-center">
      <div
        class="text-[24px] font-bold linear-g rounded-lg text-white mb-4 p-2"
      >
        <p>SDQ</p>

        <p>استبيان نقاط القوة والصعوبات (نسخة ذاتية)</p>
      </div>

      <p class="dark:text-neutral-400 text-sm">
        من فضلك أجب عن كيفية كون الأمور معك خلال الأشهر الستة الماضية.
      </p>
    </div>

    <div dir="ltr" class="text-left">
      <UColorModeSwitch />
    </div>
    <!-- Form -->
    <UButton @click="downloadPdf" class="primary-btn linear-g">
      تنزيل النسخة الأصلية مع إجاباتك
    </UButton>
    <form class="sdq-form" @submit.prevent="onSubmit">
      <UCard v-for="q in questions" :key="q.id" class="mb-4 shadow">
        <template #default>
          <div>
            <p>{{ q.id }} - {{ q.text }}</p>
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
        <button type="submit" class="primary-btn linear-g">
          {{ showResults ? 'إعادة الحساب' : 'عرض نتائجي' }}
        </button>
        <p v-if="validationError" class="error">
          {{ validationError }}
        </p>
      </div>
    </form>

    <!-- <UButton
      @click="downloadPdf"
      v-if="showResults"
      class="primary-btn linear-g"
    >
      تنزيل النسخة الأصلية مع إجاباتك
    </UButton> -->

    <!-- Results -->
    <section v-if="showResults" class="results">
      <h2>درجاتك</h2>

      <div class="score-card" :class="getBandClass('total', totalDifficulties)">
        <h3>مجموع الصعوبات</h3>
        <p class="score-value">{{ totalDifficulties }} / 40</p>
        <p class="score-band">
          {{ getBandLabel('total', totalDifficulties) }}
        </p>
      </div>

      <USeparator class="my-4" />
      <div class="scores-grid">
        <div
          class="score-card"
          :class="getBandClass('emotional', emotionalScore)"
        >
          <h3>الأعراض الانفعالية</h3>
          <p class="score-value">{{ emotionalScore }} / 10</p>
          <p class="score-band">
            {{ getBandLabel('emotional', emotionalScore) }}
          </p>
        </div>

        <div class="score-card" :class="getBandClass('conduct', conductScore)">
          <h3>مشكلات السلوك</h3>
          <p class="score-value">{{ conductScore }} / 10</p>
          <p class="score-band">
            {{ getBandLabel('conduct', conductScore) }}
          </p>
        </div>

        <div
          class="score-card"
          :class="getBandClass('hyperactivity', hyperScore)"
        >
          <h3>فرط الحركة وتشتت الانتباه</h3>
          <p class="score-value">{{ hyperScore }} / 10</p>
          <p class="score-band">
            {{ getBandLabel('hyperactivity', hyperScore) }}
          </p>
        </div>

        <div class="score-card" :class="getBandClass('peer', peerScore)">
          <h3>مشكلات الأقران</h3>
          <p class="score-value">{{ peerScore }} / 10</p>
          <p class="score-band">{{ getBandLabel('peer', peerScore) }}</p>
        </div>

        <div
          class="score-card"
          :class="getBandClass('prosocial', prosocialScore)"
        >
          <h3>السلوك الاجتماعي الإيجابي</h3>
          <p class="score-value">{{ prosocialScore }} / 10</p>
          <p class="score-band">
            {{ getBandLabel('prosocial', prosocialScore) }}
          </p>
        </div>
      </div>

      <p class="mt-8 text-neutral-500 text-xs text-justify">
        هذه الدرجات لغرض الفحص الأولي فقط ولا تُعطي تشخيصاً. إذا شعرت بالقلق من
        هذه النتائج، من الأفضل أن تتحدث مع شخص بالغ موثوق أو مع مختص نفسي.
      </p>
    </section>
  </UContainer>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import { generateSdqPdf } from '~/utils/generateSdqPdf'

// async function downloadPdf() {
//   const pdfBytes = await generateSdqPdf(responses)

//   // @ts-ignore
//   const blob = new Blob([pdfBytes], { type: 'application/pdf' })
//   const url = URL.createObjectURL(blob)

//   const a = document.createElement('a')
//   a.href = url
//   a.download = 'SDQ_Filled.pdf'
//   a.click()
//   URL.revokeObjectURL(url)
// }

async function downloadPdf() {
  // Turn reactive responses into a plain object
  const plainResponses: Record<number, 0 | 1 | 2> = {}
  for (const [id, val] of Object.entries(responses)) {
    //
    plainResponses[Number(id)] = val as 0 | 1 | 2
  }

  const scores = {
    total: totalDifficulties.value,
    emotional: emotionalScore.value,
    conduct: conductScore.value,
    hyper: hyperScore.value,
    peer: peerScore.value,
    prosocial: prosocialScore.value
  }

  const bands = {
    total: getBandLabel('total', totalDifficulties.value),
    emotional: getBandLabel('emotional', emotionalScore.value),
    conduct: getBandLabel('conduct', conductScore.value),
    hyper: getBandLabel('hyperactivity', hyperScore.value),
    peer: getBandLabel('peer', peerScore.value),
    prosocial: getBandLabel('prosocial', prosocialScore.value)
  }

  const arabicLines = [
    `مجموع الصعوبات: ${scores.total} / 40 – ${bands.total}`,
    `الأعراض الانفعالية: ${scores.emotional} / 10 – ${bands.emotional}`,
    `مشكلات السلوك: ${scores.conduct} / 10 – ${bands.conduct}`,
    `فرط الحركة وتشتت الانتباه: ${scores.hyper} / 10 – ${bands.hyper}`,
    `مشكلات الأقران: ${scores.peer} / 10 – ${bands.peer}`,
    `السلوك الاجتماعي الإيجابي: ${scores.prosocial} / 10 – ${bands.prosocial}`
  ]

  function createArabicSummaryImage(lines: string[]): string {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = lines.length * 30 + 40

    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#000'
    ctx.font = '18px "Noto Sans Arabic", Arial'
    ctx.textAlign = 'right'
    ctx.direction = 'rtl'

    let y = 30
    for (const line of lines) {
      ctx.fillText(line, canvas.width - 20, y)
      y += 24
    }

    // returns a dataURL we can feed to pdf-lib
    return canvas.toDataURL('image/png')
  }

  const summaryDataUrl = createArabicSummaryImage(arabicLines)

  const pdfBytes = await generateSdqPdf({
    responses: plainResponses,
    scores,
    bands,
    summaryPngDataUrl: summaryDataUrl
  })

  // @ts-ignore
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'SDQ_self_report_with_results.pdf'
  a.click()
  URL.revokeObjectURL(url)
}

type ScaleKey =
  | 'total'
  | 'emotional'
  | 'conduct'
  | 'hyperactivity'
  | 'peer'
  | 'prosocial'

type AnswerValue = 0 | 1 | 2 | undefined

interface Question {
  id: number
  text: string
}

// --- Questions: SDQ Self-report 11–17, items 1–25 (Arabic text) ---
const questions: Question[] = [
  {
    id: 1,
    text: 'أحاول أن أكون لطيفاً مع الآخرين وأهتم بمشاعرهم.'
  },
  { id: 2, text: 'أنا كثير الحركة ولا أستطيع البقاء جالساً لفترة طويلة.' },
  {
    id: 3,
    text: 'أُصاب كثيراً بالصداع أو ألم المعدة أو أشعر بالتوعك.'
  },
  {
    id: 4,
    text: 'عادةً ما أشارك الآخرين في أشيائي، مثل الأقراص والألعاب والطعام.'
  },
  { id: 5, text: 'أغضب جداً وأفقد أعصابي كثيراً.' },
  { id: 6, text: 'أفضل أن أبقى وحدي على أن أكون مع من هم في مثل عمري.' },
  { id: 7, text: 'عادةً ما أنفذ ما يُطلب مني.' },
  { id: 8, text: 'أفكر وأقلق كثيراً بشأن أشياء مختلفة.' },
  {
    id: 9,
    text: 'أكون متعاوناً عندما يكون شخص ما متألماً أو منزعجاً أو مريضاً.'
  },
  { id: 10, text: 'أتحرك باستمرار وأعبث كثيراً في مكاني.' },
  { id: 11, text: 'لدي صديق جيد واحد على الأقل، وربما أكثر.' },
  {
    id: 12,
    text: 'أدخل في شجار كثيراً، ويمكنني أن أجبر الآخرين على فعل ما أريد.'
  },
  {
    id: 13,
    text: 'غالباً ما أشعر بالحزن أو الاكتئاب أو أبكي كثيراً.'
  },
  { id: 14, text: 'أقراني في نفس عمري غالباً ما يحبونني.' },
  {
    id: 15,
    text: 'أتشتت بسهولة؛ أجد صعوبة في التركيز والانتباه.'
  },
  {
    id: 16,
    text: 'أتوتر في المواقف الجديدة وأفقد ثقتي بنفسي بسهولة.'
  },
  { id: 17, text: 'أعامل الأطفال الأصغر مني بلطف.' },
  { id: 18, text: 'غالباً ما يتهمني الآخرون بالكذب أو الغش.' },
  {
    id: 19,
    text: 'يتعرض لي الأطفال أو اليافعون الآخرون، يضايقونني أو يتنمّرون عليّ.'
  },
  {
    id: 20,
    text: 'غالباً ما أُبادر لمساعدة الآخرين (أهلي، معلميَّ، الأطفال).'
  },
  { id: 21, text: 'أفكر جيداً قبل أن أتصرف.' },
  {
    id: 22,
    text: 'آخذ أشياء ليست لي من البيت أو المدرسة أو من أماكن أخرى.'
  },
  {
    id: 23,
    text: 'أتفاهم مع البالغين أفضل من تفاهمي مع من هم في مثل عمري.'
  },
  { id: 24, text: 'لدي مخاوف كثيرة، وأخاف بسهولة.' },
  {
    id: 25,
    text: 'أنهي الأعمال التي أبدأ بها؛ يكون انتباهي جيداً أغلب الوقت.'
  }
]

// Response options (data entry values 0,1,2)
const answerOptions = [
  { label: 'غير صحيح', value: 0 },
  { label: 'صحيح إلى حد ما', value: 1 },
  { label: 'صحيح تماماً', value: 2 }
]

// Responses keyed by item id
const responses = reactive<Record<number, AnswerValue | undefined>>(
  Object.fromEntries(questions.map((q) => [q.id, undefined])) as Record<
    number,
    AnswerValue | undefined
  >
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

// --- Banding (Arabic labels) ---
function getBandLabel(scale: ScaleKey, score: number): string {
  switch (scale) {
    case 'total':
      if (score <= 14) return 'ضمن المعدل'
      if (score <= 17) return 'أعلى من المعدل قليلاً'
      if (score <= 19) return 'مرتفع'
      return 'مرتفع جداً'
    case 'emotional':
      if (score <= 4) return 'ضمن المعدل'
      if (score === 5) return 'أعلى من المعدل قليلاً'
      if (score === 6) return 'مرتفع'
      return 'مرتفع جداً' // 7–10
    case 'conduct':
      if (score <= 3) return 'ضمن المعدل'
      if (score === 4) return 'أعلى من المعدل قليلاً'
      if (score === 5) return 'مرتفع'
      return 'مرتفع جداً' // 6–10
    case 'hyperactivity':
      if (score <= 5) return 'ضمن المعدل'
      if (score === 6) return 'أعلى من المعدل قليلاً'
      if (score === 7) return 'مرتفع'
      return 'مرتفع جداً' // 8–10
    case 'peer':
      if (score <= 2) return 'ضمن المعدل'
      if (score === 3) return 'أعلى من المعدل قليلاً'
      if (score === 4) return 'مرتفع'
      return 'مرتفع جداً' // 5–10
    case 'prosocial':
      // Prosocial reversed: lower scores mean more concern
      if (score >= 7) return 'ضمن المعدل'
      if (score === 6) return 'أقل من المعدل قليلاً'
      if (score === 5) return 'منخفض'
      return 'منخفض جداً' // 0–4
  }
}

// Map band to a color class (green → yellow → orange → red)
function getBandClass(scale: ScaleKey, score: number): string {
  const label = getBandLabel(scale, score)
  if (label === 'ضمن المعدل') return 'band-ok'
  if (label === 'أعلى من المعدل قليلاً' || label === 'أقل من المعدل قليلاً')
    return 'band-mild'
  if (label === 'مرتفع' || label === 'منخفض') return 'band-high'
  return 'band-very-high' // مرتفع جداً / منخفض جداً
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
    validationError.value = 'من فضلك أجب عن جميع الأسئلة قبل عرض النتائج.'
    showResults.value = false
    return
  }
  validationError.value = ''
  showResults.value = true
}
</script>

<style scoped>
.sdq-app {
  font-family: 'Noto Kufi Arabic', 'Scheherazade New', 'Amiri',
    'Noto Sans Arabic', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
  direction: rtl;
  text-align: right;
}

.sdq-form {
  margin-top: 1rem;
}

.question-number {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.35rem;
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
  padding: 0.6rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
}

.linear-g {
  background: linear-gradient(to left, #16a34a, #22c55e);
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
