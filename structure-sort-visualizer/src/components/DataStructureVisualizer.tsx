import { useMemo, useState } from "react";
import { runSortingAlgorithm, sortingAlgorithms } from "../algorithms/sorting";
import { SortingAlgorithm } from "../algorithms/sorting/sortingTypes";
import {
  arrayAdd,
  arrayDelete,
  arrayFind,
} from "../algorithms/dataStructures/arrayStructure";
import {
  runBSTBFS,
  runBSTDFSInorder,
  runBSTDFSPostorder,
  runBSTDFSPreorder,
  runBSTDelete,
  runBSTFind,
  runBSTInsert,
  treeToDisplay,
  TreeDisplayNode,
} from "../algorithms/dataStructures/bst";
import {
  DataStructureType,
  DSStep,
} from "../algorithms/dataStructures/types";
import { generateRandomNumbers } from "../utils/generateData";

const DEFAULT_VALUES = [42, 18, 73, 9, 25, 61, 88];

export function DataStructureVisualizer() {
  const [structure, setStructure] = useState<DataStructureType>("array");

  const [valuesByStructure, setValuesByStructure] = useState<
    Record<DataStructureType, number[]>
  >({
    array: [...DEFAULT_VALUES],
    stack: [...DEFAULT_VALUES.slice(0, 5)],
    queue: [...DEFAULT_VALUES.slice(0, 5)],
    linkedList: [...DEFAULT_VALUES.slice(0, 5)],
    bst: [50, 25, 75, 15, 35, 60, 90],
  });

  const [inputValue, setInputValue] = useState("30");
  const [sortAlgorithm, setSortAlgorithm] =
    useState<SortingAlgorithm>("quick");
  const [description, setDescription] = useState(
    "Choose an operation to begin."
  );
  const [running, setRunning] = useState(false);
  const [highlight, setHighlight] = useState<number[]>([]);
  const [highlightValues, setHighlightValues] = useState<number[]>([]);

  const currentValues = valuesByStructure[structure];

  const currentDisplayState = useMemo(() => {
    if (structure === "bst") {
      return treeToDisplay(currentValues);
    }

    return currentValues;
  }, [currentValues, structure]);

  function getParsedValue() {
    const value = Number(inputValue);

    if (!Number.isInteger(value)) {
      setDescription("Please enter a whole number.");
      return null;
    }

    return value;
  }

  function updateStructureValues(nextValues: number[]) {
    setValuesByStructure((previous) => ({
      ...previous,
      [structure]: nextValues,
    }));
  }

  async function runSteps(steps: DSStep[], finalValues?: number[]) {
    setRunning(true);

    for (const step of steps) {
      setDescription(step.description);
      setHighlight(step.highlight ?? []);
      setHighlightValues(step.highlightValues ?? []);

      if (structure !== "bst" && Array.isArray(step.state)) {
        updateStructureValues(step.state as number[]);
      }

      await new Promise((resolve) => setTimeout(resolve, 420));
    }

    if (finalValues) {
      updateStructureValues(finalValues);
    }

    setRunning(false);
  }

  function handleGenerateRandom() {
    if (running) return;

    const next =
      structure === "bst"
        ? generateRandomNumbers(7)
        : generateRandomNumbers(8);

    updateStructureValues(next);
    setHighlight([]);
    setHighlightValues([]);
    setDescription(`Generated random data for ${getStructureTitle(structure)}.`);
  }

  function handleClear() {
    if (running) return;

    updateStructureValues([]);
    setHighlight([]);
    setHighlightValues([]);
    setDescription(`Cleared ${getStructureTitle(structure)}.`);
  }

  function handleAdd() {
    const value = getParsedValue();
    if (value === null || running) return;

    if (structure === "array") {
      runSteps(arrayAdd(currentValues, value));
      return;
    }

    if (structure === "stack") {
      const next = [...currentValues, value];

      runSteps([
        {
          type: "add",
          state: next,
          description: `Pushed ${value} onto the stack.`,
          highlight: [next.length - 1],
        },
      ]);

      return;
    }

    if (structure === "queue") {
      const next = [...currentValues, value];

      runSteps([
        {
          type: "add",
          state: next,
          description: `Enqueued ${value} at the back of the queue.`,
          highlight: [next.length - 1],
        },
      ]);

      return;
    }

    if (structure === "linkedList") {
      const next = [...currentValues, value];

      runSteps([
        {
          type: "add",
          state: next,
          description: `Inserted ${value} at the tail of the linked list.`,
          highlight: [next.length - 1],
        },
      ]);

      return;
    }

    if (structure === "bst") {
      const next = currentValues.includes(value)
        ? currentValues
        : [...currentValues, value];

      runSteps(runBSTInsert(currentValues, value), next);
    }
  }

  function handleRemove() {
    const value = getParsedValue();
    if (value === null || running) return;

    if (structure === "stack") {
      if (currentValues.length === 0) {
        setDescription("The stack is already empty.");
        return;
      }

      const removed = currentValues[currentValues.length - 1];
      const next = currentValues.slice(0, -1);

      runSteps([
        {
          type: "remove",
          state: next,
          description: `Popped ${removed} from the top of the stack.`,
        },
      ]);

      return;
    }

    if (structure === "queue") {
      if (currentValues.length === 0) {
        setDescription("The queue is already empty.");
        return;
      }

      const removed = currentValues[0];
      const next = currentValues.slice(1);

      runSteps([
        {
          type: "remove",
          state: next,
          description: `Dequeued ${removed} from the front of the queue.`,
        },
      ]);

      return;
    }

    if (structure === "bst") {
      const next = currentValues.filter((item) => item !== value);
      runSteps(runBSTDelete(currentValues, value), next);
      return;
    }

    const deleteIndex = currentValues.indexOf(value);
    const next =
      deleteIndex === -1
        ? currentValues
        : currentValues.filter((_, index) => index !== deleteIndex);

    runSteps(arrayDelete(currentValues, value), next);
  }

  function handleFind() {
    const value = getParsedValue();
    if (value === null || running) return;

    if (structure === "bst") {
      runSteps(runBSTFind(currentValues, value));
      return;
    }

    runSteps(arrayFind(currentValues, value));
  }

  function handleSortCurrentValues() {
    if (running) return;

    if (structure === "bst") {
      const sortedValues = [...currentValues].sort((a, b) => a - b);

      setDescription(
        `BST inorder traversal produces sorted output: ${sortedValues.join(
          ", "
        )}.`
      );

      runSteps(runBSTDFSInorder(currentValues));
      return;
    }

    const steps = runSortingAlgorithm(sortAlgorithm, currentValues);
    const sorted = [...currentValues].sort((a, b) => a - b);

    runSteps(
      steps.map((step) => ({
        type: step.type === "sorted" ? "sorted" : "compare",
        state: step.array,
        description: step.description,
        highlight: step.indices,
      })),
      sorted
    );
  }

  function handleBFS() {
    if (running || structure !== "bst") return;
    runSteps(runBSTBFS(currentValues));
  }

  function handleDFSPreorder() {
    if (running || structure !== "bst") return;
    runSteps(runBSTDFSPreorder(currentValues));
  }

  function handleDFSInorder() {
    if (running || structure !== "bst") return;
    runSteps(runBSTDFSInorder(currentValues));
  }

  function handleDFSPostorder() {
    if (running || structure !== "bst") return;
    runSteps(runBSTDFSPostorder(currentValues));
  }

  function renderLinearStructure(values: number[]) {
    return (
      <div className={`ds-linear ${structure}`}>
        {values.map((value, index) => (
          <div
            key={`${value}-${index}`}
            className={highlight.includes(index) ? "ds-node active" : "ds-node"}
          >
            <span>{value}</span>

            {structure === "stack" && index === values.length - 1 && (
              <small>Top</small>
            )}

            {structure === "queue" && index === 0 && <small>Front</small>}

            {structure === "queue" && index === values.length - 1 && (
              <small>Back</small>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderLinkedList(values: number[]) {
    return (
      <div className="linked-list-display">
        {values.map((value, index) => (
          <div className="linked-node-group" key={`${value}-${index}`}>
            <div
              className={
                highlight.includes(index) ? "ds-node active" : "ds-node"
              }
            >
              <span>{value}</span>
            </div>

            {index < values.length - 1 && <div className="arrow">→</div>}
          </div>
        ))}
      </div>
    );
  }

  function renderTree(nodes: TreeDisplayNode[]) {
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));

    return (
      <div className="tree-canvas">
        <svg
          className="tree-lines"
          viewBox="0 0 1000 520"
          preserveAspectRatio="xMidYMid meet"
        >
          {nodes.map((node) => {
            if (!node.parentId) return null;

            const parent = nodeMap.get(node.parentId);
            if (!parent) return null;

            return (
              <line
                key={`${parent.id}-${node.id}`}
                x1={parent.x}
                y1={parent.y}
                x2={node.x}
                y2={node.y}
                className="tree-line"
              />
            );
          })}
        </svg>

        <div className="tree-node-layer">
          {nodes.map((node) => (
            <div
              key={node.id}
              className={
                highlightValues.includes(node.value)
                  ? "tree-node active"
                  : "tree-node"
              }
              style={{
                left: `${node.x / 10}%`,
                top: `${node.y}px`,
              }}
            >
              {node.value}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderDisplay() {
    if (structure === "bst") {
      return renderTree(currentDisplayState as TreeDisplayNode[]);
    }

    if (structure === "linkedList") {
      return renderLinkedList(currentDisplayState as number[]);
    }

    return renderLinearStructure(currentDisplayState as number[]);
  }

  return (
    <section className="ds-shell">
      <div className="panel ds-controls">
        <div>
          <h2>Data Structure Visualizer</h2>
          <p>
            Generate, add, delete, find, traverse, and sort structure data.
          </p>
        </div>

        <label>
          Data Structure
          <select
            value={structure}
            disabled={running}
            onChange={(event) => {
              setStructure(event.target.value as DataStructureType);
              setHighlight([]);
              setHighlightValues([]);
              setDescription("Choose an operation to begin.");
            }}
          >
            <option value="array">Array</option>
            <option value="stack">Stack</option>
            <option value="queue">Queue</option>
            <option value="linkedList">Linked List</option>
            <option value="bst">Binary Search Tree</option>
          </select>
        </label>

        <label>
          Value
          <input
            className="number-input"
            type="number"
            value={inputValue}
            disabled={running}
            onChange={(event) => setInputValue(event.target.value)}
          />
        </label>

        <div className="operation-grid">
          <button disabled={running} onClick={handleGenerateRandom}>
            Generate Random
          </button>

          <button disabled={running} onClick={handleAdd}>
            {getAddLabel(structure)}
          </button>

          <button disabled={running} onClick={handleRemove}>
            {getRemoveLabel(structure)}
          </button>

          <button disabled={running} onClick={handleFind}>
            Find Value
          </button>

          <button disabled={running} onClick={handleClear}>
            Clear
          </button>
        </div>

        <div className="mini-section">
          <h4>Sort / Traverse</h4>

          {structure !== "bst" && (
            <label>
              Sorting Algorithm
              <select
                value={sortAlgorithm}
                disabled={running}
                onChange={(event) =>
                  setSortAlgorithm(event.target.value as SortingAlgorithm)
                }
              >
                {sortingAlgorithms.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="operation-grid">
            <button disabled={running} onClick={handleSortCurrentValues}>
              {structure === "bst" ? "Inorder Sort" : "Sort Current Values"}
            </button>

            {structure === "bst" && (
              <>
                <button disabled={running} onClick={handleBFS}>
                  BFS
                </button>
                <button disabled={running} onClick={handleDFSPreorder}>
                  DFS Preorder
                </button>
                <button disabled={running} onClick={handleDFSInorder}>
                  DFS Inorder
                </button>
                <button disabled={running} onClick={handleDFSPostorder}>
                  DFS Postorder
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="panel ds-display-panel">
        <div className="ds-display">
          {currentValues.length === 0 ? (
            <div className="empty-state">No data yet.</div>
          ) : (
            renderDisplay()
          )}
        </div>

        <div className="step-description">{description}</div>
      </div>

      <div className="panel info-panel">
        <h3>{getStructureTitle(structure)}</h3>
        <p>{getStructureDescription(structure)}</p>

        <div className="complexity-grid">
          {getStructureComplexities(structure).map((item) => (
            <div key={item.label}>
              <strong>{item.label}</strong>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function getAddLabel(structure: DataStructureType) {
  switch (structure) {
    case "stack":
      return "Push Value";
    case "queue":
      return "Enqueue Value";
    case "linkedList":
      return "Insert Tail";
    case "bst":
      return "Insert Value";
    default:
      return "Add Value";
  }
}

function getRemoveLabel(structure: DataStructureType) {
  switch (structure) {
    case "stack":
      return "Pop Top";
    case "queue":
      return "Dequeue Front";
    case "linkedList":
      return "Delete Value";
    case "bst":
      return "Delete Value";
    default:
      return "Delete Value";
  }
}

function getStructureTitle(structure: DataStructureType) {
  switch (structure) {
    case "array":
      return "Array";
    case "stack":
      return "Stack";
    case "queue":
      return "Queue";
    case "linkedList":
      return "Linked List";
    case "bst":
      return "Binary Search Tree";
    default:
      return "Data Structure";
  }
}

function getStructureDescription(structure: DataStructureType) {
  switch (structure) {
    case "array":
      return "An array stores values in indexed order, making direct access fast.";
    case "stack":
      return "A stack follows Last In, First Out. The most recently added item is removed first.";
    case "queue":
      return "A queue follows First In, First Out. The earliest added item is removed first.";
    case "linkedList":
      return "A linked list stores values in nodes where each node points to the next node.";
    case "bst":
      return "A Binary Search Tree stores smaller values on the left and larger values on the right.";
    default:
      return "";
  }
}

function getStructureComplexities(structure: DataStructureType) {
  switch (structure) {
    case "array":
      return [
        { label: "Access", value: "O(1)" },
        { label: "Search", value: "O(n)" },
        { label: "Insert End", value: "O(1)" },
        { label: "Delete", value: "O(n)" },
      ];
    case "stack":
      return [
        { label: "Push", value: "O(1)" },
        { label: "Pop", value: "O(1)" },
        { label: "Peek", value: "O(1)" },
        { label: "Search", value: "O(n)" },
      ];
    case "queue":
      return [
        { label: "Enqueue", value: "O(1)" },
        { label: "Dequeue", value: "O(1)" },
        { label: "Peek", value: "O(1)" },
        { label: "Search", value: "O(n)" },
      ];
    case "linkedList":
      return [
        { label: "Insert Head", value: "O(1)" },
        { label: "Insert Tail", value: "O(n)" },
        { label: "Delete", value: "O(n)" },
        { label: "Search", value: "O(n)" },
      ];
    case "bst":
      return [
        { label: "Insert", value: "O(log n)" },
        { label: "Find", value: "O(log n)" },
        { label: "Delete", value: "O(log n)" },
        { label: "Worst Case", value: "O(n)" },
      ];
    default:
      return [];
  }
}