'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Award } from 'lucide-react'
import { quizQuestions, PASS_THRESHOLD, TOTAL_QUESTIONS } from '@/content/quiz'
import {
  getSectionProgress,
  getCompletion,
  addQuizAttempt,
  setCompletion,
} from '@/lib/demo-store'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Stage = 'intro' | 'active' | 'results'

const REQUIRED_SECTIONS = 6
const PASS_SCORE = Math.ceil(TOTAL_QUESTIONS * PASS_THRESHOLD) // 7

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function QuizPage() {
  const router = useRouter()

  // Gate checks
  const [gateChecked, setGateChecked] = useState(false)

  useEffect(() => {
    const completion = getCompletion()
    if (completion) {
      router.replace('/certificate')
      return
    }
    const progress = getSectionProgress()
    if (progress.length < REQUIRED_SECTIONS) {
      router.replace('/course')
      return
    }
    setGateChecked(true)
  }, [router])

  // Quiz state
  const [stage, setStage] = useState<Stage>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [slideDirection, setSlideDirection] = useState<'enter' | 'exit'>('enter')

  const currentQuestion = quizQuestions[currentIndex]
  const isLastQuestion = currentIndex === TOTAL_QUESTIONS - 1

  // Results computation
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

  // Handlers
  const handleBegin = useCallback(() => {
    setStage('active')
    setCurrentIndex(0)
    setAnswers({})
    setSelectedOption(null)
    setSlideDirection('enter')
  }, [])

  const handleSelectOption = useCallback((option: string) => {
    setSelectedOption(option)
  }, [])

  const handleNext = useCallback(() => {
    if (!selectedOption || !currentQuestion) return

    const updatedAnswers = { ...answers, [currentQuestion.id]: selectedOption }
    setAnswers(updatedAnswers)

    if (isLastQuestion) {
      // Submit quiz
      let correct = 0
      quizQuestions.forEach((q) => {
        if ((updatedAnswers[q.id] ?? '') === q.correct) correct++
      })
      const passed = correct >= PASS_SCORE

      const attempt = addQuizAttempt({
        score: correct,
        total: TOTAL_QUESTIONS,
        passed,
        answers: updatedAnswers,
      })

      if (passed) {
        setCompletion(attempt.id)
      }

      setStage('results')
    } else {
      // Animate out then in
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

  // Don't render until gate check passes
  if (!gateChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // INTRO SCREEN
  // ---------------------------------------------------------------------------
  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Award className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Knowledge Check
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {TOTAL_QUESTIONS} questions. You need {PASS_SCORE} correct to pass ({Math.round(PASS_THRESHOLD * 100)}%). Take your time.
          </p>
          <button
            onClick={handleBegin}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Begin Quiz
            <ChevronRight className="h-5 w-5" />
          </button>
          <p className="mt-6 text-sm text-gray-400">
            You can retake the quiz as many times as you need.
          </p>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // ACTIVE QUIZ
  // ---------------------------------------------------------------------------
  if (stage === 'active' && currentQuestion) {
    const progress = ((currentIndex + 1) / TOTAL_QUESTIONS) * 100

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Progress bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">
                Question {currentIndex + 1} of {TOTAL_QUESTIONS}
              </span>
              <span className="text-sm font-medium text-gray-500">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question area */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div
            key={currentQuestion.id}
            className={`w-full max-w-2xl transition-all duration-200 ease-out ${
              slideDirection === 'enter'
                ? 'translate-x-0 opacity-100'
                : '-translate-x-8 opacity-0'
            }`}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOption === option
                return (
                  <button
                    key={option}
                    onClick={() => handleSelectOption(option)}
                    className={`w-full text-left rounded-xl border-2 p-5 transition-all duration-150 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className={`text-base leading-relaxed ${
                        isSelected
                          ? 'text-blue-900 font-medium'
                          : 'text-gray-700'
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
                className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 text-base font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  selectedOption
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLastQuestion ? 'Submit Quiz' : 'Next'}
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // RESULTS — PASS
  // ---------------------------------------------------------------------------
  if (stage === 'results' && results?.passed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            You passed!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            {results.correct}/{TOTAL_QUESTIONS} correct
          </p>
          <p className="text-gray-500 mb-8">
            Congratulations! You&apos;ve completed the DCP AI Foundations Certification.
          </p>
          <a
            href="/certificate"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View Your Certificate
            <ChevronRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // RESULTS — FAIL
  // ---------------------------------------------------------------------------
  if (stage === 'results' && results && !results.passed) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-6">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
              <XCircle className="h-10 w-10 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Not quite yet
            </h1>
            <p className="text-xl text-gray-600 mb-1">
              {results.correct}/{TOTAL_QUESTIONS} correct
            </p>
            <p className="text-gray-500">
              You need {PASS_SCORE} out of {TOTAL_QUESTIONS} to pass. Here&apos;s what to review:
            </p>
          </div>

          {/* Incorrect answers */}
          <div className="space-y-4 mb-10">
            {results.incorrect.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <p className="font-semibold text-gray-900 mb-4">
                  {item.question}
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                    <p className="text-red-700">
                      <span className="font-medium">Your answer:</span>{' '}
                      {item.userAnswer || '(no answer)'}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <p className="text-green-700">
                      <span className="font-medium">Correct answer:</span>{' '}
                      {item.correctAnswer}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleRetake}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <RotateCcw className="h-5 w-5" />
              Retake Quiz
            </button>
            <a
              href="/course"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Review Course Material
            </a>
          </div>
        </div>
      </div>
    )
  }

  return null
}
