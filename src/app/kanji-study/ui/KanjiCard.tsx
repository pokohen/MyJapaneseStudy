'use client'

import { useState } from 'react'
import { Button } from '@/components/Button'
import { KanjiData } from '@/data/kanji'

interface KanjiCardProps {
  kanji: KanjiData
  isExpanded: boolean
  onToggle: () => void
}

export default function KanjiCard({ kanji, isExpanded, onToggle }: KanjiCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speakJapanese = async (text: string) => {
    if (isSpeaking) return

    setIsSpeaking(true)
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('TTS failed')
      }

      const { audio } = await response.json()
      const audioData = `data:audio/mp3;base64,${audio}`
      const audioElement = new Audio(audioData)
      audioElement.play()
    } catch (error) {
      console.error('TTS error:', error)
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'ja-JP'
        utterance.rate = 0.8
        window.speechSynthesis.speak(utterance)
      }
    } finally {
      setIsSpeaking(false)
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        <span className="text-4xl font-bold text-black dark:text-white min-w-[60px] text-center">
          {kanji.char}
        </span>
        <div className="flex-1">
          <p className="text-lg font-medium text-black dark:text-white">
            {kanji.meaning}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            음독: {kanji.onyomi || '-'}
          </p>
        </div>
        <span className="text-zinc-400 dark:text-zinc-500 text-xl">
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-zinc-200 dark:border-zinc-700">
          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-6xl font-bold text-blue-600 dark:text-blue-400">
                {kanji.char}
              </span>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  speakJapanese(kanji.char)
                }}
                className="p-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full transition-colors"
                disabled={isSpeaking}
              >
                <span className="text-xl">🔊</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg">
                <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">의미</p>
                <p className="text-black dark:text-white font-medium">{kanji.meaning}</p>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg">
                <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">JLPT</p>
                <p className="text-black dark:text-white font-medium">{kanji.jlpt}</p>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg">
                <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">음독 (オン)</p>
                <p className="text-black dark:text-white font-medium">{kanji.onyomi || '-'}</p>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg">
                <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">훈독 (くん)</p>
                <p className="text-black dark:text-white font-medium">{kanji.kunyomi || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
