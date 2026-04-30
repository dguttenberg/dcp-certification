'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { fetchCompletion } from '@/lib/data'
import { isDemo, resetDemoData } from '@/lib/demo-store'
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
    let cancelled = false
    ;(async () => {
      const record = await fetchCompletion()
      if (cancelled) return
      if (!record) {
        router.replace('/quiz')
        return
      }
      setCompletion(record)
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [loading, router])

  function handleDownload() {
    if (!completion || !user) return

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const centerX = pageWidth / 2

    // DCP midnight background
    doc.setFillColor(0, 5, 49)
    doc.rect(0, 0, pageWidth, pageHeight, 'F')

    // Aurora green accent border
    doc.setDrawColor(32, 254, 143)
    doc.setLineWidth(1.2)
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24)

    // Logo mark
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(42)
    doc.setTextColor(32, 254, 143)
    doc.text('DCP', centerX, 50, { align: 'center' })

    // Wordmark
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text('DONER  COLLE  PARTNERS.', centerX, 58, { align: 'center' })

    // Green rule
    doc.setDrawColor(32, 254, 143)
    doc.setLineWidth(0.6)
    doc.line(centerX - 30, 66, centerX + 30, 66)

    // Eyebrow
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(84, 93, 255)
    doc.text('CERTIFICATE OF COMPLETION', centerX, 84, { align: 'center' })

    // This certifies that
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(255, 255, 255)
    doc.text('This certifies that', centerX, 106, { align: 'center' })

    // Employee name
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(30)
    doc.setTextColor(255, 255, 255)
    doc.text(user.full_name, centerX, 124, { align: 'center' })

    // has successfully completed the
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(255, 255, 255)
    doc.text('has successfully completed the', centerX, 140, { align: 'center' })

    // Course name
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(32, 254, 143)
    doc.text('DCP AI Foundations Certification', centerX, 156, { align: 'center' })

    // Date
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(220, 222, 232)
    doc.text(formatDate(completion.completed_at), centerX, 172, { align: 'center' })

    // Divider
    doc.setDrawColor(84, 93, 255)
    doc.setLineWidth(0.4)
    doc.line(centerX - 50, 190, centerX + 50, 190)

    // Signatory
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(16)
    doc.setTextColor(255, 255, 255)
    doc.text('Doug Guttenberg', centerX, 210, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(200, 202, 210)
    doc.text('EVP, AI INNOVATION & DELIVERY', centerX, 218, { align: 'center' })
    doc.text('DonerColle Partners', centerX, 224, { align: 'center' })

    // Certificate ID
    doc.setFont('courier', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(140, 144, 160)
    doc.text(`Certificate ID: ${completion.id}`, centerX, 260, { align: 'center' })

    const safeName = user.full_name.replace(/\s+/g, '-')
    doc.save(`DCP-AI-Certification-${safeName}.pdf`)
  }

  if (loading || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-aurora-violet/30 border-t-aurora-violet" />
      </div>
    )
  }

  if (!completion || !user) return null

  return (
    <div className="min-h-screen bg-offwhite py-12 px-4 flex flex-col items-center">
      {/* Certificate card */}
      <div className="w-full max-w-2xl relative bg-midnight border border-aurora-green/30 rounded-2xl shadow-2xl p-8 md:p-12 overflow-hidden animate-fade-in">
        {/* Atmospheric accents */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-aurora-violet/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-aurora-green/10 blur-3xl pointer-events-none" />

        {/* Inner border */}
        <div className="relative border border-aurora-violet/30 rounded-xl p-8 md:p-10">
          {/* Logo lockup */}
          <div className="flex justify-center">
            <div className="dcp-logo">
              <span className="dcp-logo-mark" style={{ fontSize: '32px' }}>DCP</span>
              <span className="dcp-logo-wordmark">Doner<br />Colle<br />Partners.</span>
            </div>
          </div>

          {/* Green rule */}
          <div className="flex justify-center mt-6 mb-8">
            <div className="w-16 h-[2px] bg-aurora-green" />
          </div>

          {/* Eyebrow */}
          <p className="text-center dcp-eyebrow mb-10">
            Certificate of Completion
          </p>

          {/* This certifies that */}
          <p className="text-center text-sm text-white/60 mb-3">
            This certifies that
          </p>

          {/* Employee name */}
          <h2 className="text-center text-3xl md:text-4xl font-bold tracking-tight text-white uppercase mb-3">
            {user.full_name}
          </h2>

          <p className="text-center text-sm text-white/60 mb-4">
            has successfully completed the
          </p>

          <h3 className="text-center text-xl md:text-2xl font-bold text-aurora-green uppercase tracking-tight mb-4">
            DCP AI Foundations Certification
          </h3>

          <p className="text-center text-sm text-white/70 mb-8">
            {formatDate(completion.completed_at)}
          </p>

          <div className="flex justify-center mb-8">
            <div className="w-24 h-px bg-aurora-violet/40" />
          </div>

          <div className="text-center mb-8">
            <p className="text-lg italic text-white mb-1">
              Doug Guttenberg
            </p>
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-aurora-violet">
              EVP, AI Innovation & Delivery
            </p>
            <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-white/50 mt-0.5">
              DonerColle Partners
            </p>
          </div>

          <p className="text-center text-[10px] font-mono text-white/30">
            Certificate ID: {completion.id}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <button
          onClick={handleDownload}
          className="dcp-btn-primary"
        >
          <Download className="w-4 h-4" />
          Download Certificate
        </button>

        {isDemo() && (
          <button
            onClick={() => {
              resetDemoData()
              localStorage.removeItem('dcp-cert-signed-in')
              window.location.href = '/'
            }}
            className="text-xs font-semibold tracking-[0.15em] uppercase text-surface-500 hover:text-aurora-violet transition-colors"
          >
            Reset progress &amp; start over (demo)
          </button>
        )}
      </div>
    </div>
  )
}
