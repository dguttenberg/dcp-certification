import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'sections')

const API_KEY = process.env.GEMINI_API_KEY

// Using Imagen 4.0
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`

const STYLE_PREFIX = 'Modern editorial illustration, clean flat design, sophisticated and slightly playful, minimal palette of deep navy blue, electric blue, warm amber gold, and white. No text or lettering anywhere in the image. 16:9 aspect ratio composition.'

const prompts = [
  {
    filename: 'section-1-hero.png',
    prompt: `${STYLE_PREFIX} A massive swirling constellation of glowing dots and lines coalescing from chaos on the left into recognizable shapes on the right — a lightbulb, a document, a musical note. Represents AI pattern recognition transforming raw data into meaningful output. Abstract and elegant.`,
  },
  {
    filename: 'section-2-hero.png',
    prompt: `${STYLE_PREFIX} Two contrasting pathways. Left path leads through a secure glowing archway with a shield emblem, warm inviting light inside. Right path has a flimsy open gate with question marks floating above it and a caution sign. Represents the difference between enterprise-protected AI tools and consumer tools.`,
  },
  {
    filename: 'section-3-hero.png',
    prompt: `${STYLE_PREFIX} An elegant organized display case or shelf showing six distinct abstract tool shapes, each in its own illuminated compartment with a small glowing checkmark. Tools are abstract — a paintbrush shape, a document, a film reel, a brain, a pen nib, and a network graph. Clean and orderly, representing approved AI tools.`,
  },
  {
    filename: 'section-4-hero.png',
    prompt: `${STYLE_PREFIX} A person's silhouette at a desk with three translucent floating panels around them: one showing a padlock (data protection), one showing a compass rose (good direction and prompting), one showing a balanced scale (intellectual property). The person is thoughtfully considering them. Calm, focused energy.`,
  },
  {
    filename: 'section-5-hero.png',
    prompt: `${STYLE_PREFIX} Two abstract figures in conversation, with a glowing lightbulb forming in the space between them. One figure gestures toward the light. A clock on the wall shows an early hour. Represents the value of asking for help early. Warm, collaborative, calm mood.`,
  },
  {
    filename: 'section-6-hero.png',
    prompt: `${STYLE_PREFIX} Split composition. Left half: a neat organized desk with labeled folders and a single focused conversation bubble, representing a workspace agent. Right half: a dynamic cascade of connected action nodes — search, write, verify, deliver — flowing like an automated assembly line, representing agentic AI. Both sides connected by a thin glowing line.`,
  },
]

async function generateImage(promptText, filename) {
  console.log(`Generating: ${filename}...`)

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt: promptText }],
      parameters: {
        sampleCount: 1,
        aspectRatio: '16:9',
        personGeneration: 'DONT_ALLOW',
      },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    console.error(`  Failed ${filename}: ${response.status}`, text.slice(0, 300))
    return false
  }

  const data = await response.json()

  if (data.predictions && data.predictions.length > 0) {
    const imageBytes = data.predictions[0].bytesBase64Encoded
    const outputPath = path.join(OUTPUT_DIR, filename)
    fs.writeFileSync(outputPath, Buffer.from(imageBytes, 'base64'))
    console.log(`  ✓ Saved: ${filename}`)
    return true
  }

  console.error(`  No predictions returned for ${filename}`)
  return false
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  console.log(`Generating ${prompts.length} section hero images...\n`)

  let success = 0
  for (const { prompt, filename } of prompts) {
    const ok = await generateImage(prompt, filename)
    if (ok) success++
    // Rate limit spacing
    await new Promise(r => setTimeout(r, 2000))
  }

  console.log(`\nDone: ${success}/${prompts.length} images generated.`)
  if (success < prompts.length) {
    console.log('Some images failed. You can re-run the script to retry.')
  }
}

main().catch(console.error)
