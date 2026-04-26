import { useMemo, useRef, useState } from "react";
import {
  runSortingAlgorithm,
  sortingAlgorithms,
} from "../algorithms/sorting";
import {
  SortingAlgorithm,
  SortStep,
} from "../algorithms/sorting/sortingTypes";
import {
  generateNearlySortedNumbers,
  generateRandomNumbers,
  generateReversedNumbers,
} from "../utils/generateData";

type DataMode = "random" | "nearlySorted" | "reversed";

type ComparisonResult = {
  algorithm: string;
  steps: number;
  comparisons: number;
  swapsOrWrites: number;
};

export function SortingVisualizer() {
  const [algorithm, setAlgorithm] = useState<SortingAlgorithm>("bubble");
  const [dataMode, setDataMode] = useState<DataMode>("random");
  const [size, setSize] = useState(30);
  const [speed, setSpeed] = useState(45);
  const [values, setValues] = useState<number[]>(() =>
    generateRandomNumbers(30)
  );
  const [activeStep, setActiveStep] = useState<SortStep | null>(null);
  const [isSorting, setIsSorting] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<
    ComparisonResult[]
  >([]);

  const stopRequested = useRef(false);

  const selectedAlgorithm = useMemo(
    () => sortingAlgorithms.find((item) => item.id === algorithm),
    [algorithm]
  );

  const maxValue = Math.max(...values);

  function generateValues(mode: DataMode = dataMode, nextSize = size) {
    if (mode === "nearlySorted") return generateNearlySortedNumbers(nextSize);
    if (mode === "reversed") return generateReversedNumbers(nextSize);
    return generateRandomNumbers(nextSize);
  }

  function handleGenerate() {
    if (isSorting) return;
    setValues(generateValues());
    setActiveStep(null);
    setComparisonResults([]);
  }

  function handleDataModeChange(mode: DataMode) {
    if (isSorting) return;
    setDataMode(mode);
    setValues(generateValues(mode));
    setActiveStep(null);
    setComparisonResults([]);
  }

  function handleSizeChange(nextSize: number) {
    if (isSorting) return;
    setSize(nextSize);
    setValues(generateValues(dataMode, nextSize));
    setActiveStep(null);
    setComparisonResults([]);
  }

  async function handleSort() {
    if (isSorting) return;

    stopRequested.current = false;
    setIsSorting(true);

    const steps = runSortingAlgorithm(algorithm, values);

    for (const step of steps) {
      if (stopRequested.current) break;

      setValues(step.array);
      setActiveStep(step);

      await new Promise((resolve) => setTimeout(resolve, 160 - speed));
    }

    setIsSorting(false);
  }

  function handleStop() {
    stopRequested.current = true;
    setIsSorting(false);
  }

  function handleCompareAlgorithms() {
    if (isSorting) return;

    const results = sortingAlgorithms.map((item) => {
      const steps = runSortingAlgorithm(item.id, values);

      return {
        algorithm: item.name,
        steps: steps.length,
        comparisons: steps.filter((step) => step.type === "compare").length,
        swapsOrWrites: steps.filter(
          (step) => step.type === "swap" || step.type === "overwrite"
        ).length,
      };
    });

    setComparisonResults(results.sort((a, b) => a.steps - b.steps));
  }

  function getBarClass(index: number) {
    if (!activeStep) return "bar";

    if (activeStep.indices.includes(index)) {
      return `bar ${activeStep.type}`;
    }

    return "bar";
  }

  return (
    <section className="visualizer-shell">
      <div className="panel controls-panel">
        <div className="panel-heading">
          <p className="section-label">Sorting</p>
          <h2>Sorting Visualizer</h2>
          <p>
            Generate a dataset, select an algorithm, then watch each sorting
            step animate.
          </p>
        </div>

        <div className="control-grid">
          <label>
            Algorithm
            <select
              value={algorithm}
              disabled={isSorting}
              onChange={(event) =>
                setAlgorithm(event.target.value as SortingAlgorithm)
              }
            >
              {sortingAlgorithms.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Dataset
            <select
              value={dataMode}
              disabled={isSorting}
              onChange={(event) =>
                handleDataModeChange(event.target.value as DataMode)
              }
            >
              <option value="random">Random numbers</option>
              <option value="nearlySorted">Nearly sorted</option>
              <option value="reversed">Reversed</option>
            </select>
          </label>

          <label>
            Size: {size}
            <input
              type="range"
              min="10"
              max="80"
              value={size}
              disabled={isSorting}
              onChange={(event) => handleSizeChange(Number(event.target.value))}
            />
          </label>

          <label>
            Speed
            <input
              type="range"
              min="10"
              max="150"
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
            />
          </label>
        </div>

        <div className="button-row">
          <button onClick={handleGenerate} disabled={isSorting}>
            Generate Data
          </button>

          {!isSorting ? (
            <button className="primary" onClick={handleSort}>
              Start Sort
            </button>
          ) : (
            <button className="danger" onClick={handleStop}>
              Stop
            </button>
          )}

          <button onClick={handleCompareAlgorithms} disabled={isSorting}>
            Compare All
          </button>
        </div>
      </div>

      <div className="panel chart-panel">
        <div className="chart-toolbar">
          <div>
            <p className="section-label">Live Demo</p>
            <h3>{selectedAlgorithm?.name}</h3>
          </div>

          <span className="data-pill">{values.length} items</span>
        </div>

        <div className="chart">
          {values.map((value, index) => (
            <div
              key={`${value}-${index}`}
              className={getBarClass(index)}
              style={{
                height: `${(value / maxValue) * 100}%`,
                width: `${100 / values.length}%`,
              }}
              title={`${value}`}
            >
              {values.length <= 35 && <span>{value}</span>}
            </div>
          ))}
        </div>

        <div className="step-description">
          {activeStep?.description ?? "No sorting step running yet."}
        </div>
      </div>

      <div className="panel info-panel">
        <p className="section-label">Complexity</p>
        <h3>{selectedAlgorithm?.name}</h3>
        <p>{selectedAlgorithm?.description}</p>

        <div className="complexity-grid">
          <div>
            <strong>Best</strong>
            <span>{selectedAlgorithm?.best}</span>
          </div>
          <div>
            <strong>Average</strong>
            <span>{selectedAlgorithm?.average}</span>
          </div>
          <div>
            <strong>Worst</strong>
            <span>{selectedAlgorithm?.worst}</span>
          </div>
          <div>
            <strong>Space</strong>
            <span>{selectedAlgorithm?.space}</span>
          </div>
        </div>

        <div className="complexity-explainer">
          <h4>What this means</h4>
          <p>{getComplexityExplanation(algorithm)}</p>
        </div>

        <div className="legend">
          <div>
            <span className="legend-box compare"></span>
            Compare
          </div>
          <div>
            <span className="legend-box swap"></span>
            Swap
          </div>
          <div>
            <span className="legend-box overwrite"></span>
            Overwrite
          </div>
          <div>
            <span className="legend-box pivot"></span>
            Pivot
          </div>
          <div>
            <span className="legend-box sorted"></span>
            Sorted
          </div>
        </div>
      </div>

      {comparisonResults.length > 0 && (
        <div className="panel comparison-panel">
          <div className="panel-heading">
            <p className="section-label">Comparison</p>
            <h3>Algorithm Comparison</h3>
            <p>
              Comparison is based on the current dataset and counts the
              generated animation steps.
            </p>
          </div>

          <div className="comparison-table">
            <div className="comparison-row header">
              <span>Algorithm</span>
              <span>Total Steps</span>
              <span>Comparisons</span>
              <span>Swaps/Writes</span>
            </div>

            {comparisonResults.map((result) => (
              <div className="comparison-row" key={result.algorithm}>
                <span>{result.algorithm}</span>
                <span>{result.steps}</span>
                <span>{result.comparisons}</span>
                <span>{result.swapsOrWrites}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function getComplexityExplanation(algorithm: SortingAlgorithm) {
  switch (algorithm) {
    case "bubble":
      return "Bubble Sort is easy to understand but inefficient for larger datasets because values move only one position at a time.";
    case "selection":
      return "Selection Sort performs a predictable number of comparisons, but it still scans the unsorted section repeatedly.";
    case "insertion":
      return "Insertion Sort is strong on nearly sorted data because each value may only need to move a small distance.";
    case "merge":
      return "Merge Sort consistently divides the dataset and merges it back together, giving reliable O(n log n) performance.";
    case "quick":
      return "Quick Sort is usually fast in practice, but poor pivot choices can degrade it to O(n²).";
    case "heap":
      return "Heap Sort gives reliable O(n log n) performance while using constant extra space, but its operations are less visually sequential.";
    default:
      return "";
  }
}