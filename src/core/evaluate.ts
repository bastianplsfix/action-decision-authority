import type {
  Rule,
  Facts,
  RuleCondition,
  Condition,
  ConditionGroup,
  Operator,
} from './types'

/**
 * Function type for comparing a fact value to a condition value.
 */
export type OperatorFunction = (factValue: any, conditionValue: any) => boolean

/**
 * Options for the engine.
 */
export interface EngineOptions {
  debug?: boolean
  customOperators?: Partial<Record<Operator, OperatorFunction>>
}

/**
 * Default operator functions.
 */
const defaultOperatorFunctions: Record<Operator, OperatorFunction> = {
  equals: (fact, cond) => fact === cond,
  notEquals: (fact, cond) => fact !== cond,
  greaterThan: (fact, cond) =>
    typeof fact === 'number' && typeof cond === 'number' && fact > cond,
  lessThan: (fact, cond) =>
    typeof fact === 'number' && typeof cond === 'number' && fact < cond,
  contains: (fact, cond) => {
    if (typeof fact === 'string') return fact.includes(cond)
    if (Array.isArray(fact)) return fact.includes(cond)
    return false
  },
  startsWith: (fact, cond) => typeof fact === 'string' && fact.startsWith(cond),
  endsWith: (fact, cond) => typeof fact === 'string' && fact.endsWith(cond),
  in: (fact, cond) => Array.isArray(cond) && cond.includes(fact),
}

/**
 * Merges custom operator functions (if provided) with the defaults.
 */
function getOperators(
  options?: EngineOptions,
): Record<Operator, OperatorFunction> {
  return options?.customOperators
    ? { ...defaultOperatorFunctions, ...options.customOperators }
    : defaultOperatorFunctions
}

/**
 * Retrieves a nested value from an object given a dot-notated path.
 * Supports any number of nesting levels.
 * Example: getNestedValue(obj, "user.age") returns obj.user.age.
 */
export function getNestedValue(obj: any, path: string): any {
  return path
    .split('.')
    .reduce((prev, key) => (prev !== undefined ? prev[key] : undefined), obj)
}

/**
 * Recursively evaluates a RuleCondition (either a simple condition or a condition group).
 */
function matchCondition(
  cond: RuleCondition,
  facts: Facts,
  operators: Record<Operator, OperatorFunction>,
  debug: boolean = false,
): boolean {
  if (
    (cond as ConditionGroup).operator !== undefined &&
    (cond as ConditionGroup).conditions !== undefined
  ) {
    const group = cond as ConditionGroup
    if (group.operator === 'all') {
      return group.conditions.every((c) =>
        matchCondition(c, facts, operators, debug),
      )
    } else if (group.operator === 'any') {
      return group.conditions.some((c) =>
        matchCondition(c, facts, operators, debug),
      )
    } else {
      if (debug) console.warn(`Unknown group operator: ${group.operator}`)
      return false
    }
  } else {
    const simpleCond = cond as Condition
    const factValue = getNestedValue(facts, simpleCond.field)
    const operatorFn = operators[simpleCond.operator]
    if (!operatorFn) {
      if (debug)
        console.warn(`Operator "${simpleCond.operator}" not implemented.`)
      return false
    }
    const result = operatorFn(factValue, simpleCond.value)
    if (debug) {
      console.log(
        `Condition: field="${simpleCond.field}", operator="${simpleCond.operator}", ` +
          `factValue=${JSON.stringify(factValue)}, condition.value=${JSON.stringify(simpleCond.value)} -> ${result}`,
      )
    }
    return result
  }
}

/**
 * Evaluates a RuleCondition (or an array of conditions). If an array is provided,
 * it is treated as an "all" grouping by default.
 */
function conditionsMatch(
  conditions: RuleCondition | RuleCondition[],
  facts: Facts,
  operators: Record<Operator, OperatorFunction>,
  debug: boolean = false,
): boolean {
  if (Array.isArray(conditions)) {
    return conditions.every((c) => matchCondition(c, facts, operators, debug))
  }
  return matchCondition(conditions, facts, operators, debug)
}

/**
 * Core evaluation function renamed to `evaluate`.
 * Evaluates an array of rules against the provided facts.
 * Returns the action of the first rule that matches, or null if none match.
 * Accepts an options object for debugging and custom operators.
 */
export function evaluate(
  rules: Rule[],
  facts: Facts,
  options?: EngineOptions,
): string | null {
  const debug = options?.debug ?? false
  const operators = getOperators(options)

  for (const rule of rules) {
    if (debug) {
      console.log(`Evaluating rule: "${rule.action}"`)
    }
    if (!conditionsMatch(rule.conditions, facts, operators, debug)) {
      continue
    }
    if (debug) {
      console.log(`\u2714 Matched rule action: "${rule.action}"`)
    }
    return rule.action
  }
  if (debug) {
    console.log('\u2716 No rule matched')
  }
  return null
}

/**
 * A simple deep equality check for objects and arrays.
 * Designed to be fast for typical use cases.
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (typeof a !== typeof b) return false
  if (typeof a !== 'object' || a === null || b === null) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false
    }
    return true
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  for (const key of keysA) {
    if (!b.hasOwnProperty(key)) return false
    if (!deepEqual(a[key], b[key])) return false
  }
  return true
}
