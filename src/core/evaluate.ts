import { getProperty } from 'dot-prop'

import type { Operator, Condition, Rule, RuleCombination, Facts } from './types'

/**
 * Mapping of operator names to their respective evaluation functions.
 */
const operatorFunctions: Record<
  Operator,
  (fact: unknown, conditionValue: unknown) => boolean
> = {
  equals: (fact, value) => fact === value,
  notEquals: (fact, value) => fact !== value,
  greaterThan: (fact, value) => {
    if (typeof fact !== 'number' || typeof value !== 'number') {
      throw new Error(
        `Operator 'greaterThan' expects both operands to be numbers. Received: ${typeof fact} and ${typeof value}.`,
      )
    }
    return fact > value
  },
  lessThan: (fact, value) => {
    if (typeof fact !== 'number' || typeof value !== 'number') {
      throw new Error(
        `Operator 'lessThan' expects both operands to be numbers. Received: ${typeof fact} and ${typeof value}.`,
      )
    }
    return fact < value
  },
  contains: (fact, value) => {
    if (typeof fact === 'string' && typeof value === 'string') {
      return fact.includes(value)
    }
    if (Array.isArray(fact)) {
      return fact.includes(value)
    }
    throw new Error(
      `Operator 'contains' expects a string (or array for fact), but got types ${typeof fact} and ${typeof value}.`,
    )
  },
  startsWith: (fact, value) => {
    if (typeof fact === 'string' && typeof value === 'string') {
      return fact.startsWith(value)
    }
    throw new Error(
      `Operator 'startsWith' expects both operands to be strings.`,
    )
  },
  endsWith: (fact, value) => {
    if (typeof fact === 'string' && typeof value === 'string') {
      return fact.endsWith(value)
    }
    throw new Error(`Operator 'endsWith' expects both operands to be strings.`)
  },
  in: (fact, value) => {
    if (Array.isArray(value)) {
      return value.includes(fact)
    }
    throw new Error(`Operator 'in' expects the condition value to be an array.`)
  },
}

/**
 * Retrieves a nested value from an object using a dot-notated string.
 * Example: getNestedValue(obj, "user.age") returns obj.user.age.
 */
function getNestedValue(obj: object, path: string): unknown {
  const value = getProperty(obj, path)
  if (value === undefined) {
    console.warn(
      `Warning: The field "${path}" is missing in the provided object.`,
    )
  }
  return value
}

/**
 * Evaluates a single condition against the provided facts.
 * If an error occurs, the functions log the error and returns false.
 */
function decide(condition: Condition, facts: Facts): boolean {
  const factValue = getNestedValue(facts, condition.field)
  const operatorFn = operatorFunctions[condition.operator]

  if (!operatorFn) {
    console.error(`Unsupported operator: ${condition.operator}`)
    return false
  }

  try {
    return operatorFn(factValue, condition.value)
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        `Error evaluating condition for field "${condition.field}": ${error.message}`,
      )
    } else {
      console.error(
        `Unexpected error evaluating condition for field "${condition.field}": ${error}`,
      )
    }
    return false
  }
}

/**
 * Checks whether conditions match the facts using the provided combination:
 * - "all": All conditions must match.
 * - "any": At least one condition must match.
 */
export function conditionsMatch(
  conditions: Condition[],
  facts: Facts,
  combination: RuleCombination,
): boolean {
  if (combination === 'all') {
    return conditions.every((condition) => decide(condition, facts))
  }
  // For "any" combination, return true if at least one condition passes.
  return conditions.some((condition) => decide(condition, facts))
}

/**
 * Evaluates an array of rules against a given set of facts.
 * Returns the action of the first matching rule, or null if none match.
 *
 * An optional `options` parameter is provided; if options.debug is true,
 * the function logs the matched rule and its index to the console.
 */
export function evaluate(
  rules: Rule[],
  facts: Facts,
  options: { debug?: boolean } = {},
): string | null {
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i]
    if (!rule) continue

    const combination: RuleCombination = rule.combination ?? 'all'
    if (!conditionsMatch(rule.conditions, facts, combination)) {
      continue
    }

    if (options.debug) {
      console.debug(`Rule matched at index ${i}:`, rule)
    }

    return rule.action
  }
  if (options.debug) {
    console.debug('No rule matched the provided facts.')
  }
  return null
}
