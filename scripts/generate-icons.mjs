// Generates PWA PNG icons (navy barbell) with zero native dependencies.
// Pure Node: hand-rolled PNG encoder (RGBA, filter 0, zlib-deflated). Run: npm run icons
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

function encodePNG(size, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0 // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function makeIcon(S, pad) {
  const buf = Buffer.alloc(S * S * 4)
  const bg = [10, 18, 36, 255] // #0a1224
  const accent = [92, 158, 255, 255] // #5c9eff
  const accent2 = [143, 192, 255, 255] // #8fc0ff
  for (let i = 0; i < S * S; i++) {
    buf[i * 4] = bg[0]
    buf[i * 4 + 1] = bg[1]
    buf[i * 4 + 2] = bg[2]
    buf[i * 4 + 3] = bg[3]
  }
  const fillRect = (x0, y0, x1, y1, c) => {
    const xa = Math.max(0, Math.round(x0)), xb = Math.min(S, Math.round(x1))
    const ya = Math.max(0, Math.round(y0)), yb = Math.min(S, Math.round(y1))
    for (let y = ya; y < yb; y++)
      for (let x = xa; x < xb; x++) {
        const i = (y * S + x) * 4
        buf[i] = c[0]
        buf[i + 1] = c[1]
        buf[i + 2] = c[2]
        buf[i + 3] = c[3]
      }
  }
  const m = pad * S
  const span = S - 2 * m
  const cy = S / 2
  const barH = span * 0.07
  fillRect(m + span * 0.2, cy - barH / 2, m + span * 0.8, cy + barH / 2, accent) // bar
  const ipH = span * 0.3, ipW = span * 0.055 // inner plates
  fillRect(m + span * 0.27, cy - ipH / 2, m + span * 0.27 + ipW, cy + ipH / 2, accent2)
  fillRect(m + span * 0.665, cy - ipH / 2, m + span * 0.665 + ipW, cy + ipH / 2, accent2)
  const opH = span * 0.2, opW = span * 0.05 // outer plates
  fillRect(m + span * 0.205, cy - opH / 2, m + span * 0.205 + opW, cy + opH / 2, accent)
  fillRect(m + span * 0.745, cy - opH / 2, m + span * 0.745 + opW, cy + opH / 2, accent)
  return encodePNG(S, buf)
}

mkdirSync('public/icons', { recursive: true })
const targets = [
  ['public/icons/icon-192.png', 192, 0.1],
  ['public/icons/icon-512.png', 512, 0.1],
  ['public/icons/icon-512-maskable.png', 512, 0.2],
  ['public/icons/apple-touch-icon-180.png', 180, 0.12],
]
for (const [path, size, pad] of targets) {
  writeFileSync(path, makeIcon(size, pad))
  console.log('wrote', path)
}
