export type DSOperation =
  | "push"
  | "pop"
  | "enqueue"
  | "dequeue"
  | "insert"
  | "delete"
  | "find"
  | "traverse"
  | "bfs"
  | "dfs"
  | "sort"
  | "generate"
  | "clear";

export type DSStep = {
  type: "add" | "remove" | "visit" | "compare" | "error" | "sorted";
  state: unknown;
  description: string;
  highlight?: number[];
  highlightValues?: number[];
};

export type DataStructureType =
  | "array"
  | "stack"
  | "queue"
  | "linkedList"
  | "bst";