export type SortStepType =
  | "compare"
  | "swap"
  | "overwrite"
  | "pivot"
  | "sorted";

export type SortStep = {
  type: SortStepType;
  indices: number[];
  array: number[];
  description: string;
};

export type SortingAlgorithm =
  | "bubble"
  | "selection"
  | "insertion"
  | "merge"
  | "quick"
  | "heap";

export type SortingAlgorithmInfo = {
  id: SortingAlgorithm;
  name: string;
  best: string;
  average: string;
  worst: string;
  space: string;
  description: string;
};