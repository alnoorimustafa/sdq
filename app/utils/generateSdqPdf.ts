import { PDFDocument, StandardFonts } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

export interface SdqScores {
  total: number
  emotional: number
  conduct: number
  hyper: number
  peer: number
  prosocial: number
}

export interface SdqBands {
  total: string
  emotional: string
  conduct: string
  hyper: string
  peer: string
  prosocial: string
}

export interface GenerateSdqPdfInput {
  responses: Record<number, 0 | 1 | 2>
  scores: SdqScores
  bands: SdqBands
  summaryPngDataUrl: string
  info: string
}

export async function generateSdqPdf({
  responses,
  summaryPngDataUrl,
  info
}: GenerateSdqPdfInput) {
  // Load template PDF
  const existingPdfBytes = await fetch('/forms/sdq_ar_self.pdf').then((r) =>
    r.arrayBuffer()
  )
  const pdfDoc = await PDFDocument.load(existingPdfBytes)

  pdfDoc.registerFontkit(fontkit)

  const fontBytes = await fetch('/fonts/NotoKufiArabic-Medium.ttf').then((r) =>
    r.arrayBuffer()
  )
  const arabicFont = await pdfDoc.embedFont(fontBytes)

  const page = pdfDoc.getPage(0)

  //   const font = await pdfDoc.embedFont(StandardFonts.TimesRoman)

  // Checkbox coordinates for each item (example)
  // You will fill these based on your PDF
  const checkboxCoords = {
    1: { notTrue: [151, 635], somewhat: [99, 635], certainly: [48, 635] },
    2: { notTrue: [151, 615], somewhat: [99, 615], certainly: [48, 615] },
    3: { notTrue: [151, 595], somewhat: [99, 595], certainly: [48, 595] },
    4: { notTrue: [151, 575], somewhat: [99, 575], certainly: [48, 575] },
    5: { notTrue: [151, 555], somewhat: [99, 555], certainly: [48, 555] },
    6: { notTrue: [151, 535], somewhat: [99, 535], certainly: [48, 535] },
    7: { notTrue: [151, 515], somewhat: [99, 515], certainly: [48, 515] },
    8: { notTrue: [151, 495], somewhat: [99, 495], certainly: [48, 495] },
    9: { notTrue: [151, 475], somewhat: [99, 475], certainly: [48, 475] },
    10: { notTrue: [151, 455], somewhat: [99, 455], certainly: [48, 455] },
    11: { notTrue: [151, 435], somewhat: [99, 435], certainly: [48, 435] },
    12: { notTrue: [151, 414], somewhat: [99, 414], certainly: [48, 414] },
    13: { notTrue: [151, 394], somewhat: [99, 394], certainly: [48, 394] },
    14: { notTrue: [151, 374], somewhat: [99, 374], certainly: [48, 374] },
    15: { notTrue: [151, 353], somewhat: [99, 353], certainly: [48, 353] },
    16: { notTrue: [151, 333], somewhat: [99, 333], certainly: [48, 333] },
    17: { notTrue: [151, 313], somewhat: [99, 313], certainly: [48, 313] },
    18: { notTrue: [151, 293], somewhat: [99, 293], certainly: [48, 293] },
    19: { notTrue: [151, 273], somewhat: [99, 273], certainly: [48, 273] },
    20: { notTrue: [151, 253], somewhat: [99, 253], certainly: [48, 253] },
    21: { notTrue: [151, 233], somewhat: [99, 233], certainly: [48, 233] },
    22: { notTrue: [151, 213], somewhat: [99, 213], certainly: [48, 213] },
    23: { notTrue: [151, 193], somewhat: [99, 193], certainly: [48, 193] },
    24: { notTrue: [151, 173], somewhat: [99, 173], certainly: [48, 173] },
    25: { notTrue: [151, 153], somewhat: [99, 153], certainly: [48, 153] }
  }

  // Draw checkmarks
  Object.entries(responses).forEach(([id, value]) => {
    const coords =
      // @ts-ignore
      checkboxCoords[id][
        value === 0 ? 'notTrue' : value === 1 ? 'somewhat' : 'certainly'
      ]

    page.drawText('x', {
      x: coords[0],
      y: coords[1],
      size: 20,
      font: arabicFont
    })
  })

  const pngBytes = await (await fetch(summaryPngDataUrl)).arrayBuffer()
  const pngImage = await pdfDoc.embedPng(pngBytes)
  const pngDims = pngImage.scale(0.7) // adjust scale

  const x = -150
  const y = -13 // adjust down/up until it sits where you want
  page.drawImage(pngImage, {
    x,
    y,
    width: pngDims.width,
    height: pngDims.height
  })

  const pngBytesInfo = await (await fetch(info)).arrayBuffer()
  const pngImageInfo = await pdfDoc.embedPng(pngBytesInfo)
  const pngDimsInfo = pngImageInfo.scale(0.7) // adjust scale

  const xInfo = -50
  const yInfo = 640 // adjust down/up until it sits where you want
  page.drawImage(pngImageInfo, {
    x: xInfo,
    y: yInfo,
    width: pngDimsInfo.width,
    height: pngDimsInfo.height
  })

  // Save new PDF
  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}
