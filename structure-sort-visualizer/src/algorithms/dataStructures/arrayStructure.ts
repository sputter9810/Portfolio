import { DSStep } from "./types";

export function arrayAdd(values: number[], value: number): DSStep[] {
  const next = [...values, value];

  return [
    {
      type: "add",
      state: next,
      description: `Added ${value} to the end of the array.`,
      highlight: [next.length - 1],
    },
  ];
}

export function arrayFind(values: number[], target: number): DSStep[] {
  const steps: DSStep[] = [];

  for (let i = 0; i < values.length; i++) {
    steps.push({
      type: "compare",
      state: [...values],
      description: `Checking index ${i}: ${values[i]}.`,
      highlight: [i],
    });

    if (values[i] === target) {
      steps.push({
        type: "visit",
        state: [...values],
        description: `Found ${target} at index ${i}.`,
        highlight: [i],
      });

      return steps;
    }
  }

  steps.push({
    type: "error",
    state: [...values],
    description: `${target} was not found in the array.`,
  });

  return steps;
}

export function arrayDelete(values: number[], target: number): DSStep[] {
  const steps: DSStep[] = [];
  const next = [...values];

  for (let i = 0; i < next.length; i++) {
    steps.push({
      type: "compare",
      state: [...next],
      description: `Checking index ${i}: ${next[i]}.`,
      highlight: [i],
    });

    if (next[i] === target) {
      next.splice(i, 1);

      steps.push({
        type: "remove",
        state: [...next],
        description: `Deleted ${target} from the array.`,
      });

      return steps;
    }
  }

  steps.push({
    type: "error",
    state: [...next],
    description: `${target} was not found, so nothing was deleted.`,
  });

  return steps;
}