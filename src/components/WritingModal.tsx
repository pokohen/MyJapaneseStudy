'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import StrokeOrderDisplay from './StrokeOrderDisplay'

type TabType = 'write' | 'animation' | 'steps'

interface StrokeData {
  id: string
  d: string
}

interface WritingModalProps {
  isOpen: boolean
  onClose: () => void
  character: string
  reading: string
  onPlaySound?: () => void
}

// 문자의 유니코드를 5자리 16진수로 변환
const getUnicodeHex = (char: string) => {
  return char.charCodeAt(0).toString(16).padStart(5, '0')
}

export default function WritingModal({
  isOpen,
  onClose,
  character,
  reading,
  onPlaySound,
}: WritingModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [showGuide, setShowGuide] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('write')
  const prevIsOpenRef = useRef(false)
  const [guideStrokes, setGuideStrokes] = useState<StrokeData[]>([])

  // KanjiVG 가이드 데이터 가져오기
  useEffect(() => {
    const fetchGuideData = async () => {
      try {
        const unicode = getUnicodeHex(character)
        const response = await fetch(
          `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${unicode}.svg`
        )

        if (!response.ok) {
          setGuideStrokes([])
          return
        }

        const svgText = await response.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(svgText, 'image/svg+xml')

        const paths = doc.querySelectorAll('path')
        const strokeData: StrokeData[] = []

        paths.forEach((path) => {
          const d = path.getAttribute('d')
          const id = path.getAttribute('id')
          if (d && id) {
            strokeData.push({ id, d })
          }
        })

        setGuideStrokes(strokeData)
      } catch {
        setGuideStrokes([])
      }
    }

    if (character) {
      fetchGuideData()
    }
  }, [character])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

  // 모달이 열릴 때 캔버스 초기화
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      clearCanvas()
    }
    prevIsOpenRef.current = isOpen
  }, [isOpen, clearCanvas])

  // character가 변경되면 탭 리셋
  useEffect(() => {
    setActiveTab('write')
  }, [character])

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): { x: number; y: number } | null => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in e) {
      const touch = e.touches[0]
      if (!touch) return null
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const coords = getCoordinates(e)
    if (!coords) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(coords.x, coords.y)
    setIsDrawing(true)
  }

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return

    const coords = getCoordinates(e)
    if (!coords) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#000000'
    ctx.lineTo(coords.x, coords.y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    draw(e)
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'write' as TabType, label: '쓰기 연습' },
    { id: 'animation' as TabType, label: '애니메이션' },
    { id: 'steps' as TabType, label: '단계별' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-black dark:text-white">
            {character}
            <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400 ml-2">
              ({reading})
            </span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="닫기"
          >
            <svg
              className="w-6 h-6 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'write' && (
          <>
            {/* 캔버스 영역 */}
            <div className="relative w-full aspect-square bg-white rounded-lg border-2 border-zinc-200 dark:border-zinc-700 overflow-hidden">
              {/* 격자 배경 (항상 표시) */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <svg viewBox="0 0 109 109" className="w-full h-full">
                  <line
                    x1="54.5"
                    y1="0"
                    x2="54.5"
                    y2="109"
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                    strokeDasharray="4,4"
                  />
                  <line
                    x1="0"
                    y1="54.5"
                    x2="109"
                    y2="54.5"
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                    strokeDasharray="4,4"
                  />
                </svg>
              </div>
              {/* KanjiVG 가이드 */}
              {showGuide && guideStrokes.length > 0 && (
                <div className="absolute inset-0 pointer-events-none z-0">
                  <svg viewBox="0 0 109 109" className="w-full h-full">
                    {guideStrokes.map((stroke) => (
                      <path
                        key={stroke.id}
                        d={stroke.d}
                        fill="none"
                        stroke="#d1d5db"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}
                  </svg>
                </div>
              )}
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="relative z-10 w-full h-full cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={handleTouchMove}
                onTouchEnd={stopDrawing}
              />
            </div>

            {/* 가이드 토글 */}
            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showGuide}
                onChange={(e) => setShowGuide(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              가이드 문자 보기
            </label>

            {/* 버튼들 */}
            <div className="flex gap-2">
              <button
                onClick={clearCanvas}
                className="flex-1 py-3 px-4 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-black dark:text-white font-medium rounded-lg transition-colors"
              >
                지우기
              </button>
              {onPlaySound && (
                <button
                  onClick={onPlaySound}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  </svg>
                  발음 듣기
                </button>
              )}
            </div>
          </>
        )}

        {activeTab === 'animation' && (
          <StrokeOrderDisplay character={character} mode="animation" />
        )}

        {activeTab === 'steps' && (
          <StrokeOrderDisplay character={character} mode="steps" />
        )}
      </div>
    </div>
  )
}
