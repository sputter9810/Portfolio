import { bubbleSort } from "./bubbleSort";
import { heapSort } from "./heapSort";
import { insertionSort } from "./insertionSort";
import { mergeSort } from "./mergeSort";
import { quickSort } from "./quickSort";
import { selectionSort } from "./selectionSort";
import {
  SortingAlgorithm,
  SortingAlgorithmInfo,
  SortStep,
} from "./sortingTypes";

export const sortingAlgorithms: SortingAlgorithmInfo[] = [
  {
    id: "bubble",
    name: "Bubble Sort",
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    description:
      "Repeatedly compares adjacent values and swaps them if they are in the wrong order.",
  },
  {
    id: "selection",
    name: "Selection Sort",
    best: "O(n²)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    description:
      "Finds the smallest remaining value and places it at the front of the unsorted section.",
  },
  {
    id: "insertion",
    name: "Insertion Sort",
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    description:
      "Builds a sorted section by inserting each value into its correct position.",
  },
  {
    id: "merge",
    name: "Merge Sort",
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n)",
    description:
      "Divides the array into smaller sections, sorts them, then merges them back together.",
  },
  {
    id: "quick",
    name: "Quick Sort",
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n²)",
    space: "O(log n)",
    description:
      "Chooses a pivot and partitions values around it before recursively sorting each side.",
  },
  {
    id: "heap",
    name: "Heap Sort",
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(1)",
    description:
      "Builds a max heap, then repeatedly extracts the largest value into the sorted section.",
  },
];

export function runSortingAlgorithm(
  algorithm: SortingAlgorithm,
  values: number[]
): SortStep[] {
  switch (algorithm) {
    case "bubble":
      return bubbleSort(values);
    case "selection":
      return selectionSort(values);
    case "insertion":
      return insertionSort(values);
    case "merge":
      return mergeSort(values);
    case "quick":
      return quickSort(values);
    case "heap":
      return heapSort(values);
    default:
      return bubbleSort(values);
  }
}