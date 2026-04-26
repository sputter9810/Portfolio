import { DSStep } from "./types";

export function runStackOperations(
  values: number[],
  operation: "push" | "pop"
): DSStep[] {
  const stack: number[] = [];
  const steps: DSStep[] = [];

  if (operation === "push") {
    for (const value of values) {
      stack.push(value);

      steps.push({
        type: "add",
        state: [...stack],
        description: `Pushed ${value} onto the stack.`,
        highlight: [stack.length - 1],
      });
    }
  }

  if (operation === "pop") {
    for (const value of values) {
      stack.push(value);
    }

    while (stack.length > 0) {
      const removed = stack.pop();

      steps.push({
        type: "remove",
        state: [...stack],
        description: `Popped ${removed} from the stack.`,
      });
    }
  }

  return steps;
}