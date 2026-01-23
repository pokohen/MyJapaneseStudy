'use client'

import { useState } from 'react'
import { Button } from '@/components/Button'
import {
  getGrammarDataByCategory,
  grammarCategories,
  GrammarCategory,
} from '@/data/grammar'
import GrammarCard from './GrammarCard'
import VerbConjugationCard from './VerbConjugationCard'
import ParticleCard from './ParticleCard'
import AdjectiveCard from './AdjectiveCard'

interface GrammarStepPageProps {
  category: GrammarCategory
  onBack: () => void
}

export default function GrammarStepPage({ category, onBack }: GrammarStepPageProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const { type, data } = getGrammarDataByCategory(category)
  const categoryInfo = grammarCategories.find((c) => c.id === category)

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  const getItemCount = () => {
    switch (type) {
      case 'patterns':
        return data.patterns.length
      case 'verb':
        return data.conjugations.length
      case 'particles':
        return data.particles.length
      case 'adjectives':
        return data.types.length
      default:
        return 0
    }
  }

  const renderCards = () => {
    switch (type) {
      case 'patterns':
        return data.patterns.map((pattern, index) => (
          <GrammarCard
            key={pattern.id}
            pattern={pattern}
            isExpanded={expandedIndex === index}
            onToggle={() => toggleExpand(index)}
          />
        ))
      case 'verb':
        return data.conjugations.map((conjugation, index) => (
          <VerbConjugationCard
            key={conjugation.id}
            conjugation={conjugation}
            verbGroups={data.verbGroups}
            isExpanded={expandedIndex === index}
            onToggle={() => toggleExpand(index)}
          />
        ))
      case 'particles':
        return data.particles.map((particle, index) => (
          <ParticleCard
            key={particle.id}
            particle={particle}
            isExpanded={expandedIndex === index}
            onToggle={() => toggleExpand(index)}
          />
        ))
      case 'adjectives':
        return data.types.map((adjType, index) => (
          <AdjectiveCard
            key={adjType.id}
            adjectiveType={adjType}
            comparisonTable={data.comparisonTable}
            isExpanded={expandedIndex === index}
            onToggle={() => toggleExpand(index)}
          />
        ))
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black p-4">
      <header className="sticky top-0 z-10 bg-zinc-50 dark:bg-black py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            {categoryInfo?.label || data.title} ({getItemCount()}개)
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
          {renderCards()}
        </div>
      </main>
    </div>
  )
}
