import React from 'react'
import type { Rule, Facts } from '../core/types'
import { evaluate, deepEqual, type EngineOptions } from '../core/evaluate'

/**
 * A custom hook that memoizes a value using deep comparison.
 */
function useDeepCompareMemo<T>(value: T): T {
  const ref = React.useRef<T>(value)
  if (!deepEqual(value, ref.current)) {
    ref.current = value
  }
  return ref.current
}

/**
 * React hook that evaluates rules (using `evaluate`) and returns the resulting action.
 * Accepts an options object for debug flags, custom operators, etc.
 */
export function useEvaluate(
  rules: Rule[],
  facts: Facts,
  options?: EngineOptions,
): string | null {
  const stableFacts = useDeepCompareMemo(facts)
  const result = React.useMemo(
    () => evaluate(rules, stableFacts, options),
    [rules, stableFacts, options],
  )
  return result
}
