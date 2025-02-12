/**
 * The type of comparison operators supported by the action-decision authority.
 */
export type Operator =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'lessThan'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'in'

/**
 * A single condition that must be met within a rule.
 */
export type Condition = {
  /** The key (dot-notation supported) whose value will be compared. */
  field: string
  /** The comparison operator. */
  operator: Operator
  /** The value to compare against. */
  value: unknown
}

/**
 * Allowed modes for combining conditions.
 */
export type RuleCombination = 'all' | 'any'

/**
 * A rule containing an array of conditions, an action string, and an optional combination mode.
 * If no combination is provided, the default is "all".
 */
export type Rule = {
  /** Combination mode (defaults to "all" if omitted). */
  combination?: RuleCombination
  /** One or more conditions for this rule. */
  conditions: Condition[]
  /** The action string to return when the rule matches. */
  action: string
}

/**
 * Facts are the data evaluated by the engine. Use any plain object.
 */
export type Facts = object
