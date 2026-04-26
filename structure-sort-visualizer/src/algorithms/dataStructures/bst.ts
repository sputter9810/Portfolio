import { DSStep } from "./types";

type TreeNode = {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
};

export type TreeDisplayNode = {
  id: string;
  value: number;
  depth: number;
  x: number;
  y: number;
  parentId: string | null;
};

function insertNode(root: TreeNode | null, value: number): TreeNode {
  if (!root) {
    return { value, left: null, right: null };
  }

  if (value < root.value) {
    root.left = insertNode(root.left, value);
  } else if (value > root.value) {
    root.right = insertNode(root.right, value);
  }

  return root;
}

function findMin(node: TreeNode): TreeNode {
  let current = node;

  while (current.left) {
    current = current.left;
  }

  return current;
}

function deleteNode(root: TreeNode | null, value: number): TreeNode | null {
  if (!root) return null;

  if (value < root.value) {
    root.left = deleteNode(root.left, value);
    return root;
  }

  if (value > root.value) {
    root.right = deleteNode(root.right, value);
    return root;
  }

  if (!root.left && !root.right) return null;
  if (!root.left) return root.right;
  if (!root.right) return root.left;

  const successor = findMin(root.right);
  root.value = successor.value;
  root.right = deleteNode(root.right, successor.value);

  return root;
}

function buildTree(values: number[]): TreeNode | null {
  let root: TreeNode | null = null;

  for (const value of values) {
    root = insertNode(root, value);
  }

  return root;
}

function flattenTree(root: TreeNode | null): TreeDisplayNode[] {
  const nodes: TreeDisplayNode[] = [];

  function walk(
    node: TreeNode | null,
    depth: number,
    minX: number,
    maxX: number,
    parentId: string | null
  ) {
    if (!node) return;

    const x = (minX + maxX) / 2;
    const y = 70 + depth * 110;
    const id = `${node.value}-${depth}-${x}`;

    nodes.push({
      id,
      value: node.value,
      depth,
      x,
      y,
      parentId,
    });

    walk(node.left, depth + 1, minX, x, id);
    walk(node.right, depth + 1, x, maxX, id);
  }

  walk(root, 0, 40, 960, null);
  return nodes;
}

export function runBSTInsert(values: number[], value: number): DSStep[] {
  const nextValues = values.includes(value) ? [...values] : [...values, value];
  const root = buildTree(nextValues);

  return [
    {
      type: "add",
      state: flattenTree(root),
      description: values.includes(value)
        ? `${value} already exists in the tree. Duplicate values are ignored.`
        : `Inserted ${value} into the Binary Search Tree.`,
      highlightValues: [value],
    },
  ];
}

export function runBSTDelete(values: number[], target: number): DSStep[] {
  let root = buildTree(values);
  const steps: DSStep[] = [];
  let current = root;

  while (current) {
    steps.push({
      type: "compare",
      state: flattenTree(root),
      description: `Checking node ${current.value}.`,
      highlightValues: [current.value],
    });

    if (current.value === target) {
      root = deleteNode(root, target);

      steps.push({
        type: "remove",
        state: flattenTree(root),
        description: `Deleted ${target} from the tree.`,
      });

      return steps;
    }

    current = target < current.value ? current.left : current.right;
  }

  steps.push({
    type: "error",
    state: flattenTree(root),
    description: `${target} was not found, so nothing was deleted.`,
  });

  return steps;
}

export function runBSTFind(values: number[], target: number): DSStep[] {
  const root = buildTree(values);
  const steps: DSStep[] = [];
  let current = root;

  while (current) {
    steps.push({
      type: "compare",
      state: flattenTree(root),
      description: `Checking node ${current.value}.`,
      highlightValues: [current.value],
    });

    if (current.value === target) {
      steps.push({
        type: "visit",
        state: flattenTree(root),
        description: `Found ${target} in the tree.`,
        highlightValues: [current.value],
      });

      return steps;
    }

    current = target < current.value ? current.left : current.right;
  }

  steps.push({
    type: "error",
    state: flattenTree(root),
    description: `${target} was not found in the tree.`,
  });

  return steps;
}

export function runBSTBFS(values: number[]): DSStep[] {
  const root = buildTree(values);
  const steps: DSStep[] = [];

  if (!root) return steps;

  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const current = queue.shift()!;

    steps.push({
      type: "visit",
      state: flattenTree(root),
      description: `BFS visited ${current.value}.`,
      highlightValues: [current.value],
    });

    if (current.left) queue.push(current.left);
    if (current.right) queue.push(current.right);
  }

  return steps;
}

export function runBSTDFSPreorder(values: number[]): DSStep[] {
  const root = buildTree(values);
  const steps: DSStep[] = [];

  function dfs(node: TreeNode | null) {
    if (!node) return;

    steps.push({
      type: "visit",
      state: flattenTree(root),
      description: `Preorder DFS visited ${node.value}.`,
      highlightValues: [node.value],
    });

    dfs(node.left);
    dfs(node.right);
  }

  dfs(root);
  return steps;
}

export function runBSTDFSInorder(values: number[]): DSStep[] {
  const root = buildTree(values);
  const steps: DSStep[] = [];

  function dfs(node: TreeNode | null) {
    if (!node) return;

    dfs(node.left);

    steps.push({
      type: "visit",
      state: flattenTree(root),
      description: `Inorder DFS visited ${node.value}.`,
      highlightValues: [node.value],
    });

    dfs(node.right);
  }

  dfs(root);
  return steps;
}

export function runBSTDFSPostorder(values: number[]): DSStep[] {
  const root = buildTree(values);
  const steps: DSStep[] = [];

  function dfs(node: TreeNode | null) {
    if (!node) return;

    dfs(node.left);
    dfs(node.right);

    steps.push({
      type: "visit",
      state: flattenTree(root),
      description: `Postorder DFS visited ${node.value}.`,
      highlightValues: [node.value],
    });
  }

  dfs(root);
  return steps;
}

export function treeToDisplay(values: number[]): TreeDisplayNode[] {
  return flattenTree(buildTree(values));
}