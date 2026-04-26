import { SortStep } from "./sortingTypes";

export function quickSort(input: number[]): SortStep[] {
  const arr = [...input];
  const steps: SortStep[] = [];

  function partition(low: number, high: number): number {
    const pivot = arr[high];

    steps.push({
      type: "pivot",
      indices: [high],
      array: [...arr],
      description: `Selected ${pivot} as the pivot.`,
    });

    let i = low - 1;

    for (let j = low; j < high; j++) {
      steps.push({
        type: "compare",
        indices: [j, high],
        array: [...arr],
        description: `Comparing ${arr[j]} with pivot ${pivot}.`,
      });

      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];

        steps.push({
          type: "swap",
          indices: [i, j],
          array: [...arr],
          description: `Moved ${arr[i]} to the left side of the pivot.`,
        });
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];

    steps.push({
      type: "swap",
      indices: [i + 1, high],
      array: [...arr],
      description: `Placed pivot ${pivot} into its final position.`,
    });

    return i + 1;
  }

  function sort(low: number, high: number) {
    if (low < high) {
      const pivotIndex = partition(low, high);

      sort(low, pivotIndex - 1);
      sort(pivotIndex + 1, high);
    }
  }

  sort(0, arr.length - 1);

  steps.push({
    type: "sorted",
    indices: arr.map((_, index) => index),
    array: [...arr],
    description: "Array sorted.",
  });

  return steps;
}