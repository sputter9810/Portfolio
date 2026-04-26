import { SortStep } from "./sortingTypes";

export function bubbleSort(input: number[]): SortStep[] {
  const arr = [...input];
  const steps: SortStep[] = [];

  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      steps.push({
        type: "compare",
        indices: [j, j + 1],
        array: [...arr],
        description: `Comparing ${arr[j]} and ${arr[j + 1]}.`,
      });

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

        steps.push({
          type: "swap",
          indices: [j, j + 1],
          array: [...arr],
          description: `Swapped ${arr[j + 1]} and ${arr[j]}.`,
        });
      }
    }

    steps.push({
      type: "sorted",
      indices: [arr.length - 1 - i],
      array: [...arr],
      description: `${arr[arr.length - 1 - i]} is now in its final position.`,
    });
  }

  steps.push({
    type: "sorted",
    indices: arr.map((_, index) => index),
    array: [...arr],
    description: "Array sorted.",
  });

  return steps;
}