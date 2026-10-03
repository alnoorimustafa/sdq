<template>
  <UContainer class="pedsql-app my-10">
    <div class="text-center">
      <p class="dark:text-neutral-400 text-sm text-justify">
        <template v-if="isParent">
          في الصفحة التالية قائمة بأشياء قد تمثّل مشكلة لطفلك. من فضلك أخبرنا
          <span class="font-bold text-red-400"> إلى أي مدى </span>
          كان كل واحد منها مشكلة لطفلك خلال
          <span class="font-bold text-red-400"> الشهر الماضي. </span>
        </template>
        <template v-else>
          في الصفحة التالية قائمة بأشياء قد تمثّل مشكلة لك. من فضلك أخبرنا
          <span class="font-bold text-red-400"> إلى أي مدى </span>
          كان كل واحد منها مشكلة لك خلال
          <span class="font-bold text-red-400"> الشهر الماضي. </span>
        </template>
        لا توجد إجابات صحيحة أو خاطئة.
      </p>
    </div>

    <div dir="ltr" class="text-left my-4">
      <UColorModeSwitch />
    </div>

    <!-- معلومات أساسية -->
    <UCard class="mb-4 shadow">
      <template #default>
        <div class="space-y-4">
          <div>
            <label class="block mb-2 font-medium">
              {{ isParent ? 'اسم الطفل' : 'الاسم' }}
            </label>
            <UInput
              v-model="userName"
              class="w-full"
              :placeholder="isParent ? 'اكتب اسم الطفل هنا' : 'اكتب اسمك هنا'"
            />
          </div>

          <div>
            <label class="block w-full mb-2 font-medium">
              {{ isParent ? 'سنة ميلاد الطفل' : 'سنة الميلاد' }}
            </label>
            <UInput
              v-model="birthYear"
              class="w-full"
              type="number"
              placeholder="مثال: 2015"
            />
          </div>

          <div>
            <label class="block mb-2 font-medium">
              {{ isParent ? 'جنس الطفل' : 'الجنس' }}
            </label>
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

          <div>
            <label class="block mb-2 font-medium">
              {{ isParent ? 'الفئة العمرية للطفل' : 'الفئة العمرية' }}
            </label>
            <URadioGroup
              v-model="ageGroup"
              class="w-full"
              variant="table"
              :items="ageGroupOptions"
            />
          </div>
        </div>
      </template>
    </UCard>

    <form class="pedsql-form" @submit.prevent="handleSubmit">
      <template v-for="section in sections" :key="section.scale">
        <h3 class="section-title">{{ section.title }}</h3>
        <p class="section-hint">{{ section.hint }}</p>

        <UCard v-for="q in section.items" :key="q.id" class="mb-4 shadow">
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
      </template>

      <div class="actions">
        <button
          v-if="!showResults"
          type="submit"
          class="primary-btn relative linear-g"
        >
          عرض النتائج
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

      <div class="score-card total-card" :class="getBandClass(totalScore)">
        <h3>الدرجة الكلية لجودة الحياة</h3>
        <p class="score-value">{{ fmt(totalScore) }} / 100</p>
        <p class="score-band">{{ getInterpretation(totalScore) }}</p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 mt-4">
        <div class="score-card" :class="getBandClass(physicalSummary)">
          <h3>ملخص الصحة الجسدية</h3>
          <p class="score-value">{{ fmt(physicalSummary) }} / 100</p>
          <p class="score-sub">الأداء الجسدي (8 عبارات)</p>
        </div>

        <div class="score-card" :class="getBandClass(psychosocialSummary)">
          <h3>ملخص الصحة النفسية الاجتماعية</h3>
          <p class="score-value">{{ fmt(psychosocialSummary) }} / 100</p>
          <p class="score-sub">الانفعالي + الاجتماعي + المدرسي (15 عبارة)</p>
        </div>
      </div>

      <h3 class="subscales-title">درجات الأبعاد الفرعية</h3>
      <div class="grid gap-4 sm:grid-cols-2">
        <div
          v-for="s in subscaleResults"
          :key="s.scale"
          class="score-card"
          :class="getBandClass(s.score)"
        >
          <h3>{{ s.title }}</h3>
          <p class="score-value">{{ fmt(s.score) }} / 100</p>
          <p class="score-sub">{{ s.count }} عبارات</p>
        </div>
      </div>

      <p class="mt-8 text-neutral-500 text-xs text-justify">
        تُحوَّل كل إجابة إلى درجة من 0 إلى 100 بشكل عكسي (أبداً = 100، نادراً =
        75، أحياناً = 50، غالباً = 25، دائماً تقريباً = 0)، بحيث تعني الدرجة
        الأعلى جودة حياة أفضل. درجة كل بُعد هي متوسط عباراته، وملخص الصحة النفسية
        الاجتماعية هو متوسط عبارات الأبعاد الانفعالي والاجتماعي والمدرسي الخمس
        عشرة، والدرجة الكلية هي متوسط العبارات الثلاث والعشرين. تُعتبر الدرجة
        الكلية الأقل من {{ cutoff }} (انحراف معياري واحد تحت متوسط العيّنة
        المرجعية {{ isParent ? 'لتقرير الوالدين' : 'لتقرير الطفل' }}) مؤشراً
        على احتمال وجود خطر على جودة الحياة المرتبطة بالصحة (Varni وآخرون،
        2003). هذا المقياس أداة للفحص والمتابعة وليس أداة تشخيصية.
      </p>
    </section>
  </UContainer>
