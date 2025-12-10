// src/components/Editor/NodeFormPanel.tsx

import { useEffect, useState } from "react";
import type { Node } from "reactflow";

// Monaco fallback loader
let MonacoEditor: any = null;
try {
  MonacoEditor = require("@monaco-editor/react").default;
} catch {
  MonacoEditor = null;
}

type Props = {
  selectedNode: Node | null;
  updateNode: (id: string, newData: any) => void;
};

export default function NodeFormPanel({ selectedNode, updateNode }: Props) {
  const [title, setTitle] = useState("");
  const [metadata, setMetadata] = useState("{}");
  const [jsonError, setJsonError] = useState("");

  // Load node data when selected
  useEffect(() => {
    if (!selectedNode) return;

    setTitle(selectedNode.data.title || "");

    const meta = selectedNode.data.metadata || {};
    setMetadata(JSON.stringify(meta, null, 2));
    setJsonError("");
  }, [selectedNode]);

  const saveChanges = () => {
    if (!selectedNode) return;

    try {
      const parsedMetadata = JSON.parse(metadata);

      updateNode(selectedNode.id, {
        ...selectedNode.data,
        title,
        metadata: parsedMetadata,
      });

      setJsonError("");
      alert("Node updated successfully!");
    } catch (err: any) {
      setJsonError("Invalid JSON: " + err.message);
    }
  };

  if (!selectedNode) {
    return (
      <div style={{ padding: 16 }}>
        <h3>No node selected</h3>
        <p>Select a node to edit its configuration.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 16,
        borderLeft: "1px solid #ddd",
        background: "#fafafa",
        height: "100%",
        overflow: "auto",
      }}
    >
      <h3 style={{ marginBottom: 0 }}>
        Edit: {selectedNode.data.title || selectedNode.type}
      </h3>
      <p style={{ color: "#6b7280", marginTop: 4 }}>
        Node ID: {selectedNode.id}
      </p>

      {/* Title */}
      <label style={{ fontWeight: 600 }}>Title</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: "100%",
          padding: 8,
          border: "1px solid #ddd",
          borderRadius: 6,
          marginTop: 4,
          marginBottom: 12,
        }}
      />

      {/* Metadata JSON */}
      <label style={{ fontWeight: 600 }}>Metadata (JSON)</label>

      {MonacoEditor ? (
        <MonacoEditor
          height="240px"
          defaultLanguage="json"
          value={metadata}
          onChange={(val: any) => setMetadata(val ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
          }}
        />
      ) : (
        <textarea
          value={metadata}
          onChange={(e) => setMetadata(e.target.value)}
          style={{
            width: "100%",
            height: "240px",
            padding: 8,
            fontFamily: "monospace",
            borderRadius: 6,
            border: "1px solid #ddd",
          }}
        />
      )}

      {jsonError && (
        <p style={{ color: "red", marginTop: 8 }}>{jsonError}</p>
      )}

      <button
        onClick={saveChanges}
        style={{
          marginTop: 16,
          width: "100%",
          padding: 10,
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        Save Changes
      </button>
    </div>
  );
}
