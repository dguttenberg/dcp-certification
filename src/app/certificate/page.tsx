'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getCompletion, isDemo, resetDemoData } from '@/lib/demo-store'
import type { Completion } from '@/lib/types'
import { Download } from 'lucide-react'
import jsPDF from 'jspdf'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function CertificatePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [completion, setCompletion] = useState<Completion | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (loading) return

    const record = getCompletion()
    if (!record) {
      router.replace('/quiz')
      return
    }

    setCompletion(record)
    setReady(true)
  }, [loading, router])

  function handleDownload() {
    if (!completion || !user) return

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const centerX = pageWidth / 2

    // Border
    doc.setDrawColor(30, 58, 138) // brand-950
    doc.setLineWidth(0.8)
    doc.rect(15, 15, pageWidth - 30, doc.internal.pageSize.getHeight() - 30)
    doc.setLineWidth(0.3)
    doc.rect(18, 18, pageWidth - 36, doc.internal.pageSize.getHeight() - 36)

    // DCP wordmark
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(40)
    doc.setTextColor(30, 58, 138)
    doc.text('DCP', centerX, 55, { align: 'center' })

    // Decorative line
    doc.setDrawColor(30, 58, 138)
    doc.setLineWidth(0.5)
    doc.line(centerX - 40, 62, centerX + 40, 62)

    // Certificate of completion
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.setTextColor(134, 142, 150) // surface-600
    doc.text('CERTIFICATE OF COMPLETION', centerX, 78, { align: 'center' })

    // This certifies that
    doc.setFontSize(11)
    doc.setTextColor(73, 80, 87) // surface-700
    doc.text('This certifies that', centerX, 98, { align: 'center' })

    // Employee name
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(28)
    doc.setTextColor(33, 37, 41) // surface-900
    doc.text(user.full_name, centerX, 115, { align: 'center' })

    // has successfully completed the
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(73, 80, 87)
    doc.text('has successfully completed the', centerX, 130, { align: 'center' })

    // Course name
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(30, 58, 138)
    doc.text('DCP AI Foundations Certification', centerX, 145, { align: 'center' })

    // Date
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(73, 80, 87)
    doc.text(formatDate(completion.completed_at), centerX, 160, { align: 'center' })

    // Horizontal line
    doc.setDrawColor(206, 212, 218)
    doc.setLineWidth(0.3)
    doc.line(centerX - 50, 175, centerX + 50, 175)

    // Signatory
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(16)
    doc.setTextColor(33, 37, 41)
    doc.text('Doug Guttenberg', centerX, 195, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(73, 80, 87)
    doc.text('EVP, AI Innovation and Delivery', centerX, 203, { align: 'center' })
    doc.text('DonerColle Partners', centerX, 210, { align: 'center' })

    // Certificate ID
    doc.setFont('courier', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(173, 181, 189) // surface-500
    doc.text(`Certificate ID: ${completion.id}`, centerX, 250, { align: 'center' })

    const safeName = user.full_name.replace(/\s+/g, '-')
    doc.save(`DCP-AI-Certification-${safeName}.pdf`)
  }

  if (loading || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="animate-pulse text-surface-400 text-lg">Loading...</div>
      </div>
    )
  }

  if (!completion || !user) return null

  return (
    <div className="min-h-screen bg-surface-50 py-12 px-4 flex flex-col items-center">
      {/* Certificate card */}
      <div className="w-full max-w-2xl bg-white border-2 border-surface-300 rounded-sm shadow-lg p-10 md:p-14 animate-fade-in">
        {/* Inner decorative border */}
        <div className="border border-surface-200 p-8 md:p-12">
          {/* DCP wordmark */}
          <div className="text-center mb-2">
            <h1 className="text-5xl font-bold tracking-widest text-brand-950">
              DCP
            </h1>
          </div>

          {/* Decorative line */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-px bg-brand-950" />
          </div>

          {/* Certificate of completion */}
          <p className="text-center text-xs tracking-[0.3em] uppercase text-surface-500 mb-10">
            Certificate of Completion
          </p>

          {/* This certifies that */}
          <p className="text-center text-sm text-surface-600 mb-3">
            This certifies that
          </p>

          {/* Employee name */}
          <h2 className="text-center text-3xl md:text-4xl font-semibold tracking-wide text-surface-900 font-serif mb-3">
            {user.full_name}
          </h2>

          {/* has successfully completed the */}
          <p className="text-center text-sm text-surface-600 mb-4">
            has successfully completed the
          </p>

          {/* Course name */}
          <h3 className="text-center text-xl md:text-2xl font-bold text-brand-950 mb-4">
            DCP AI Foundations Certification
          </h3>

          {/* Date */}
          <p className="text-center text-sm text-surface-600 mb-8">
            {formatDate(completion.completed_at)}
          </p>

          {/* Horizontal line */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-px bg-surface-300" />
          </div>

          {/* Signatory */}
          <div className="text-center mb-10">
            <p className="text-lg italic text-surface-800 mb-1">
              Doug Guttenberg
            </p>
            <p className="text-sm text-surface-600">
              EVP, AI Innovation and Delivery
            </p>
            <p className="text-sm text-surface-600">
              DonerColle Partners
            </p>
          </div>

          {/* Certificate ID */}
          <p className="text-center text-xs font-mono text-surface-400">
            Certificate ID: {completion.id}
          </p>
        </div>
      </div>

      {/* Download button */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-700 text-white rounded-lg font-medium hover:bg-brand-800 transition-colors shadow-md hover:shadow-lg"
        >
          <Download className="w-5 h-5" />
          Download Certificate
        </button>

        {isDemo() && (
          <button
            onClick={() => {
              resetDemoData()
              localStorage.removeItem('dcp-cert-signed-in')
              window.location.href = '/'
            }}
            className="text-sm text-surface-400 hover:text-surface-600 transition-colors"
          >
            Reset progress &amp; start over (demo)
          </button>
        )}
      </div>
    </div>
  )
}
