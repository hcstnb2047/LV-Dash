import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useKnowledge } from '../hooks/useKnowledge'
import { getFileContent } from '../lib/knowledge'
import { MarkdownContent } from '../components/MarkdownContent'
import type { FlashCard, SRSRating, SessionSummary } from '../types/srs'

// ── Header ──────────────────────────────────────────────────────────────────

function FlashcardHeader({ current, total }: { current: number; total: number }) {
  const progress = total === 0 ? 100 : Math.round((current / total) * 100)
  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex items-center justify-between font-mono text-xs text-zinc-500 mb-2">
        <span className="uppercase tracking-widest">Flashcards</span>
        <span className="text-sky-400">
          {current} / {total}
        </span>
      </div>
      <div className="h-px bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-sky-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// ── Rating Buttons ───────────────────────────────────────────────────────────

const RATINGS: { rating: SRSRating; label: string; className: string }[] = [
  { rating: 0, label: 'AGAIN', className: 'border-red-800 text-red-400 hover:bg-red-400 hover:text-zinc-950' },
  { rating: 1, label: 'HARD', className: 'border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100' },
  { rating: 2, label: 'GOOD', className: 'border-sky-600 text-sky-500 hover:bg-sky-500 hover:text-zinc-950' },
  { rating: 3, label: 'EASY', className: 'border-sky-400 text-sky-400 hover:bg-sky-400 hover:text-zinc-950' },
]

function RatingButtons({ onRate }: { onRate: (r: SRSRating) => void }) {
  return (
    <div className="fixed bottom-16 left-0 right-0 flex gap-2 px-4 pb-2">
      {RATINGS.map(({ rating, label, className }) => (
        <button
          key={rating}
          onClick={() => onRate(rating)}
          className={`flex-1 font-mono rounded border px-2 py-3 text-xs uppercase tracking-wider transition-colors ${className}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ── Session Summary ──────────────────────────────────────────────────────────

function SessionSummaryView({ summary }: { summary: SessionSummary }) {
  const navigate = useNavigate()
  const ratingLabels: Record<SRSRating, string> = { 0: 'AGAIN', 1: 'HARD', 2: 'GOOD', 3: 'EASY' }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="font-mono text-sky-400 text-xs tracking-widest uppercase mb-6">
        [ SESSION COMPLETE ]
      </div>
      <p className="font-mono text-zinc-100 text-lg mb-1">{summary.total} cards reviewed</p>
      <div className="flex gap-4 mt-4 mb-8">
        {(Object.entries(summary.ratings) as [string, number][])
          .filter(([, count]) => count > 0)
          .map(([r, count]) => {
            const rating = Number(r) as SRSRating
            return (
              <div key={r} className="text-center">
                <div className="font-mono text-xs text-zinc-500 uppercase mb-1">{ratingLabels[rating]}</div>
                <div className="font-mono text-sky-400 text-xl">{count}</div>
              </div>
            )
          })}
      </div>
      <button
        onClick={() => navigate('/')}
        className="font-mono rounded border border-sky-400 text-sky-400 px-6 py-2.5 text-xs uppercase tracking-wider hover:bg-sky-400 hover:text-zinc-950 transition-colors"
      >
        Back to Knowledge
      </button>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

type Phase = 'front' | 'back'

export function FlashcardsPage() {
  const { pat, buildCards, recordReview } = useApp()
  const { files, loading: filesLoading } = useKnowledge(pat)
  const navigate = useNavigate()

  const [cards, setCards] = useState<FlashCard[]>([])
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    if (!filesLoading && !sessionReady) {
      setCards(buildCards(files))
      setSessionReady(true)
    }
  }, [files, filesLoading, sessionReady, buildCards])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('front')
  const [content, setContent] = useState<string | null>(null)
  const [contentLoading, setContentLoading] = useState(false)
  const [summary, setSummary] = useState<SessionSummary | null>(null)
  const [dragOffsetX, setDragOffsetX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [summaryRatings, setSummaryRatings] = useState<Record<SRSRating, number>>({ 0: 0, 1: 0, 2: 0, 3: 0 })

  const dragStartX = useRef<number | null>(null)

  const currentCard = cards[currentIndex]
  const screenWidth = window.innerWidth

  const handleReveal = useCallback(async () => {
    if (phase === 'front' && currentCard && pat) {
      setPhase('back')
      setContentLoading(true)
      try {
        const text = await getFileContent(pat, currentCard.file.path)
        setContent(text)
      } catch {
        setContent('コンテンツを取得できませんでした')
      } finally {
        setContentLoading(false)
      }
    }
  }, [phase, currentCard, pat])

  const advance = useCallback(
    (rating: SRSRating) => {
      if (!currentCard) return
      recordReview(currentCard.file.path, rating)
      setSummaryRatings((prev) => ({ ...prev, [rating]: prev[rating] + 1 }))

      const nextIndex = currentIndex + 1
      if (nextIndex >= cards.length) {
        setSummary({ total: cards.length, ratings: { ...summaryRatings, [rating]: summaryRatings[rating] + 1 } })
      } else {
        setCurrentIndex(nextIndex)
        setPhase('front')
        setContent(null)
        setDragOffsetX(0)
      }
    },
    [currentCard, currentIndex, cards.length, recordReview, summaryRatings],
  )

  const handleRate = useCallback(
    (rating: SRSRating) => {
      setIsExiting(true)
      setTimeout(() => {
        setIsExiting(false)
        advance(rating)
      }, 250)
    },
    [advance],
  )

  // Swipe handlers
  const onPointerDown = (e: React.PointerEvent) => {
    if (phase !== 'front') return
    dragStartX.current = e.clientX
    setIsDragging(true)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current === null || !isDragging) return
    setDragOffsetX(e.clientX - dragStartX.current)
  }

  const onPointerUp = () => {
    if (dragStartX.current === null) return
    const threshold = screenWidth * 0.3
    setIsDragging(false)
    if (dragOffsetX > threshold) {
      handleRate(2) // GOOD
    } else if (dragOffsetX < -threshold) {
      handleRate(0) // AGAIN
    } else {
      setDragOffsetX(0)
    }
    dragStartX.current = null
  }

  if (!pat) return null

  if (!sessionReady) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
      </div>
    )
  }

  if (summary) {
    return (
      <div className="flex-1 flex flex-col bg-zinc-950">
        <SessionSummaryView summary={summary} />
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-950">
        <div className="font-mono text-sky-400 text-xs tracking-widest uppercase mb-6">
          [ ALL CLEAR ]
        </div>
        <p className="font-mono text-zinc-400 text-sm mb-6">本日の復習カードはありません</p>
        <button
          onClick={() => navigate('/')}
          className="font-mono rounded border border-sky-400 text-sky-400 px-6 py-2.5 text-xs uppercase tracking-wider hover:bg-sky-400 hover:text-zinc-950 transition-colors"
        >
          Back to Knowledge
        </button>
      </div>
    )
  }

  if (!currentCard) return null

  const rotation = isDragging ? dragOffsetX / 20 : 0
  const cardStyle: React.CSSProperties = {
    transform: isExiting
      ? `translateX(${dragOffsetX > 0 ? '120%' : '-120%'}) rotate(${rotation}deg)`
      : `translateX(${dragOffsetX}px) rotate(${rotation}deg)`,
    transition: isDragging ? 'none' : 'transform 250ms ease-out',
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 select-none">
      <FlashcardHeader current={currentIndex} total={cards.length} />

      {/* Card area */}
      <div className="flex-1 flex items-start justify-center px-4 pt-4 pb-40 overflow-hidden">
        <div
          className="relative w-full rounded border border-zinc-800 bg-zinc-900 cursor-pointer"
          style={cardStyle}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onClick={phase === 'front' ? handleReveal : undefined}
        >
          {/* Swipe hint labels */}
          {isDragging && dragOffsetX > 20 && (
            <div className="absolute left-3 top-3 font-mono text-xs text-sky-400 uppercase tracking-widest">GOOD</div>
          )}
          {isDragging && dragOffsetX < -20 && (
            <div className="absolute right-3 top-3 font-mono text-xs text-red-400 uppercase tracking-widest">AGAIN</div>
          )}

          <div className="p-5">
            {/* Category badge */}
            <div className="font-mono text-[10px] text-sky-400 uppercase tracking-widest mb-4">
              {currentCard.file.category}
            </div>

            {/* Title */}
            <h2 className="font-mono text-base text-zinc-100 leading-snug mb-3">
              {currentCard.file.displayName}
            </h2>

            {currentCard.file.date && (
              <p className="font-mono text-xs text-zinc-500 mb-4">{currentCard.file.date}</p>
            )}

            {phase === 'front' ? (
              <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest mt-6">
                tap to reveal · swipe to rate
              </p>
            ) : contentLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
              </div>
            ) : content ? (
              <div className="mt-4 text-sm text-zinc-300 max-h-64 overflow-y-auto">
                <MarkdownContent content={content} />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Rating buttons (only in back phase) */}
      {phase === 'back' && !contentLoading && (
        <RatingButtons onRate={handleRate} />
      )}
    </div>
  )
}
