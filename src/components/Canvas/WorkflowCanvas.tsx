// src/components/Canvas/WorkflowCanvas.tsx

import { useEffect, useRef } from "react";

import ReactFlow, {
  Background,
  Controls,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
} from "reactflow";

import "reactflow/dist/style.css";

// Custom node components
import StartNode from "../nodes/StartNode";
import TaskNode from "../nodes/TaskNode";
import ApprovalNode from "../nodes/ApprovalNode";
import AutomatedNode from "../nodes/AutomatedNode";
import EndNode from "../nodes/EndNode";

// Register custom node types
const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
};

type Props = {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodeSelect: (node: Node | null) => void;
};

export default function WorkflowCanvas({
  nodes,
  edges,
  setNodes,
  setEdges,
  onNodeSelect,
}: Props) {
  // Track selected node for Delete key
  const selectedNodeRef = useRef<Node | null>(null);

  // Delete node on keyboard press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;

      const selected = selectedNodeRef.current;
      if (!selected) return;

      const id = selected.id;

      // Remove node
      setNodes((prev) => prev.filter((n) => n.id !== id));

      // Remove connected edges
      setEdges((prev) =>
        prev.filter((e) => e.source !== id && e.target !== id)
      );

      selectedNodeRef.current = null;
      onNodeSelect(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setNodes, setEdges, onNodeSelect]);

  // React Flow change handlers
  const onNodesChange: OnNodesChange = (changes) =>
    setNodes((prev) => applyNodeChanges(changes, prev));

  const onEdgesChange: OnEdgesChange = (changes) =>
    setEdges((prev) => applyEdgeChanges(changes, prev));

  const onConnect = (connection: Connection) =>
    setEdges((prev) =>
      addEdge(
        {
          ...connection,
          type: "smoothstep",
          style: { stroke: "#6C5CE7", strokeWidth: 2.5 },
        },
        prev
      )
    );

  return (
  <div style={{ flex: 1, height: "100%" }}>
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      onNodeClick={(_, node) => {
        selectedNodeRef.current = node;
        onNodeSelect(node);
      }}
      onPaneClick={() => {
        selectedNodeRef.current = null;
        onNodeSelect(null);
      }}
      fitView
    >
      <Background />
      <Controls />
    </ReactFlow>
  </div>
);
}
