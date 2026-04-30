'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from 'lucide-react'
import { quizQuestions, PASS_THRESHOLD, TOTAL_QUESTIONS } from '@/content/quiz'
import {
  fetchSectionProgress,
  fetchCompletion,
  recordQuizAttempt,
  recordCompletion,
} from '@/lib/data'

type Stage = 'intro' | 'active' | 'results'

const REQUIRED_SECTIONS = 6
const PASS_SCORE = Math.ceil(TOTAL_QUESTIONS * PASS_THRESHOLD)

export default function QuizPage() {
  const router = useRouter()

  const [gateChecked, setGateChecked] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const completion = await fetchCompletion()
      if (cancelled) return
      if (completion) {
        router.replace('/certificate')
        return
      }
      const progress = await fetchSectionProgress()
      if (cancelled) return
      if (progress.length < REQUIRED_SECTIONS) {
        router.replace('/course')
        return
      }
      setGateChecked(true)
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  const [stage, setStage] = useState<Stage>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [slideDirection, setSlideDirection] = useState<'enter' | 'exit'>('enter')
  // Shuffled option order keyed by question id, regenerated per attempt.
  const [shuffledOptions, setShuffledOptions] = useState<Record<string, string[]>>({})

  const currentQuestion = quizQuestions[currentIndex]
  const isLastQuestion = currentIndex === TOTAL_QUESTIONS - 1
  const currentOptions = currentQuestion ? (shuffledOptions[currentQuestion.id] ?? currentQuestion.options) : []

  function shuffleAllOptions() {
    const next: Record<string, string[]> = {}
    for (const q of quizQuestions) {
      const arr = [...q.options]
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
      }
      next[q.id] = arr
    }
    setShuffledOptions(next)
  }

  const results = useMemo(() => {
    if (stage !== 'results') return null
    let correct = 0
    const incorrect: {
      question: string
      userAnswer: string
      correctAnswer: string
      explanation: string
    }[] = []

    quizQuestions.forEach((q) => {
      const userAnswer = answers[q.id] ?? ''
      if (userAnswer === q.correct) {
        correct++
      } else {
        incorrect.push({
          question: q.question,
          userAnswer,
          correctAnswer: q.correct,
          explanation: q.explanation,
        })
      }
    })

    return { correct, incorrect, passed: correct >= PASS_SCORE }
  }, [stage, answers])

  const handleBegin = useCallback(() => {
    shuffleAllOptions()
    setStage('active')
    setCurrentIndex(0)
    setAnswers({})
    setSelectedOption(null)
    setSlideDirection('enter')
  }, [])

  const handleSelectOption = useCallback((option: string) => {
    setSelectedOption(option)
  }, [])

  const handleNext = useCallback(async () => {
    if (!selectedOption || !currentQuestion) return

    const updatedAnswers = { ...answers, [currentQuestion.id]: selectedOption }
    setAnswers(updatedAnswers)

    if (isLastQuestion) {
      let correct = 0
      quizQuestions.forEach((q) => {
        if ((updatedAnswers[q.id] ?? '') === q.correct) correct++
      })
      const passed = correct >= PASS_SCORE

      try {
        const attempt = await recordQuizAttempt({
          score: correct,
          total: TOTAL_QUESTIONS,
          passed,
          answers: updatedAnswers,
        })
        if (passed) {
          await recordCompletion(attempt.id)
        }
      } catch (err) {
        console.error('Quiz submission error:', err)
      }

      setStage('results')
    } else {
      setSlideDirection('exit')
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
        setSelectedOption(null)
        setSlideDirection('enter')
      }, 200)
    }
  }, [selectedOption, currentQuestion, answers, isLastQuestion])

  const handleRetake = useCallback(() => {
    setStage('intro')
    setCurrentIndex(0)
    setAnswers({})
    setSelectedOption(null)
  }, [])

  if (!gateChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-aurora-violet/30 border-t-aurora-violet" />
      </div>
    )
  }

  // INTRO
  if (stage === 'intro') {
    return (
      <div className="min-h-screen dcp-gradient-dark flex items-center justify-center p-6">
        <div className="w-full max-w-xl text-center relative z-10">
          <span className="dcp-eyebrow dcp-eyebrow--green">Knowledge Check</span>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold uppercase tracking-tight text-white leading-[0.95]">
            Ready?
          </h1>
          <p className="mt-6 text-lg text-white/70 leading-relaxed">
            {TOTAL_QUESTIONS} questions. You need {PASS_SCORE} correct to pass ({Math.round(PASS_THRESHOLD * 100)}%). Take your time.
          </p>
          <button
            onClick={handleBegin}
            className="dcp-btn-primary mt-10"
          >
            Begin Quiz
            <ChevronRight className="h-4 w-4" />
          </button>
          <p className="mt-8 text-xs tracking-wider text-white/40">
            You can retake the quiz as many times as you need.
          </p>
        </div>
      </div>
    )
  }

  // ACTIVE
  if (stage === 'active' && currentQuestion) {
    const progress = ((currentIndex + 1) / TOTAL_QUESTIONS) * 100

    return (
      <div className="min-h-screen bg-offwhite flex flex-col">
        <div className="sticky top-0 z-10 bg-midnight border-b border-aurora-green/10 px-6 py-4">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-aurora-green">
                Question {currentIndex + 1} of {TOTAL_QUESTIONS}
              </span>
              <span className="text-[11px] font-semibold tracking-wider text-white/50">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-aurora-green transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div
            key={currentQuestion.id}
            className={`w-full max-w-2xl transition-all duration-200 ease-out ${
              slideDirection === 'enter'
                ? 'translate-x-0 opacity-100'
                : '-translate-x-8 opacity-0'
            }`}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-midnight mb-8 leading-tight tracking-tight">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3">
              {currentOptions.map((option) => {
                const isSelected = selectedOption === option
                return (
                  <button
                    key={option}
                    onClick={() => handleSelectOption(option)}
                    className={`w-full text-left rounded-xl border-2 p-5 transition-all duration-150 ${
                      isSelected
                        ? 'border-aurora-violet bg-aurora-violet/5 shadow-sm'
                        : 'border-surface-200 bg-white hover:border-aurora-violet/40 hover:shadow-sm'
                    }`}
                  >
                    <span
                      className={`text-base leading-relaxed ${
                        isSelected
                          ? 'text-midnight font-medium'
                          : 'text-surface-700'
                      }`}
                    >
                      {option}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                disabled={!selectedOption}
                className="dcp-btn-primary"
              >
                {isLastQuestion ? 'Submit' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // RESULTS — PASS
  if (stage === 'results' && results?.passed) {
    const hasMisses = results.incorrect.length > 0

    return (
      <div className="min-h-screen dcp-gradient-dark py-12 px-6">
        <div className="mx-auto max-w-2xl relative z-10">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-aurora-green">
              <CheckCircle2 className="h-10 w-10 text-midnight" strokeWidth={2.5} />
            </div>
            <span className="dcp-eyebrow dcp-eyebrow--green">You passed</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold uppercase tracking-tight text-white">
              Well done.
            </h1>
            <p className="mt-4 text-xl text-white/80">
              {results.correct}/{TOTAL_QUESTIONS} correct
            </p>
            <p className="mt-2 text-white/60">
              You&apos;ve completed the DCP AI Foundations Certification.
            </p>
            <a
              href="/certificate"
              className="dcp-btn-primary mt-10"
            >
              View Your Certificate
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          {hasMisses && (
            <div className="mt-14">
              <div className="text-center mb-6">
                <span className="dcp-eyebrow text-white/70">Worth a look</span>
                <h2 className="mt-2 text-2xl md:text-3xl font-bold text-white tracking-tight">
                  What you missed
                </h2>
                <p className="mt-2 text-white/60 text-sm">
                  You passed — but here&apos;s what to revisit so you don&apos;t miss it twice.
                </p>
              </div>
              <div className="space-y-4">
                {results.incorrect.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur p-6"
                  >
                    <p className="font-bold text-white mb-4">{item.question}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2">
                        <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-ember" />
                        <p className="text-white/80">
                          <span className="font-semibold text-ember">Your answer: </span>
                          {item.userAnswer || '(no answer)'}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-aurora-green" />
                        <p className="text-white/80">
                          <span className="font-semibold text-aurora-green">Correct: </span>
                          {item.correctAnswer}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // RESULTS — FAIL
  if (stage === 'results' && results && !results.passed) {
    return (
      <div className="min-h-screen bg-offwhite py-12 px-6">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-ember/15 border-2 border-ember">
              <XCircle className="h-10 w-10 text-ember" />
            </div>
            <span className="dcp-eyebrow" style={{ color: '#FF8371' }}>Not quite yet</span>
            <h1 className="mt-3 text-3xl md:text-4xl font-bold uppercase tracking-tight text-midnight">
              Review &amp; retake
            </h1>
            <p className="mt-4 text-xl text-surface-700">
              {results.correct}/{TOTAL_QUESTIONS} correct
            </p>
            <p className="mt-1 text-surface-600">
              You need {PASS_SCORE} out of {TOTAL_QUESTIONS} to pass. Here's what to review:
            </p>
          </div>

          <div className="space-y-4 mb-10">
            {results.incorrect.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm"
              >
                <p className="font-bold text-midnight mb-4">
                  {item.question}
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-ember" />
                    <p className="text-surface-700">
                      <span className="font-semibold text-ember">Your answer: </span>
                      {item.userAnswer || '(no answer)'}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-700" />
                    <p className="text-surface-700">
                      <span className="font-semibold text-accent-800">Correct: </span>
                      {item.correctAnswer}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-surface-600 leading-relaxed">
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleRetake}
              className="dcp-btn-primary"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </button>
            <a
              href="/course"
              className="dcp-btn-secondary"
              style={{ color: '#000531', borderColor: '#000531' }}
            >
              Review Material
            </a>
          </div>
        </div>
      </div>
    )
  }

  return null
}
