import { describe, test, expect } from 'vitest'
import { evaluate } from './evaluate'
import type { Rule, Facts } from './types'

describe('Evaluation Error Handling', () => {
  test('returns null when a field is missing', () => {
    const rules: Rule[] = [
      {
        conditions: [{ field: 'user.age', operator: 'greaterThan', value: 18 }],
        action: 'adult',
      },
    ]
    const facts: Facts = { user: { name: 'Alice' } } // missing 'age'
    const result = evaluate(rules, facts)
    expect(result).toBeNull()
  })

  test('returns null when there is a type mismatch for greaterThan', () => {
    const rules: Rule[] = [
      {
        conditions: [
          { field: 'order.amount', operator: 'greaterThan', value: 100 },
        ],
        action: 'bigOrder',
      },
    ]
    // 'order.amount' is a string, not a number.
    const facts: Facts = { order: { amount: '150' } }
    const result = evaluate(rules, facts)
    expect(result).toBeNull()
  })

  test('evaluates correctly when types match', () => {
    const rules: Rule[] = [
      {
        conditions: [
          { field: 'order.amount', operator: 'greaterThan', value: 100 },
        ],
        action: 'bigOrder',
      },
    ]
    // Here, types align.
    const facts: Facts = { order: { amount: 150 } }
    const result = evaluate(rules, facts)
    expect(result).toBe('bigOrder')
  })

  test('handles operator that throws when improper types are provided for contains', () => {
    const rules: Rule[] = [
      {
        conditions: [
          {
            field: 'product.tags',
            operator: 'contains',
            value: 'new',
          },
        ],
        action: 'newProduct',
      },
    ]
    // 'tags' is not an array or string.
    const facts: Facts = { product: { tags: 123 } }
    const result = evaluate(rules, facts)
    expect(result).toBeNull()
  })
})

describe('Operator Evaluations', () => {
  test('evaluates equals operator', () => {
    const rules: Rule[] = [
      {
        conditions: [
          { field: 'user.name', operator: 'equals', value: 'Alice' },
        ],
        action: 'greet',
      },
    ]
    const facts: Facts = { user: { name: 'Alice' } }
    const result = evaluate(rules, facts)
    expect(result).toBe('greet')
  })

  test('evaluates notEquals operator', () => {
    const rules: Rule[] = [
      {
        conditions: [
          { field: 'user.name', operator: 'notEquals', value: 'Bob' },
        ],
        action: 'notBob',
      },
    ]
    const facts: Facts = { user: { name: 'Alice' } }
    const result = evaluate(rules, facts)
    expect(result).toBe('notBob')
  })

  test('evaluates lessThan operator', () => {
    const rules: Rule[] = [
      {
        conditions: [
          { field: 'order.amount', operator: 'lessThan', value: 200 },
        ],
        action: 'smallOrder',
      },
    ]
    const facts: Facts = { order: { amount: 150 } }
    const result = evaluate(rules, facts)
    expect(result).toBe('smallOrder')
  })

  test('evaluates contains operator for arrays', () => {
    const rules: Rule[] = [
      {
        conditions: [
          { field: 'product.tags', operator: 'contains', value: 'sale' },
        ],
        action: 'onSale',
      },
    ]
    const facts: Facts = { product: { tags: ['clearance', 'sale'] } }
    const result = evaluate(rules, facts)
    expect(result).toBe('onSale')
  })

  test('evaluates contains operator for strings', () => {
    const rules: Rule[] = [
      {
        conditions: [
          {
            field: 'product.description',
            operator: 'contains',
            value: 'eco',
          },
        ],
        action: 'ecoFriendly',
      },
    ]
    const facts: Facts = {
      product: { description: 'This eco-friendly product is sustainable' },
    }
    const result = evaluate(rules, facts)
    expect(result).toBe('ecoFriendly')
  })

  test('evaluates startsWith operator', () => {
    const rules: Rule[] = [
      {
        conditions: [
          {
            field: 'product.code',
            operator: 'startsWith',
            value: 'PROD',
          },
        ],
        action: 'validProduct',
      },
    ]
    const facts: Facts = { product: { code: 'PROD-1234' } }
    const result = evaluate(rules, facts)
    expect(result).toBe('validProduct')
  })

  test('evaluates endsWith operator', () => {
    const rules: Rule[] = [
      {
        conditions: [
          {
            field: 'file.name',
            operator: 'endsWith',
            value: '.jpg',
          },
        ],
        action: 'imageFile',
      },
    ]
    const facts: Facts = { file: { name: 'photo.jpg' } }
    const result = evaluate(rules, facts)
    expect(result).toBe('imageFile')
  })

  test('evaluates in operator', () => {
    const rules: Rule[] = [
      {
        conditions: [
          {
            field: 'user.role',
            operator: 'in',
            value: ['admin', 'moderator', 'editor'],
          },
        ],
        action: 'privilegedUser',
      },
    ]
    const facts: Facts = { user: { role: 'editor' } }
    const result = evaluate(rules, facts)
    expect(result).toBe('privilegedUser')
  })

  test('returns null for in operator when condition value is not an array', () => {
    const rules: Rule[] = [
      {
        conditions: [
          {
            field: 'user.role',
            operator: 'in',
            value: 'admin', // invalid: should be an array
          },
        ],
        action: 'privilegedUser',
      },
    ]
    const facts: Facts = { user: { role: 'admin' } }
    const result = evaluate(rules, facts)
    expect(result).toBeNull()
  })
})

