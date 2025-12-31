import { PDFDocument } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

export interface WemwbsInput {
  responses: Record<number, number> // 1..5
  totalScore: number
  interpretation: string
  summaryPngDataUrl: string
  infoPngDataUrl: string
}

export async function generateWemwbsPdf({
  responses,
  summaryPngDataUrl,
  infoPngDataUrl
}: WemwbsInput) {
  // Load template PDF
  const existingPdfBytes = await fetch('/forms/wemwbs.pdf').then((r) =>
    r.arrayBuffer()
  )
  const pdfDoc = await PDFDocument.load(existingPdfBytes)

  pdfDoc.registerFontkit(fontkit)

  const fontBytes = await fetch('/fonts/NotoKufiArabic-Medium.ttf').then((r) =>
    r.arrayBuffer()
  )
  const arabicFont = await pdfDoc.embedFont(fontBytes)

  const page = pdfDoc.getPage(0)

  // Coordinates for 14 questions, 5 options each.
  // These are placeholders. You may need to adjust x and y values based on the actual PDF layout.
  // Assuming a vertical list of questions.
  // Columns (approximate x positions for 5 check boxes)
  // 1: None of the time, 2: Rarely, 3: Some of the time, 4: Often, 5: All of the time
  // RTL: So column 1 might be on the right or left depending on form design.
  // Usually in Arabic forms: Questions on Right. Options to the Left.
  // Let's assume standard grid.
  // We'll define a configured Y start and step.

  const startY = 640 // Guessing
  const stepY = 21.5 // Guessing
  const xPositions = [350, 280, 210, 140, 70] // Guessing 5 columns

  // If we want exact coordinates like SDQ, we can structure it similarly.
  // Since I don't know the exact coords, I'll generate them programmatically for now
  // and the user can tweak the 'startY', 'stepY', and 'xPositions'.

  // We have 14 questions.
  // Q1 is at top options.

  const checkboxCoords: Record<number, Record<number, [number, number]>> = {}

  for (let i = 1; i <= 14; i++) {
    // Top-down
    const y = startY - (i - 1) * stepY
    checkboxCoords[i] = {
      1: [xPositions[0]!, y],
      2: [xPositions[1]!, y],
      3: [xPositions[2]!, y],
      4: [xPositions[3]!, y],
      5: [xPositions[4]!, y]
    }
  }

  // NOTE: User might need to manually callibrate these coords.
  // I will leave the manual calibration map commented out or use this loop as a configurable base.

  // Actually, let's copy the style of SDQ's explicit map for easier manual editing later if needed.
  // But purely explicit is tedious to write blindly. I'll stick to the loop but log a warning or comment.

  // Draw checkmarks
  Object.entries(responses).forEach(([id, value]) => {
    const qId = Number(id)
    if (checkboxCoords[qId] && checkboxCoords[qId][value]) {
      const [x, y] = checkboxCoords[qId][value]
      page.drawText('X', {
        x,
        y,
        size: 14,
        font: arabicFont
      })
    }
  })

  // Embed Summary Image (Results)
  if (summaryPngDataUrl) {
    const pngBytes = await (await fetch(summaryPngDataUrl)).arrayBuffer()
    const pngImage = await pdfDoc.embedPng(pngBytes)
    const pngDims = pngImage.scale(0.7)

    // Position for results summary - likely at the bottom or a specific box
    // SDQ puts it at x=-150, y=-13 (bottom left?)
    // I'll put it somewhere visible.
    page.drawImage(pngImage, {
      x: -80,
      y: 150, // Bottom of page
      width: pngDims.width,
      height: pngDims.height
    })
  }

  // Embed Info Image (Name, Date, etc)
  if (infoPngDataUrl) {
    const pngBytesInfo = await (await fetch(infoPngDataUrl)).arrayBuffer()
    const pngImageInfo = await pdfDoc.embedPng(pngBytesInfo)
    const pngDimsInfo = pngImageInfo.scale(0.7)

    // Position for info - top of page?
    page.drawImage(pngImageInfo, {
      x: 10,
      y: 220, // Bottom of page
      width: pngDimsInfo.width,
      height: pngDimsInfo.height
    })
  }

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}
