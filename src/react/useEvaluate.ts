import { useMemo, useRef } from 'react'
import isEqual from 'fast-deep-equal'

import { evaluate } from '../core/evaluate'
import type { Rule, Facts } from '../core/types'

/**
 * Deep comparison memo hook using fast-deep-equal.
 */
function useDeepCompareMemo<T>(value: T): T {
  const ref = useRef<T>(value)
  if (!isEqual(ref.current, value)) {
    ref.current = value
  }
  return ref.current
}

/**
 * A hook that evaluates an array of rules against the provided facts.
 * Returns the action of the first matching rule (or null if none match).
 *
 * This hook now accepts an optional third parameter "options",
 * for example: { debug: true }.
 *
 * @example:
 *   const action = useEvaluate(rules, applicationData, { debug: true });
 */
export function useEvaluate(
  rules: Rule[],
  facts: Facts,
  options: { debug?: boolean } = {},
): string | null {
  const memoizedRules = useDeepCompareMemo(rules)
  const memoizedFacts = useDeepCompareMemo(facts)

  return useMemo(
    () => evaluate(memoizedRules, memoizedFacts, options),
    [memoizedRules, memoizedFacts, options.debug],
  )
}
