import { SortStep } from "./sortingTypes";

export function mergeSort(input: number[]): SortStep[] {
  const arr = [...input];
  const steps: SortStep[] = [];

  function merge(left: number, middle: number, right: number) {
    const leftArray = arr.slice(left, middle + 1);
    const rightArray = arr.slice(middle + 1, right + 1);

    let i = 0;
    let j = 0;
    let k = left;

    while (i < leftArray.length && j < rightArray.length) {
      steps.push({
        type: "compare",
        indices: [left + i, middle + 1 + j],
        array: [...arr],
        description: `Comparing ${leftArray[i]} and ${rightArray[j]}.`,
      });

      if (leftArray[i] <= rightArray[j]) {
        arr[k] = leftArray[i];
        i++;
      } else {
        arr[k] = rightArray[j];
        j++;
      }

      steps.push({
        type: "overwrite",
        indices: [k],
        array: [...arr],
        description: `Writing ${arr[k]} into position ${k}.`,
      });

      k++;
    }

    while (i < leftArray.length) {
      arr[k] = leftArray[i];

      steps.push({
        type: "overwrite",
        indices: [k],
        array: [...arr],
        description: `Writing remaining value ${arr[k]}.`,
      });

      i++;
      k++;
    }

    while (j < rightArray.length) {
      arr[k] = rightArray[j];

      steps.push({
        type: "overwrite",
        indices: [k],
        array: [...arr],
        description: `Writing remaining value ${arr[k]}.`,
      });

      j++;
      k++;
    }
  }

  function sort(left: number, right: number) {
    if (left >= right) return;

    const middle = Math.floor((left + right) / 2);

    sort(left, middle);
    sort(middle + 1, right);
    merge(left, middle, right);
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