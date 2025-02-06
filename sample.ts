/**
 * Sample Usage for Action Decision Authority (Core)
 */

import {
  evaluate,
  type Rule,
  type Facts,
  type EngineOptions,
  type OperatorFunction,
} from './src/index'

// Custom "equals" operator for case-insensitive string comparison.
const caseInsensitiveEquals: OperatorFunction = (fact, cond) => {
  if (typeof fact === 'string' && typeof cond === 'string') {
    return fact.toLowerCase() === cond.toLowerCase()
  }
  return fact === cond
}

const options: EngineOptions = {
  debug: true,
  customOperators: {
    equals: caseInsensitiveEquals,
  },
}

// Example 1: Default AND logic (all conditions must match)
const rules1: Rule[] = [
  {
    conditions: [
      { field: 'user.name', operator: 'equals', value: 'alice' },
      { field: 'user.age', operator: 'greaterThan', value: 18 },
    ],
    action: 'allowEntry',
  },
  {
    conditions: [{ field: 'user.age', operator: 'lessThan', value: 18 }],
    action: 'denyEntry',
  },
]

const facts1: Facts = {
  user: {
    name: 'Alice',
    age: 25,
  },
}

const action1 = evaluate(rules1, facts1, options)
console.log('Action 1:', action1) // Expected output: "allowEntry"

// Example 2: Using a condition group with "any" operator (OR logic)
const rules2: Rule[] = [
  {
    conditions: {
      operator: 'any',
      conditions: [
        { field: 'user.country', operator: 'equals', value: 'norway' },
        { field: 'user.country', operator: 'equals', value: 'sweden' },
      ],
    },
    action: 'allowEntry',
  },
]

const facts2: Facts = {
  user: {
    country: 'Sweden',
  },
}

const action2 = evaluate(rules2, facts2, options)
console.log('Action 2:', action2)
