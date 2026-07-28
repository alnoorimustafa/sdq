<template>
  <UContainer class="ecrr-app my-10">
    <div class="text-center">
      <p class="dark:text-neutral-400 text-sm text-justify">
        العبارات التالية تتعلق بشعورك داخل العلاقات العاطفية الحميمة. نحن مهتمون
        بكيفية اختبارك للعلاقات
        <span class="font-bold text-red-400"> بشكل عام </span>
        وليس فقط بما يحدث في علاقتك الحالية. أجب عن كل عبارة باختيار الدرجة التي
        تعبّر عن مدى موافقتك أو عدم موافقتك عليها.
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

    <form class="ecrr-form" @submit.prevent="handleSubmit">
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
        <button
          v-if="!showResults"
          type="submit"
          class="primary-btn relative linear-g"
        >
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

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="score-card" :class="getBandClass(anxietyScore)">
          <h3>القلق المرتبط بالتعلّق</h3>
          <p class="score-value">{{ anxietyScore.toFixed(2) }} / 7</p>
          <p class="score-band">{{ getLevel(anxietyScore) }}</p>
        </div>

        <div class="score-card" :class="getBandClass(avoidanceScore)">
          <h3>التجنّب المرتبط بالتعلّق</h3>
          <p class="score-value">{{ avoidanceScore.toFixed(2) }} / 7</p>
          <p class="score-band">{{ getLevel(avoidanceScore) }}</p>
        </div>
      </div>

      <div class="style-card mt-4">
        <h3>نمط التعلّق</h3>
        <p class="style-name">{{ attachmentStyle.name }}</p>
        <p class="style-desc">{{ attachmentStyle.description }}</p>
      </div>

      <p class="mt-8 text-neutral-500 text-xs text-justify">
        تُحسب كل درجة كمتوسط استجابات ١٨ عبارة، وتتراوح بين ١ و ٧. الدرجة الأعلى
        في بُعد القلق تعني خوفاً أكبر من الرفض والهجر، والدرجة الأعلى في بُعد
        التجنّب تعني انزعاجاً أكبر من القرب والاعتماد على الشريك. تُعتبر الدرجة
        ٤ (منتصف المقياس) هي حد الفصل بين المستوى المنخفض والمرتفع في كل بُعد.
        هذا المقياس أداة استكشافية للتأمل الذاتي وليس أداة تشخيصية.
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
  subscale: 'anxiety' | 'avoidance'
  reverse?: boolean
}

