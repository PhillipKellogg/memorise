import { useState } from 'react'
import { motion } from 'framer-motion'
import Nav from '@/components/Nav'
import NeuButton from '@/components/NeuButton'
import NeuInput from '@/components/NeuInput'
import NeuSlider from '@/components/NeuSlider'
import NeuToggle from '@/components/NeuToggle'
import StudyCard from '@/components/StudyCard'
import FlipCard from '@/components/FlipCard'

interface Props { isDark: boolean; onToggleTheme: () => void }

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.4, 0, 0.2, 1] },
  }),
}

function Section({ title, children, i = 0 }: { title: string; children: React.ReactNode; i?: number }) {
  return (
    <motion.div custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-30px' }}>
      <p className="text-xs uppercase tracking-widest text-accent font-body mb-5">{title}</p>
      {children}
    </motion.div>
  )
}

export default function StorybookPage({ isDark, onToggleTheme }: Props) {
  const [sliderA, setSliderA] = useState(40)
  const [sliderB, setSliderB] = useState(70)
  const [tog1, setTog1] = useState(false)
  const [tog2, setTog2] = useState(true)
  const [inputVal, setInputVal] = useState('')
  const [cardFlipped, setCardFlipped] = useState(false)

  return (
    <div className="min-h-screen font-body" style={{ background: 'var(--neu-bg)' }}>
      <Nav isDark={isDark} onToggleTheme={onToggleTheme} />

      <div className="max-w-3xl mx-auto px-6 pt-32 pb-24 space-y-16">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent mb-3">Components</p>
          <h1 className="font-display text-4xl font-bold text-neu">Storybook</h1>
          <p className="text-muted mt-2">Neumorphic UI components used throughout the app.</p>
        </div>

        {/* ── Buttons ── */}
        <Section title="Buttons" i={1}>
          <div className="neu-raised rounded-3xl p-8 space-y-6">
            <div>
              <p className="text-xs text-muted font-body mb-3">Variants</p>
              <div className="flex flex-wrap gap-3">
                <NeuButton variant="default">Default</NeuButton>
                <NeuButton variant="accent">Accent</NeuButton>
                <NeuButton variant="danger">Danger</NeuButton>
                <NeuButton variant="warning">Warning</NeuButton>
                <NeuButton variant="success">Success</NeuButton>
                <NeuButton disabled>Disabled</NeuButton>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted font-body mb-3">Sizes</p>
              <div className="flex flex-wrap items-center gap-3">
                <NeuButton variant="accent" size="sm">Small</NeuButton>
                <NeuButton variant="accent" size="md">Medium</NeuButton>
                <NeuButton variant="accent" size="lg">Large</NeuButton>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Inputs ── */}
        <Section title="Inputs" i={2}>
          <div className="neu-raised rounded-3xl p-8 space-y-5">
            <NeuInput
              label="Default"
              placeholder="Type something…"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
            />
            <NeuInput
              label="With hint"
              placeholder="username"
              hint="Only letters and numbers, no spaces."
            />
            <NeuInput
              label="With error"
              placeholder="email@example.com"
              defaultValue="not-an-email"
              error="Please enter a valid email address."
            />
            <NeuInput
              label="Password"
              type="password"
              placeholder="••••••••"
            />
            <NeuInput
              label="Disabled"
              placeholder="Can't touch this"
              disabled
            />
          </div>
        </Section>

        {/* ── Sliders ── */}
        <Section title="Sliders" i={3}>
          <div className="neu-raised rounded-3xl p-8 space-y-6">
            <NeuSlider label="Volume" value={sliderA} onChange={setSliderA} />
            <NeuSlider label="Difficulty" min={1} max={5} step={1} value={sliderB > 5 ? 3 : Math.round(sliderB / 20)} onChange={v => setSliderB(v * 20)} showValue />
            <NeuSlider label="No label value" min={0} max={200} step={10} value={sliderB} onChange={setSliderB} showValue={false} />
          </div>
        </Section>

        {/* ── Toggles ── */}
        <Section title="Toggles" i={4}>
          <div className="neu-raised rounded-3xl p-8 space-y-5">
            <NeuToggle checked={tog1} onChange={setTog1} label="Dark mode" />
            <NeuToggle checked={tog2} onChange={setTog2} label="Email notifications" />
            <NeuToggle checked={false} onChange={() => {}} label="Disabled toggle" disabled />
          </div>
        </Section>

        {/* ── Study Card ── */}
        <Section title="Study Card" i={5}>
          <div className="space-y-4">
            <StudyCard
              front="What is the forgetting curve?"
              back="Ebbinghaus's model showing that memory decays exponentially over time without review. Spaced repetition counteracts this decay."
              flipped={cardFlipped}
              onFlip={() => setCardFlipped(true)}
            />
            {cardFlipped && (
              <div className="text-center">
                <NeuButton size="sm" onClick={() => setCardFlipped(false)}>Reset card</NeuButton>
              </div>
            )}
          </div>
        </Section>

        {/* ── Flip Card ── */}
        <Section title="Flip Card (Browse / Preview)" i={6}>
          <div className="h-52">
            <FlipCard
              front="Newton's First Law?"
              back="An object in motion stays in motion unless acted upon by an external force."
              className="w-full h-full"
            />
          </div>
        </Section>

        {/* ── Surfaces ── */}
        <Section title="Surfaces" i={7}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'neu-raised', cls: 'neu-raised' },
              { label: 'neu-inset', cls: 'neu-inset' },
              { label: 'neu-answered', cls: 'neu-answered' },
              { label: 'neu-deep-press', cls: 'neu-deep-press' },
              { label: 'neu-btn', cls: 'neu-btn' },
              { label: 'neu-raised-sm', cls: 'neu-raised-sm' },
            ].map(s => (
              <div key={s.label} className={`${s.cls} rounded-2xl p-5 flex items-center justify-center`}>
                <span className="text-xs font-mono text-muted">{s.label}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}
