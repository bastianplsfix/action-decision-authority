/**
 * Action Decision Authority – Rule Engine Types
 */

/**
 * The type of comparison operators supported by the rule engine.
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
  /** The field name in the facts (supports dot-notation for nested properties). */
  field: string
  /** The comparison operator to use. */
  operator: Operator
  /** The value to compare against the fact’s value. */
  value: any
}

/**
 * A group of conditions allowing you to specify logical operators.
 */
export interface ConditionGroup {
  /** The logical operator for this group: "all" (AND) or "any" (OR). */
  operator: 'all' | 'any'
  /** The conditions (which can be simple conditions or nested groups). */
  conditions: RuleCondition[]
}

/**
 * A rule condition can be either a simple condition or a group of conditions.
 */
export type RuleCondition = Condition | ConditionGroup

/**
 * A rule containing conditions and an action.
 * If conditions is provided as an array, it defaults to "all" (AND) logic.
 */
export type Rule = {
  conditions: RuleCondition | RuleCondition[]
  action: string
}

/**
 * A record of key-value pairs representing the data to be evaluated.
 */
export type Facts = Record<string, any>
