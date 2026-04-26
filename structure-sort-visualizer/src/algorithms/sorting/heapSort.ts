import { SortStep } from "./sortingTypes";

export function heapSort(input: number[]): SortStep[] {
  const arr = [...input];
  const steps: SortStep[] = [];

  function heapify(length: number, rootIndex: number) {
    let largest = rootIndex;
    const left = 2 * rootIndex + 1;
    const right = 2 * rootIndex + 2;

    if (left < length) {
      steps.push({
        type: "compare",
        indices: [largest, left],
        array: [...arr],
        description: `Comparing ${arr[largest]} and left child ${arr[left]}.`,
      });

      if (arr[left] > arr[largest]) {
        largest = left;
      }
    }

    if (right < length) {
      steps.push({
        type: "compare",
        indices: [largest, right],
        array: [...arr],
        description: `Comparing ${arr[largest]} and right child ${arr[right]}.`,
      });

      if (arr[right] > arr[largest]) {
        largest = right;
      }
    }

    if (largest !== rootIndex) {
      [arr[rootIndex], arr[largest]] = [arr[largest], arr[rootIndex]];

      steps.push({
        type: "swap",
        indices: [rootIndex, largest],
        array: [...arr],
        description: `Swapped ${arr[largest]} and ${arr[rootIndex]} to maintain heap order.`,
      });

      heapify(length, largest);
    }
  }

  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
    heapify(arr.length, i);
  }

  for (let i = arr.length - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];

    steps.push({
      type: "swap",
      indices: [0, i],
      array: [...arr],
      description: `Moved largest value ${arr[i]} to the sorted section.`,
    });

    heapify(i, 0);
  }

  steps.push({
    type: "sorted",
    indices: arr.map((_, index) => index),
    array: [...arr],
    description: "Array sorted.",
  });

  return steps;
}