import { describe, expect, it } from 'vitest'
import { simpleEnglishOutlinesById } from '../src/config/outlines/simpleEnglish.js'
import { fieldBindings, getFieldBindingKey } from '../src/config/outlines/fieldBindings.js'
import { ScaffoldBindingMark } from '../src/extensions/scaffoldBindingMark.js'

function outlineText(outline) {
  return [outline.lead, ...(outline.sections || [])].map((item) => item?.content || '').join('\n')
}

function countOccurrences(text, label) {
  return text.split(label).length - 1
}

describe('semantic scaffold field bindings', () => {
  it('scopes stable keys to an outline and accepts only declared aliases', () => {
    expect(getFieldBindingKey('country', '[Country name]')).toBe('country:subject-name')
    expect(getFieldBindingKey('company', '[Company name]')).toBe(
      getFieldBindingKey('company', '[Company Name]'),
    )
    expect(getFieldBindingKey('person', '[place of birth]')).toBe(
      getFieldBindingKey('person', '[place]'),
    )
    expect(getFieldBindingKey('museum', '[museum name]')).toBe(
      getFieldBindingKey('museum', '[Museum name]'),
    )
    expect(getFieldBindingKey('person', '[He/She/They]')).toBe('person:subject-pronoun')
  })

  it('leaves ambiguous, compound, differently-cased pronoun, and repeated-list labels unbound', () => {
    expect(getFieldBindingKey('person', '[year]')).toBeNull()
    expect(getFieldBindingKey('city', '[region/country]')).toBeNull()
    expect(getFieldBindingKey('island', '[country or territory]')).toBeNull()
    // The subject pronoun binds only in its sentence-initial casing; the
    // lowercase and possessive forms would need a different word.
    expect(getFieldBindingKey('person', '[he/she/they]')).toBeNull()
    expect(getFieldBindingKey('person', '[his/her/their]')).toBeNull()
    expect(getFieldBindingKey('school', '[Name]')).toBeNull()
    expect(getFieldBindingKey('television-series', '[Actor name]')).toBeNull()
  })

  it('declares no bindings for outlines without safely repeated facts', () => {
    for (const outlineId of [
      'armed-conflict',
      'book',
      'building',
      'literary-work',
      'music-genre',
      'recent-event',
      'religion',
      'social-issue',
    ]) {
      expect(fieldBindings[outlineId]).toEqual({})
    }
  })

  it('keeps every manifest label present and every semantic group reusable', () => {
    for (const [outlineId, bindings] of Object.entries(fieldBindings)) {
      const outline = simpleEnglishOutlinesById[outlineId]
      expect(outline, `${outlineId} must remain a real outline`).toBeTruthy()
      const text = outlineText(outline)
      const occurrencesByKey = new Map()

      for (const [label, key] of Object.entries(bindings)) {
        const occurrences = countOccurrences(text, label)
        expect(occurrences, `${outlineId} must still contain ${label}`).toBeGreaterThan(0)
        occurrencesByKey.set(key, (occurrencesByKey.get(key) || 0) + occurrences)
      }

      for (const [key, occurrences] of occurrencesByKey) {
        expect(occurrences, `${key} must bind at least two fields`).toBeGreaterThanOrEqual(2)
      }
    }
  })

  it('provides an invisible mark for document-resident binding identity', () => {
    expect(ScaffoldBindingMark.name).toBe('scaffoldBinding')
  })
})
