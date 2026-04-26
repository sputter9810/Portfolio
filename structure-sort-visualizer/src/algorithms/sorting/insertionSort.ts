import { SortStep } from "./sortingTypes";

export function insertionSort(input: number[]): SortStep[] {
  const arr = [...input];
  const steps: SortStep[] = [];

  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;

    steps.push({
      type: "compare",
      indices: [i],
      array: [...arr],
      description: `Selected ${key} for insertion.`,
    });

    while (j >= 0 && arr[j] > key) {
      steps.push({
        type: "compare",
        indices: [j, j + 1],
        array: [...arr],
        description: `Comparing ${arr[j]} with ${key}.`,
      });

      arr[j + 1] = arr[j];

      steps.push({
        type: "overwrite",
        indices: [j + 1],
        array: [...arr],
        description: `Shifted ${arr[j]} to the right.`,
      });

      j--;
    }

    arr[j + 1] = key;

    steps.push({
      type: "overwrite",
      indices: [j + 1],
      array: [...arr],
      description: `Inserted ${key} into position ${j + 1}.`,
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