// ECR-R (Fraley, Waller & Brennan, 2000)
// العبارات 1-18: بُعد القلق | العبارات 19-36: بُعد التجنّب
const questions: Question[] = [
  { id: 1, text: 'أخشى أن أفقد حب شريكي.', subscale: 'anxiety' },
  {
    id: 2,
    text: 'غالباً ما أقلق من أن شريكي لن يرغب في البقاء معي.',
    subscale: 'anxiety'
  },
  {
    id: 3,
    text: 'غالباً ما أقلق من أن شريكي لا يحبني حقاً.',
    subscale: 'anxiety'
  },
  {
    id: 4,
    text: 'أقلق من أن الشريك العاطفي لن يهتم بي بقدر اهتمامي به.',
    subscale: 'anxiety'
  },
  {
    id: 5,
    text: 'كثيراً ما أتمنى لو كانت مشاعر شريكي تجاهي بقوة مشاعري تجاهه.',
    subscale: 'anxiety'
  },
  { id: 6, text: 'أقلق كثيراً بشأن علاقاتي.', subscale: 'anxiety' },
  {
    id: 7,
    text: 'عندما يكون شريكي بعيداً عن ناظري، أقلق من أن ينجذب إلى شخص آخر.',
    subscale: 'anxiety'
  },
  {
    id: 8,
    text: 'عندما أُظهر مشاعري تجاه شريكي، أخشى ألا يبادلني الشعور نفسه.',
    subscale: 'anxiety'
  },
  {
    id: 9,
    text: 'نادراً ما أقلق من أن يتركني شريكي.',
    subscale: 'anxiety',
    reverse: true
  },
  {
    id: 10,
    text: 'يجعلني شريكي العاطفي أشك في نفسي.',
    subscale: 'anxiety'
  },
  {
    id: 11,
    text: 'لا أقلق كثيراً من أن يتخلى عني أحد.',
    subscale: 'anxiety',
    reverse: true
  },
  {
    id: 12,
    text: 'أجد أن شريكي لا يرغب في التقارب بالقدر الذي أرغب فيه.',
    subscale: 'anxiety'
  },
  {
    id: 13,
    text: 'أحياناً تتغير مشاعر الشريك العاطفي تجاهي دون سبب واضح.',
    subscale: 'anxiety'
  },
  {
    id: 14,
    text: 'رغبتي الشديدة في التقارب تُنفّر الناس مني أحياناً.',
    subscale: 'anxiety'
  },
  {
    id: 15,
    text: 'أخشى أنه إذا عرفني شريكي على حقيقتي فلن يحب ما أنا عليه.',
    subscale: 'anxiety'
  },
  {
    id: 16,
    text: 'يغضبني أنني لا أحصل من شريكي على ما أحتاجه من المودة والدعم.',
    subscale: 'anxiety'
  },
  {
    id: 17,
    text: 'أقلق من أنني لن أكون في مستوى الآخرين.',
    subscale: 'anxiety'
  },
  {
    id: 18,
    text: 'يبدو أن شريكي لا ينتبه إليّ إلا عندما أغضب.',
    subscale: 'anxiety'
  },

  {
    id: 19,
    text: 'أفضّل ألا أُظهر لشريكي ما أشعر به في أعماقي.',
    subscale: 'avoidance'
  },
  {
    id: 20,
    text: 'أشعر بالارتياح عند مشاركة أفكاري ومشاعري الخاصة مع شريكي.',
    subscale: 'avoidance',
    reverse: true
  },
  {
    id: 21,
    text: 'أجد صعوبة في السماح لنفسي بالاعتماد على شريكي العاطفي.',
    subscale: 'avoidance'
  },
  {
    id: 22,
    text: 'أشعر براحة كبيرة عندما أكون قريباً من شريكي العاطفي.',
    subscale: 'avoidance',
    reverse: true
  },
  {
    id: 23,
    text: 'لا أشعر بالارتياح عند البوح بما بداخلي لشريكي العاطفي.',
    subscale: 'avoidance'
  },
  {
    id: 24,
    text: 'أفضّل ألا أكون شديد القرب من شريكي العاطفي.',
    subscale: 'avoidance'
  },
  {
    id: 25,
    text: 'أشعر بعدم الارتياح عندما يرغب شريكي العاطفي في التقارب الشديد.',
    subscale: 'avoidance'
  },
  {
    id: 26,
    text: 'أجد من السهل نسبياً أن أتقرب من شريكي.',
    subscale: 'avoidance',
    reverse: true
  },
  {
    id: 27,
    text: 'ليس من الصعب عليّ أن أتقرب من شريكي.',
    subscale: 'avoidance',
    reverse: true
  },
  {
    id: 28,
    text: 'عادةً ما أناقش مشكلاتي وهمومي مع شريكي.',
    subscale: 'avoidance',
    reverse: true
  },
  {
    id: 29,
    text: 'يساعدني اللجوء إلى شريكي العاطفي في أوقات الحاجة.',
    subscale: 'avoidance',
    reverse: true
  },
  {
    id: 30,
    text: 'أخبر شريكي بكل شيء تقريباً.',
    subscale: 'avoidance',
    reverse: true
  },
  {
    id: 31,
    text: 'أتحدث مع شريكي في الأمور وأتشاور معه.',
    subscale: 'avoidance',
    reverse: true
  },
  {
    id: 32,
    text: 'أشعر بالتوتر عندما يقترب مني شريكي أكثر من اللازم.',
    subscale: 'avoidance'
  },
  {
    id: 33,
    text: 'أشعر بالارتياح عند الاعتماد على شريكي العاطفي.',
    subscale: 'avoidance',
    reverse: true
  },
  {
    id: 34,
    text: 'أجد من السهل أن أعتمد على شريكي العاطفي.',
    subscale: 'avoidance',
    reverse: true
  },
  {
    id: 35,
    text: 'من السهل عليّ أن أكون حنوناً مع شريكي.',
    subscale: 'avoidance',
    reverse: true
  },
  {
    id: 36,
    text: 'شريكي يفهمني ويفهم احتياجاتي حقاً.',
    subscale: 'avoidance',
    reverse: true
  }
]

