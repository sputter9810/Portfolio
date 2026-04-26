import { DSStep } from "./types";

type Node = {
  value: number;
  next: Node | null;
};

export function runLinkedListInsert(values: number[]): DSStep[] {
  let head: Node | null = null;
  const steps: DSStep[] = [];

  function toArray(node: Node | null): number[] {
    const result: number[] = [];
    while (node) {
      result.push(node.value);
      node = node.next;
    }
    return result;
  }

  for (const value of values) {
    const newNode: Node = { value, next: null };

    if (!head) {
      head = newNode;
    } else {
      let current = head;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
    }

    steps.push({
      type: "add",
      state: toArray(head),
      description: `Inserted ${value} into linked list.`,
    });
  }

  return steps;
}