</template>

<script setup lang="ts">
import { reactive, computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    respondent?: 'child' | 'parent'
  }>(),
  { respondent: 'child' }
)

const isParent = computed(() => props.respondent === 'parent')

const userName = ref('')
const birthYear = ref('')
const sex = ref('')

type AgeGroup = 'young' | 'child' | 'teen'
const ageGroup = ref<AgeGroup>('child')

const ageGroupOptions = [
  { label: '5 - 7 سنوات', value: 'young' },
  { label: '8 - 12 سنة', value: 'child' },
  { label: '13 - 18 سنة', value: 'teen' }
]

const router = useRouter()

const resetForm = () => {
  router.go(0)
}

type Scale = 'physical' | 'emotional' | 'social' | 'school'

interface Item {
  id: number
  scale: Scale
  child: string
  parent: string
}

// PedsQL™ 4.0 Generic Core Scales (Varni, Seid & Kurtin, 2001)
// 23 عبارة: الأداء الجسدي (8) | الأداء الانفعالي (5) | الأداء الاجتماعي (5) | الأداء المدرسي (5)
// نص الطفل: "خلال الشهر الماضي، إلى أي مدى كان هذا مشكلة لك..."
// نص الوالدين: "خلال الشهر الماضي، إلى أي مدى كانت لدى طفلك مشكلة في..."
const items: Item[] = [
  {
    id: 1,
    scale: 'physical',
    child: 'يصعب عليّ المشي لمسافة أكثر من شارع واحد',
    parent: 'المشي لمسافة أكثر من شارع واحد'
  },
  { id: 2, scale: 'physical', child: 'يصعب عليّ الجري', parent: 'الجري' },
  {
    id: 3,
    scale: 'physical',
    child: 'يصعب عليّ ممارسة الأنشطة الرياضية أو التمارين',
    parent: 'المشاركة في الأنشطة الرياضية أو التمارين'
  },
  {
    id: 4,
    scale: 'physical',
    child: 'يصعب عليّ رفع شيء ثقيل',
    parent: 'رفع شيء ثقيل'
  },
  {
    id: 5,
    scale: 'physical',
    child: 'يصعب عليّ الاستحمام بمفردي',
    parent: 'الاستحمام بمفرده/بمفردها'
  },
  {
    id: 6,
    scale: 'physical',
    child: 'يصعب عليّ القيام بالأعمال المنزلية',
    parent: 'القيام بالأعمال المنزلية'
  },
  {
    id: 7,
    scale: 'physical',
    child: 'أشعر بألم أو وجع',
    parent: 'الشعور بألم أو وجع'
  },
  {
    id: 8,
    scale: 'physical',
    child: 'طاقتي قليلة',
    parent: 'انخفاض مستوى الطاقة'
  },

  {
    id: 9,
    scale: 'emotional',
    child: 'أشعر بالخوف أو الفزع',
    parent: 'الشعور بالخوف أو الفزع'
  },
  {
    id: 10,
    scale: 'emotional',
    child: 'أشعر بالحزن أو الكآبة',
    parent: 'الشعور بالحزن أو الكآبة'
  },
  {
    id: 11,
    scale: 'emotional',
    child: 'أشعر بالغضب',
    parent: 'الشعور بالغضب'
  },
  {
    id: 12,
    scale: 'emotional',
    child: 'أعاني من صعوبة في النوم',
    parent: 'صعوبة في النوم'
  },
  {
    id: 13,
    scale: 'emotional',
    child: 'أقلق بشأن ما سيحدث لي',
    parent: 'القلق بشأن ما سيحدث له/لها'
  },

  {
    id: 14,
    scale: 'social',
    child: 'أواجه صعوبة في التوافق مع الأطفال الآخرين',
    parent: 'التوافق مع الأطفال الآخرين'
  },
  {
    id: 15,
    scale: 'social',
    child: 'الأطفال الآخرون لا يريدون أن يكونوا أصدقائي',
    parent: 'عدم رغبة الأطفال الآخرين في أن يكونوا أصدقاءه/أصدقاءها'
  },
  {
    id: 16,
    scale: 'social',
    child: 'الأطفال الآخرون يسخرون مني',
    parent: 'التعرض للسخرية من الأطفال الآخرين'
  },
  {
    id: 17,
    scale: 'social',
    child: 'لا أستطيع القيام بأشياء يستطيع الأطفال الآخرون في عمري القيام بها',
    parent:
      'عدم القدرة على القيام بأشياء يستطيع الأطفال الآخرون في عمره/عمرها القيام بها'
  },
  {
    id: 18,
    scale: 'social',
    child: 'يصعب عليّ مجاراة الأطفال الآخرين عند اللعب معهم',
    parent: 'مجاراة الأطفال الآخرين عند اللعب معهم'
  },

  {
    id: 19,
    scale: 'school',
    child: 'يصعب عليّ الانتباه في الصف',
    parent: 'الانتباه في الصف'
  },
  { id: 20, scale: 'school', child: 'أنسى الأشياء', parent: 'نسيان الأشياء' },
  {
    id: 21,
    scale: 'school',
    child: 'أواجه صعوبة في متابعة واجباتي المدرسية',
    parent: 'متابعة الواجبات المدرسية'
  },
  {
    id: 22,
    scale: 'school',
    child: 'أتغيب عن المدرسة بسبب الشعور بالمرض أو التعب',
    parent: 'التغيب عن المدرسة بسبب الشعور بالمرض أو التعب'
  },
  {
    id: 23,
    scale: 'school',
    child: 'أتغيب عن المدرسة للذهاب إلى الطبيب أو المستشفى',
    parent: 'التغيب عن المدرسة للذهاب إلى الطبيب أو المستشفى'
  }
]

