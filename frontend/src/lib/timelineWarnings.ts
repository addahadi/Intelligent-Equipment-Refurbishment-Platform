// Traceability coherence advisor — SOFT warnings (admin-facing only).
//
// A pure, framework-agnostic function over the raw API étape list. It judges
// whether a composant's traceability timeline is logically coherent and returns
// a list of warnings. It NEVER blocks, writes, or repairs data — the UI surfaces
// these passively and the admin decides whether to act.
//
// Source of truth is the BACKEND enum (DECOMPOSITION preserved, real TEST). Feed
// it the raw `etapesData`, not the lossy local `item.etapes`. The DIAGNOSTIC
// verdict has no structured field — it lives as a "[REPARABLE]"/"[ENDOMMAGE]"
// prefix in the description (BR-08), so we parse it (graceful no-fire if absent).
//
// Severity tiers drive how loudly the UI shows each warning; none ever gate.

import type { EtapeTracabilite, TypeComposant, TypeEtape } from '../types'

export type WarningSeverity = 'high' | 'medium' | 'low'

export interface TimelineWarning {
  code: string // stable rule id — tests assert on this, not the prose
  severity: WarningSeverity
  message: string // French (admin console is French-only)
  etapeIds: number[] // steps to badge inline; [] = whole-timeline warning
}

const TERMINAL: TypeEtape[] = ['MISE_EN_VENTE', 'RECYCLAGE']
const isTerminal = (t: TypeEtape) => TERMINAL.includes(t)

const SEVERITY_RANK: Record<WarningSeverity, number> = { high: 3, medium: 2, low: 1 }

// The verdict is stored as a leading "[REPARABLE]" / "[ENDOMMAGE]" token in the
// description text. Returns null when no recognised prefix is present.
export function parseVerdict(description: string): 'REPARABLE' | 'ENDOMMAGE' | null {
  const m = (description ?? '').trimStart().match(/^\[(REPARABLE|ENDOMMAGE)\]/i)
  return m ? (m[1].toUpperCase() as 'REPARABLE' | 'ENDOMMAGE') : null
}

