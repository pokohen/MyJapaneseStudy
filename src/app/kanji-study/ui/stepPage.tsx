'use client'

import { useState } from 'react'
import { Button } from '@/components/Button'
import { kanjiByLevel, JLPTLevel } from '@/data/kanji'
import KanjiCard from './KanjiCard'

interface KanjiStepPageProps {
  step: Exclude<JLPTLevel, 'none'>
  onBack: () => void
}

export default function KanjiStepPage({ step, onBack }: KanjiStepPageProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const kanjiList = kanjiByLevel[step] || []

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black p-4">
      <header className="sticky top-0 z-10 bg-zinc-50 dark:bg-black py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            {step} 한자 ({kanjiList.length}자)
          </h1>
          <Button
            onClick={onBack}
            className="py-2 px-4 bg-zinc-500 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
          >
            뒤로 가기
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full py-4">
        <div className="space-y-3">
          {kanjiList.map((kanji, index) => (
            <KanjiCard
              key={kanji.char}
              kanji={kanji}
              isExpanded={expandedIndex === index}
              onToggle={() => toggleExpand(index)}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
