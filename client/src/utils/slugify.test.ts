import { describe, expect, it } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
  it('creates a lowercase URL slug', () => {
    expect(slugify('Vue 3 Composition API')).toBe('vue-3-composition-api')
  })

  it('removes punctuation and surrounding separators', () => {
    expect(slugify("  Don't Repeat Yourself!  ")).toBe('dont-repeat-yourself')
  })
})
