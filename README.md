# Action-Decision Authority

A lightweight library to evaluate a set of rules against a given set of facts. The library supports a rich set of operators (such as equals, notEquals, greaterThan, lessThan, contains, startsWith, endsWith, and in), dot-notated nested property access, and multiple condition combinations. An optional debug mode lets you log which rule was matched during evaluation.

## Features

- **Operators:** Supports common comparison operations.
- **Nested Property Access:** Retrieve nested values using a dot-notated string.
- **Condition Combination:** Use `"all"` (default) or `"any"` to ensure multiple conditions.
- **Debug Mode:** Log details of the matched rule to aid in debugging.
- **React Integration:** Comes with a React hook (`useEvaluate`) that memoizes deep comparisons of rules and facts.

## How It Works

1. **Defining Rules:**
   A rule consists of an array of conditions, an action, and an optional combination mode (`"all"` or `"any"`). The default combination is `"all"`, meaning all conditions must pass.

2. **Evaluating Facts:**
   The `evaluate` function takes a list of rules and a facts object. It:
   - Uses nested property access (via `getNestedValue`) to extract fact values.
   - Applies the appropriate operator function to compare the fact value against the condition value.
   - Returns the action of the first rule that completely matches the provided facts.

3. **Debug Option:**
   By passing an options object (e.g., `{ debug: true }`), you can enable logging of the matched rule’s details, including its index. If no rule matches, a debug message is logged accordingly.

4. **React Hook:**
   The `useEvaluate` hook encapsulates evaluation logic within a `useMemo` call, leveraging deep equality checks so that re-evaluation only occurs when the rules or facts actually change.

## Usage Examples

### Without React

Below is a simple Node.js or browser example:

```ts
import { evaluate } from "rule-evaluation-lib"
import type { Rule, Facts } from "rule-evaluation-lib"

// Define rules
const rules: Rule[] = [
  {
    combination: "any",
    conditions: [
      { field: "user.age", operator: "greaterThan", value: 18 },
      { field: "user.age", operator: "equals", value: 18 }
    ],
    action: "adult"
  },
  {
    conditions: [
      { field: "user.age", operator: "lessThan", value: 18 }
    ],
    action: "minor"
  }
]

// Facts object
const facts: Facts = { user: { name: "Alice", age: 20 } }

// Evaluate rules with debug enabled
const action = evaluate(rules, facts, { debug: true })
console.log(`Determined action: ${action}`)
```

### With React

Here’s how you can integrate the library into a React component:

```tsx
import React from "react"
import { useEvaluate } from "rule-evaluation-lib"
import type { Rule } from "rule-evaluation-lib"

// Define rules
const rules: Rule[] = [
  {
    conditions: [
      { field: "order.amount", operator: "greaterThan", value: 100 }
    ],
    action: "bigOrder"
  }
]

const OrderStatus: React.FC = () => {
  // Sample facts; in a real-world scenario these might come from props or state.
  const facts = { order: { amount: 150 } }

  // The useEvaluate hook will re-run the evaluation only when rules or facts change.
  const action = useEvaluate(rules, facts, { debug: true })

  return (
    <div>
      <h1>Order Evaluation</h1>
      <p>Action: {action || "No matching action"}</p>
    </div>
  )
}

export default OrderStatus
```

## Future Improvements

- **Register Custom Operators:**
  Introduce a `registerOperator` function to allow users to add their own custom operators. This would extend the library’s capabilities without modifying the core code. For example:
  ```ts
  // Example usage:
  registerOperator("customEquals", (fact, value) => {
    // Your custom logic here
    return String(fact).toLowerCase() === String(value).toLowerCase();
  });
  ```
