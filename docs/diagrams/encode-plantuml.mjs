// Encode PlantUML text to server URL form using deflateRaw + PlantUML base64
import { readFileSync } from 'fs'
import { deflateRawSync } from 'zlib'

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_' // PlantUML 64 alphabet

function toPlantUmlBase64(data) {
  let out = ''
  for (let i = 0; i < data.length; i += 3) {
    const b1 = data[i]
    const b2 = i + 1 < data.length ? data[i + 1] : 0
    const b3 = i + 2 < data.length ? data[i + 2] : 0

    const c1 = (b1 >> 2) & 0x3f
    const c2 = ((b1 & 0x3) << 4) | ((b2 >> 4) & 0x0f)
    const c3 = ((b2 & 0x0f) << 2) | ((b3 >> 6) & 0x03)
    const c4 = b3 & 0x3f

    out += alphabet[c1] + alphabet[c2] + alphabet[c3] + alphabet[c4]
  }
  return out
}

function encode(text) {
  const utf8 = Buffer.from(text, 'utf8')
  const deflated = deflateRawSync(utf8)
  return toPlantUmlBase64(deflated)
}

function buildUrl(kind, encoded) {
  const base = 'https://www.plantuml.com/plantuml'
  return `${base}/${kind}/${encoded}`
}

function gen(file, kind = 'png') {
  const src = readFileSync(file, 'utf8')
  const enc = encode(src)
  return buildUrl(kind, enc)
}

const files = [
  'c://SGP-clerk//togetherflow-app//docs//diagrams//current-usecase.puml',
  'c://SGP-clerk//togetherflow-app//docs//diagrams//planned-usecase.puml',
]

for (const f of files) {
  const url = gen(f, 'png')
  console.log(`${f} -> ${url}`)
}