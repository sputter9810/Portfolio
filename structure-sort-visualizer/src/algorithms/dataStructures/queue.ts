import { DSStep } from "./types";

export function runQueueOperations(
  values: number[],
  operation: "enqueue" | "dequeue"
): DSStep[] {
  const queue: number[] = [];
  const steps: DSStep[] = [];

  if (operation === "enqueue") {
    for (const value of values) {
      queue.push(value);

      steps.push({
        type: "add",
        state: [...queue],
        description: `Enqueued ${value}.`,
        highlight: [queue.length - 1],
      });
    }
  }

  if (operation === "dequeue") {
    for (const value of values) {
      queue.push(value);
    }

    while (queue.length > 0) {
      const removed = queue.shift();

      steps.push({
        type: "remove",
        state: [...queue],
        description: `Dequeued ${removed}.`,
      });
    }
  }

  return steps;
}