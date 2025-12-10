// src/App.tsx

import type { Node } from "reactflow";
import NodePalette from "./components/Sidebar/NodePalette";
import WorkflowCanvas from "./components/Canvas/WorkflowCanvas";
import NodeFormPanel from "./components/Editor/NodeFormPanel";
import SimulatorPanel from "./components/Sandbox/SimulatorPanel";
import { useWorkflow } from "./hooks/useWorkflow";

export default function App() {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    selectedNode,
    setSelectedNode,
    addNode,
  } = useWorkflow();

  const updateNode = (id: string, newData: any) => {
    setNodes((nodes) =>
      nodes.map((n) => (n.id === id ? { ...n, data: newData } : n))
    );
  };

  const handleAddNode = (node: Node) => addNode(node);

  const exportWorkflow = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workflow.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importWorkflow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        if (json.nodes && json.edges) {
          setNodes(json.nodes);
          setEdges(json.edges);
        } else alert("Invalid workflow format.");
      } catch {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <div
        style={{
          position: "fixed",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#fff",
          padding: "8px 16px",
          borderRadius: "10px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          display: "flex",
          gap: "12px",
          zIndex: 20,
        }}
      >
        <button onClick={exportWorkflow}>Export</button>

        <label>
          <input
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={importWorkflow}
          />
          <button>Import</button>
        </label>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr 360px 320px",
          height: "100%",
        }}
      >
        <NodePalette onAddNode={handleAddNode} />

        <WorkflowCanvas
          nodes={nodes}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
          onNodeSelect={setSelectedNode}
        />

        <NodeFormPanel
          node={selectedNode}
          updateNode={updateNode}
        />

        <SimulatorPanel nodes={nodes} edges={edges} setNodes={setNodes} />
      </div>
    </div>
  );
}