export function getTimelineWarnings(
  etapes: EtapeTracabilite[],
  typeComposant: TypeComposant,
): TimelineWarning[] {
  // Sort a copy by ordre so position checks are robust to an unsorted input.
  const steps = [...etapes].sort((a, b) => a.ordre - b.ordre)
  const warnings: TimelineWarning[] = []

  const byType = (t: TypeEtape) => steps.filter((s) => s.type === t)
  const ids = (arr: EtapeTracabilite[]) => arr.map((s) => s.id)

  const terminals = steps.filter((s) => isTerminal(s.type))
  const diagnostics = byType('DIAGNOSTIC')
  const firstDiagOrdre = diagnostics.length
    ? Math.min(...diagnostics.map((d) => d.ordre))
    : null
  const verdicts = new Set(
    diagnostics.map((d) => parseVerdict(d.description)).filter(Boolean),
  )
  const hasVente = byType('MISE_EN_VENTE').length > 0
  const hasRecyclage = byType('RECYCLAGE').length > 0
  const hasTest = byType('TEST').length > 0
  const hasReparation = byType('REPARATION').length > 0

  // ① High — a step exists after a terminal step (terminal must be last).
  const firstTerminalIdx = steps.findIndex((s) => isTerminal(s.type))
  if (firstTerminalIdx !== -1 && firstTerminalIdx < steps.length - 1) {
    warnings.push({
      code: 'STEP_AFTER_TERMINAL',
      severity: 'high',
      message:
        'Des étapes figurent après une étape terminale (mise en vente ou recyclage), qui doit clôturer la traçabilité.',
      etapeIds: ids(steps.slice(firstTerminalIdx + 1)),
    })
  }

  // ② High — more than one terminal step.
  if (terminals.length > 1) {
    warnings.push({
      code: 'MULTIPLE_TERMINAL',
      severity: 'high',
      message:
        'La traçabilité comporte plusieurs étapes terminales ; elle ne peut se conclure qu’une seule fois.',
      etapeIds: ids(terminals),
    })
  }

  // ③ High — diagnostic verdict contradicts the terminal outcome.
  if (verdicts.has('REPARABLE') && hasRecyclage) {
    warnings.push({
      code: 'VERDICT_TERMINAL_CONTRADICTION',
      severity: 'high',
      message:
        'Le diagnostic conclut « réparable » mais la traçabilité se termine par un recyclage.',
      etapeIds: ids([...diagnostics, ...byType('RECYCLAGE')]),
    })
  }
  if (verdicts.has('ENDOMMAGE') && hasVente) {
    warnings.push({
      code: 'VERDICT_TERMINAL_CONTRADICTION',
      severity: 'high',
      message:
        'Le diagnostic conclut « endommagé » mais la traçabilité se termine par une mise en vente.',
      etapeIds: ids([...diagnostics, ...byType('MISE_EN_VENTE')]),
    })
  }

  // ④ Medium — mise en vente with no prior diagnostic at all.
  if (hasVente && diagnostics.length === 0) {
    warnings.push({
      code: 'VENTE_WITHOUT_DIAGNOSTIC',
      severity: 'medium',
      message: 'Mise en vente sans diagnostic préalable.',
      etapeIds: ids(byType('MISE_EN_VENTE')),
    })
  }

  // ⑤ Medium — a réparation/test precedes the diagnostic (or there is none).
  const prematureRepairTest = steps.filter(
    (s) =>
      (s.type === 'REPARATION' || s.type === 'TEST') &&
      (firstDiagOrdre === null || s.ordre < firstDiagOrdre),
  )
  if (prematureRepairTest.length) {
    warnings.push({
      code: 'REPAIR_OR_TEST_BEFORE_DIAGNOSTIC',
      severity: 'medium',
      message: 'Une réparation ou un test précède le diagnostic.',
      etapeIds: ids(prematureRepairTest),
    })
  }

  // ⑥ Medium — mise en vente with neither test nor réparation.
  if (hasVente && !hasTest && !hasReparation) {
    warnings.push({
      code: 'VENTE_WITHOUT_TEST_OR_REPAIR',
      severity: 'medium',
      message: 'Mise en vente sans aucune réparation ni test.',
      etapeIds: ids(byType('MISE_EN_VENTE')),
    })
  }

  // ⑦ Low — COMPOSITION and DECOMPOSITION are organe-only structural steps.
  // A pièce is atomic (pieces are what an organe is decomposed INTO), so it can
  // be neither composed nor decomposed.
  if (typeComposant === 'PIECE') {
    const comp = byType('COMPOSITION')
    if (comp.length) {
      warnings.push({
        code: 'COMPOSITION_ON_PIECE',
        severity: 'low',
        message: 'Une pièce ne peut pas être composée (étape réservée aux organes).',
        etapeIds: ids(comp),
      })
    }
    const decomp = byType('DECOMPOSITION')
    if (decomp.length) {
      warnings.push({
        code: 'DECOMPOSITION_ON_PIECE',
        severity: 'low',
        message: 'Une pièce ne peut pas être décomposée (étape réservée aux organes).',
        etapeIds: ids(decomp),
      })
    }
  }

  // ⑧ Low — diagnostic with no verdict recorded.
  const verdictless = diagnostics.filter((d) => parseVerdict(d.description) === null)
  if (verdictless.length) {
    warnings.push({
      code: 'DIAGNOSTIC_WITHOUT_VERDICT',
      severity: 'low',
      message: 'Diagnostic sans verdict (réparable ou endommagé) enregistré.',
      etapeIds: ids(verdictless),
    })
  }

  return warnings
}

// Highest-severity warning level affecting a given step — drives the inline
// badge colour. Returns null when the step is implicated by no warning.
export function severityForEtape(
  etapeId: number,
  warnings: TimelineWarning[],
): WarningSeverity | null {
  let rank = 0
  let sev: WarningSeverity | null = null
  for (const w of warnings) {
    if (w.etapeIds.includes(etapeId) && SEVERITY_RANK[w.severity] > rank) {
      rank = SEVERITY_RANK[w.severity]
      sev = w.severity
    }
  }
  return sev
}

// Messages affecting a given step — used for the inline badge's tooltip.
export function messagesForEtape(etapeId: number, warnings: TimelineWarning[]): string[] {
  return warnings.filter((w) => w.etapeIds.includes(etapeId)).map((w) => w.message)
}