const scaleTitles: Record<Scale, string> = {
  physical: 'الأداء الجسدي',
  emotional: 'الأداء الانفعالي',
  social: 'الأداء الاجتماعي',
  school: 'الأداء المدرسي'
}

const scaleOrder: Scale[] = ['physical', 'emotional', 'social', 'school']

// نسخة المراهقين (13-18) تستخدم "المراهقين" بدل "الأطفال"
function wordingFor(text: string): string {
  if (ageGroup.value !== 'teen') return text
  return text
    .replace(/الأطفال الآخرون/g, 'المراهقون الآخرون')
    .replace(/الأطفال الآخرين/g, 'المراهقين الآخرين')
    .replace(/ عند اللعب معهم/g, '')
}

const sections = computed(() =>
  scaleOrder.map((scale) => ({
    scale,
    title: scaleTitles[scale],
    hint: isParent.value
      ? 'خلال الشهر الماضي، إلى أي مدى كانت لدى طفلك مشكلة في...'
      : 'خلال الشهر الماضي، إلى أي مدى كان هذا مشكلة لك...',
    items: items
      .filter((i) => i.scale === scale)
      .map((i) => ({
        id: i.id,
        text: wordingFor(isParent.value ? i.parent : i.child)
      }))
  }))
)

// مقياس الإجابة: 0 = أبداً ... 4 = دائماً تقريباً
// نسخة الطفل الصغير (5-7) تستخدم ثلاث درجات فقط (0، 2، 4)
const fiveOptions = [
  { label: 'أبداً', value: 0 },
  { label: 'نادراً', value: 1 },
  { label: 'أحياناً', value: 2 },
  { label: 'غالباً', value: 3 },
  { label: 'دائماً تقريباً', value: 4 }
]

