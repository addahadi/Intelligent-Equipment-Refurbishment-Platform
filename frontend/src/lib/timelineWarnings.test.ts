import { describe, it, expect } from 'vitest'
import { getTimelineWarnings, parseVerdict, severityForEtape } from './timelineWarnings'
import type { EtapeTracabilite, TypeComposant, TypeEtape } from '../types'

// Build a timeline from a compact spec; ordre follows array order, ids are 1..n.
function timeline(
  specs: Array<{ type: TypeEtape; description?: string }>,
): EtapeTracabilite[] {
  return specs.map((s, i) => ({
    id: i + 1,
    composantId: 1,
    type: s.type,
    ordre: i,
    date: '2026-01-01',
    description: s.description ?? '',
  }))
}

const codesOf = (etapes: EtapeTracabilite[], type: TypeComposant = 'ORGANE') =>
  getTimelineWarnings(etapes, type)
    .map((w) => w.code)
    .sort()

describe('parseVerdict', () => {
  it('reads the bracketed prefix, case-insensitively, past leading space', () => {
    expect(parseVerdict('[REPARABLE] tient 9,8 bar')).toBe('REPARABLE')
    expect(parseVerdict('[ENDOMMAGE]')).toBe('ENDOMMAGE')
    expect(parseVerdict('  [reparable] x')).toBe('REPARABLE')
  })
  it('returns null when no recognised prefix is present', () => {
    expect(parseVerdict('tient 9,8 bar')).toBeNull()
    expect(parseVerdict('')).toBeNull()
  })
})

describe('getTimelineWarnings — clean timelines produce no warnings', () => {
  it('reparable organe happy path', () => {
    const t = timeline([
      { type: 'NETTOYAGE' },
      { type: 'DIAGNOSTIC', description: '[REPARABLE] usure 20%' },
      { type: 'REPARATION' },
      { type: 'COMPOSITION' },
      { type: 'TEST' },
      { type: 'MISE_EN_VENTE' },
    ])
    expect(getTimelineWarnings(t, 'ORGANE')).toEqual([])
  })
  it('endommagé recyclage happy path', () => {
    const t = timeline([
      { type: 'NETTOYAGE' },
      { type: 'DIAGNOSTIC', description: '[ENDOMMAGE] piston fendu' },
      { type: 'RECYCLAGE' },
    ])
    expect(getTimelineWarnings(t, 'ORGANE')).toEqual([])
  })
})

describe('getTimelineWarnings — each rule fires', () => {
  it('① step after a terminal step', () => {
    const t = timeline([
      { type: 'DIAGNOSTIC', description: '[REPARABLE]' },
      { type: 'REPARATION' },
      { type: 'MISE_EN_VENTE' },
      { type: 'TEST' },
    ])
    expect(codesOf(t)).toContain('STEP_AFTER_TERMINAL')
  })
  it('② multiple terminal steps', () => {
    const t = timeline([
      { type: 'DIAGNOSTIC', description: '[REPARABLE]' },
      { type: 'REPARATION' },
      { type: 'MISE_EN_VENTE' },
      { type: 'MISE_EN_VENTE' },
    ])
    expect(codesOf(t)).toContain('MULTIPLE_TERMINAL')
  })
  it('③ verdict réparable but recyclage', () => {
    const t = timeline([
      { type: 'DIAGNOSTIC', description: '[REPARABLE]' },
      { type: 'RECYCLAGE' },
    ])
    expect(codesOf(t)).toContain('VERDICT_TERMINAL_CONTRADICTION')
  })
  it('③ verdict endommagé but mise en vente', () => {
    const t = timeline([
      { type: 'DIAGNOSTIC', description: '[ENDOMMAGE]' },
      { type: 'REPARATION' },
      { type: 'MISE_EN_VENTE' },
    ])
    expect(codesOf(t)).toContain('VERDICT_TERMINAL_CONTRADICTION')
  })
  it('④ mise en vente without diagnostic', () => {
    const t = timeline([{ type: 'REPARATION' }, { type: 'MISE_EN_VENTE' }])
    expect(codesOf(t)).toContain('VENTE_WITHOUT_DIAGNOSTIC')
  })
  it('⑤ réparation before diagnostic', () => {
    const t = timeline([
      { type: 'REPARATION' },
      { type: 'DIAGNOSTIC', description: '[REPARABLE]' },
      { type: 'TEST' },
      { type: 'MISE_EN_VENTE' },
    ])
    expect(codesOf(t)).toContain('REPAIR_OR_TEST_BEFORE_DIAGNOSTIC')
  })
  it('⑥ mise en vente without test nor réparation', () => {
    const t = timeline([
      { type: 'DIAGNOSTIC', description: '[REPARABLE]' },
      { type: 'MISE_EN_VENTE' },
    ])
    expect(codesOf(t)).toContain('VENTE_WITHOUT_TEST_OR_REPAIR')
  })
  it('⑦a composition on a pièce', () => {
    const t = timeline([{ type: 'COMPOSITION' }])
    expect(codesOf(t, 'PIECE')).toContain('COMPOSITION_ON_PIECE')
    // ...but never on an organe
    expect(codesOf(t, 'ORGANE')).not.toContain('COMPOSITION_ON_PIECE')
  })
  it('⑦b decomposition on a pièce', () => {
    const t = timeline([{ type: 'DECOMPOSITION' }])
    expect(codesOf(t, 'PIECE')).toContain('DECOMPOSITION_ON_PIECE')
    expect(codesOf(t, 'ORGANE')).not.toContain('DECOMPOSITION_ON_PIECE')
  })
  it('⑧ diagnostic without verdict', () => {
    const t = timeline([{ type: 'DIAGNOSTIC', description: 'pas de verdict' }])
    expect(codesOf(t)).toContain('DIAGNOSTIC_WITHOUT_VERDICT')
  })
})

describe('getTimelineWarnings — explicitly NOT flagged', () => {
  it('missing nettoyage and an unfinished (no terminal) timeline are fine', () => {
    const t = timeline([
      { type: 'DIAGNOSTIC', description: '[REPARABLE]' },
      { type: 'REPARATION' },
    ])
    expect(getTimelineWarnings(t, 'ORGANE')).toEqual([])
  })
})

describe('severityForEtape', () => {
  it('returns the highest severity affecting a step, else null', () => {
    const t = timeline([
      { type: 'DIAGNOSTIC', description: '[REPARABLE]' },
      { type: 'MISE_EN_VENTE' }, // id 2: medium (no test/repair)
      { type: 'TEST' }, // id 3: high (after terminal)
    ])
    const w = getTimelineWarnings(t, 'ORGANE')
    expect(severityForEtape(3, w)).toBe('high')
    expect(severityForEtape(1, w)).toBeNull()
  })
})
