import { describe, it, expect } from 'vitest'
import { parseCoordinates, parseCustomerExcel } from '../parser'
import fs from 'fs'
import path from 'path'

describe('parseCoordinates (BR-013)', () => {
  it('splits "lat, long" string into latitude and longitude correctly', () => {
    const res = parseCoordinates('-8.35123, 116.15432')
    expect(res.latitude).toBeCloseTo(-8.35123, 5)
    expect(res.longitude).toBeCloseTo(116.15432, 5)
  })

  it('splits semicolon separated coordinates', () => {
    const res = parseCoordinates('-8.50000; 116.20000')
    expect(res.latitude).toBeCloseTo(-8.5, 5)
    expect(res.longitude).toBeCloseTo(116.2, 5)
  })

  it('returns nulls for invalid coordinate string', () => {
    const res = parseCoordinates('tidak ada')
    expect(res.latitude).toBeNull()
    expect(res.longitude).toBeNull()
  })

  it('returns nulls for empty input', () => {
    const res = parseCoordinates('')
    expect(res.latitude).toBeNull()
    expect(res.longitude).toBeNull()
  })
})

describe('parseCustomerExcel with real Master Pelanggan.xlsx', () => {
  it('correctly maps and validates rows against Master Wilayah', async () => {
    const filePath = path.resolve(process.cwd(), 'Master Pelanggan.xlsx')
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath)
      const res = await parseCustomerExcel(buffer)
      expect(res.totalRows).toBeGreaterThan(20000)
      expect(res.validCount).toBeGreaterThan(20000)
      expect(res.rows[0].kecamatanNama).toBe('Tanjung')
      expect(res.rows[0].desaNama).toBe('Sokong')
      expect(res.rows[0].latitude).toBeCloseTo(-8.35806, 4)
    }
  })
})