const threeOptions = [
  { label: 'لا، أبداً', value: 0 },
  { label: 'أحياناً', value: 2 },
  { label: 'كثيراً', value: 4 }
]

const answerOptions = computed(() =>
  !isParent.value && ageGroup.value === 'young' ? threeOptions : fiveOptions
)

const responses = reactive<Record<number, number | undefined>>(
  Object.fromEntries(items.map((i) => [i.id, undefined]))
)

// عند تغيير الفئة العمرية تُمسح الإجابات التي لا تنتمي لمقياس الإجابة الجديد
watch(answerOptions, (opts) => {
  const allowed = new Set(opts.map((o) => o.value))
  for (const i of items) {
    const v = responses[i.id]
    if (v !== undefined && !allowed.has(v)) responses[i.id] = undefined
  }
})

const showResults = ref(false)
const validationError = ref('')

// التحويل الخطي العكسي إلى 0-100: 0→100، 1→75، 2→50، 3→25، 4→0
function transform(value: number): number {
  return (4 - value) * 25
}

// متوسط العبارات المجابة؛ لا تُحسب الدرجة إذا كان أكثر من 50% من العبارات مفقوداً
function meanOf(subset: Item[]): number | null {
  const answered = subset
    .map((i) => responses[i.id])
    .filter((v): v is number => v !== undefined && v !== null)
  if (answered.length < subset.length / 2) return null
  const sum = answered.reduce((acc, v) => acc + transform(v), 0)
  return sum / answered.length
}

function scaleScore(scale: Scale): number | null {
  return meanOf(items.filter((i) => i.scale === scale))
}

const physicalSummary = computed(() => scaleScore('physical'))

const psychosocialSummary = computed(() =>
  meanOf(items.filter((i) => i.scale !== 'physical'))
)

const totalScore = computed(() => meanOf(items))

const subscaleResults = computed(() =>
  scaleOrder.map((scale) => ({
    scale,
    title: scaleTitles[scale],
    score: scaleScore(scale),
    count: items.filter((i) => i.scale === scale).length
  }))
)

// حد القطع "في دائرة الخطر": انحراف معياري واحد تحت متوسط العيّنة
// (Varni, Burwinkle & Seid, 2003): تقرير الطفل 69.7 | تقرير الوالدين 65.4
const cutoff = computed(() => (isParent.value ? 65.4 : 69.7))

function fmt(score: number | null): string {
  return score === null ? '—' : score.toFixed(1)
}

function getInterpretation(score: number | null): string {
  if (score === null) return 'تعذّر الحساب (إجابات غير كافية)'
  return score < cutoff.value
    ? 'في دائرة الخطر: أقل من حد القطع'
    : 'ضمن المدى المتوقع'
}

function getBandClass(score: number | null): string {
  if (score === null) return ''
  if (score >= cutoff.value) return 'band-ok'
  if (score >= cutoff.value - 15) return 'band-mild'
  if (score >= cutoff.value - 30) return 'band-high'
  return 'band-very-high'
}

function allAnswered(): boolean {
  return items.every(
    (i) => responses[i.id] !== undefined && responses[i.id] !== null
  )
}

function handleSubmit() {
  if (!allAnswered()) {
    validationError.value = 'من فضلك أجب عن جميع العبارات قبل عرض النتائج.'
    showResults.value = false
    return
  }
  validationError.value = ''
  showResults.value = true
}
</script>

<style scoped>
.pedsql-app {
  font-family:
    'Noto Kufi Arabic',
    'Scheherazade New',
    'Amiri',
    'Noto Sans Arabic',
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  direction: rtl;
  text-align: right;
}

.pedsql-form {
  margin-top: 1rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #10b981;
  margin-top: 1.5rem;
  margin-bottom: 0.25rem;
}

.section-hint {
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
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

/* النتائج */
.results {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.results h2 {
  font-size: 1.3rem;
  margin-bottom: 0.75rem;
}

.subscales-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem;
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

.total-card .score-value {
  font-size: 2.2rem;
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

.score-sub {
  font-size: 0.8rem;
  color: #6b7280;
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