describe('Combination Modes and Multiple Rules', () => {
  test("evaluates multiple conditions with 'all' combination", () => {
    const rules: Rule[] = [
      {
        conditions: [
          { field: 'user.age', operator: 'greaterThan', value: 21 },
          { field: 'user.country', operator: 'equals', value: 'USA' },
        ],
        action: 'eligible',
      },
    ]
    const facts: Facts = { user: { age: 25, country: 'USA' } }
    const result = evaluate(rules, facts)
    expect(result).toBe('eligible')
  })

  test("fails evaluation if one condition in 'all' combination is false", () => {
    const rules: Rule[] = [
      {
        conditions: [
          { field: 'user.age', operator: 'greaterThan', value: 21 },
          { field: 'user.country', operator: 'equals', value: 'USA' },
        ],
        action: 'eligible',
      },
    ]
    const facts: Facts = { user: { age: 20, country: 'USA' } }
    const result = evaluate(rules, facts)
    expect(result).toBeNull()
  })

  test("evaluates multiple conditions with 'any' combination", () => {
    const rules: Rule[] = [
      {
        combination: 'any',
        conditions: [
          { field: 'user.age', operator: 'greaterThan', value: 21 },
          { field: 'user.country', operator: 'equals', value: 'Canada' },
        ],
        action: 'eligible',
      },
    ]
    // Only one condition is true
    const facts: Facts = { user: { age: 18, country: 'Canada' } }
    const result = evaluate(rules, facts)
    expect(result).toBe('eligible')
  })

  test("returns null for 'any' combination when all conditions are false", () => {
    const rules: Rule[] = [
      {
        combination: 'any',
        conditions: [
          { field: 'user.age', operator: 'greaterThan', value: 21 },
          { field: 'user.country', operator: 'equals', value: 'Canada' },
        ],
        action: 'eligible',
      },
    ]
    const facts: Facts = { user: { age: 18, country: 'USA' } }
    const result = evaluate(rules, facts)
    expect(result).toBeNull()
  })

  test('evaluates first matching rule when multiple rules are provided', () => {
    const rules: Rule[] = [
      {
        conditions: [{ field: 'user.name', operator: 'equals', value: 'Bob' }],
        action: 'firstRule',
      },
      {
        conditions: [{ field: 'user.age', operator: 'greaterThan', value: 25 }],
        action: 'secondRule',
      },
    ]
    // Only the second rule matches
    const facts: Facts = { user: { name: 'Alice', age: 30 } }
    const result = evaluate(rules, facts)
    expect(result).toBe('secondRule')
  })

  test('returns null when no rules match', () => {
    const rules: Rule[] = [
      {
        conditions: [{ field: 'user.name', operator: 'equals', value: 'Bob' }],
        action: 'firstRule',
      },
    ]
    const facts: Facts = { user: { name: 'Alice' } }
    const result = evaluate(rules, facts)
    expect(result).toBeNull()
  })

  test('returns null when rules array is empty', () => {
    const rules: Rule[] = []
    const facts: Facts = { user: { name: 'Alice' } }
    const result = evaluate(rules, facts)
    expect(result).toBeNull()
  })
})
