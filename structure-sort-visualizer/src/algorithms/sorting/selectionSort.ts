import { SortStep } from "./sortingTypes";

export function selectionSort(input: number[]): SortStep[] {
  const arr = [...input];
  const steps: SortStep[] = [];

  for (let i = 0; i < arr.length - 1; i++) {
    let minIndex = i;

    for (let j = i + 1; j < arr.length; j++) {
      steps.push({
        type: "compare",
        indices: [minIndex, j],
        array: [...arr],
        description: `Comparing current minimum ${arr[minIndex]} with ${arr[j]}.`,
      });

      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }

    if (minIndex !== i) {
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];

      steps.push({
        type: "swap",
        indices: [i, minIndex],
        array: [...arr],
        description: `Placed ${arr[i]} into position ${i}.`,
      });
    }

    steps.push({
      type: "sorted",
      indices: [i],
      array: [...arr],
      description: `${arr[i]} is now in its final position.`,
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