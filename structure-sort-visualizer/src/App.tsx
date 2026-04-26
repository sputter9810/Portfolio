import { useState } from "react";
import { SortingVisualizer } from "./components/SortingVisualizer";
import { DataStructureVisualizer } from "./components/DataStructureVisualizer";

type AppTab = "sorting" | "structures";

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("sorting");

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">Portfolio Project</p>
          <h1>Structure & Sorting Visualizer</h1>
          <p>
            Interactive visual demos for sorting algorithms and core data
            structures.
          </p>
        </div>

        <nav className="tab-nav">
          <button
            className={activeTab === "sorting" ? "tab active" : "tab"}
            onClick={() => setActiveTab("sorting")}
          >
            Sorting
          </button>

          <button
            className={activeTab === "structures" ? "tab active" : "tab"}
            onClick={() => setActiveTab("structures")}
          >
            Data Structures
          </button>
        </nav>
      </header>

      <main>
        {activeTab === "sorting" && <SortingVisualizer />}
        {activeTab === "structures" && <DataStructureVisualizer />}
      </main>
    </div>
  );
}