// مقياس ليكرت من 1 إلى 7
const answerOptions = [
  { label: 'لا أوافق بشدة', value: 1 },
  { label: 'لا أوافق', value: 2 },
  { label: 'لا أوافق نوعاً ما', value: 3 },
  { label: 'محايد', value: 4 },
  { label: 'أوافق نوعاً ما', value: 5 },
  { label: 'أوافق', value: 6 },
  { label: 'أوافق بشدة', value: 7 }
]

const responses = reactive<Record<number, number | undefined>>(
  Object.fromEntries(questions.map((q) => [q.id, undefined]))
)

const showResults = ref(false)
const validationError = ref('')

// عكس الدرجة على مقياس من 1 إلى 7
function keyed(q: Question, value: number): number {
  return q.reverse ? 8 - value : value
}

function subscaleMean(subscale: 'anxiety' | 'avoidance'): number {
  const items = questions.filter((q) => q.subscale === subscale)
  let sum = 0
  for (const q of items) {
    const val = responses[q.id]
    if (val !== undefined) sum += keyed(q, val)
  }
  return sum / items.length
}

const anxietyScore = computed(() => subscaleMean('anxiety'))
const avoidanceScore = computed(() => subscaleMean('avoidance'))

// منتصف المقياس (4) هو حد الفصل بين المنخفض والمرتفع
const CUTOFF = 4

function getLevel(score: number): string {
  return score >= CUTOFF ? 'مرتفع' : 'منخفض'
}

function getBandClass(score: number): string {
  if (score >= 5.5) return 'band-very-high'
  if (score >= CUTOFF) return 'band-high'
  if (score >= 2.5) return 'band-mild'
  return 'band-ok'
}

const attachmentStyle = computed(() => {
  const highAnxiety = anxietyScore.value >= CUTOFF
  const highAvoidance = avoidanceScore.value >= CUTOFF

  if (!highAnxiety && !highAvoidance) {
    return {
      name: 'آمن',
      description:
        'قلق منخفض وتجنّب منخفض: ارتياح للقرب العاطفي وثقة بتوفّر الشريك عند الحاجة، مع قدرة على الاعتماد المتبادل دون خوف كبير من الهجر.'
    }
  }
  if (highAnxiety && !highAvoidance) {
    return {
      name: 'قلق (منشغل)',
      description:
        'قلق مرتفع وتجنّب منخفض: رغبة قوية في القرب والتقارب مع خوف مستمر من الرفض أو الهجر وحاجة متكررة إلى الطمأنة.'
    }
  }
  if (!highAnxiety && highAvoidance) {
    return {
      name: 'تجنّبي (رافض)',
      description:
        'قلق منخفض وتجنّب مرتفع: تفضيل للاستقلالية والاكتفاء الذاتي، مع انزعاج من القرب الشديد وصعوبة في البوح والاعتماد على الشريك.'
    }
  }
  return {
    name: 'خائف (تجنّبي قلق)',
    description:
      'قلق مرتفع وتجنّب مرتفع: رغبة في القرب مصحوبة بخوف منه في الوقت نفسه، فيتذبذب الشخص بين الاقتراب والابتعاد.'
  }
})

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
.ecrr-app {
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

.ecrr-form {
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

.style-card {
  border-radius: 0.9rem;
  padding: 0.9rem;
  color: #111827;
  background: #eff6ff;
  border: 1px solid #93c5fd;
  text-align: center;
}

.style-card h3 {
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.style-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
}

.style-desc {
  font-size: 0.85rem;
  line-height: 1.8;
  text-align: justify;
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
