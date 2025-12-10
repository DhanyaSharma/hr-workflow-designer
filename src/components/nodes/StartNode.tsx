import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";

export default function StartNode({ data, selected }: NodeProps) {
  const status = data?._status;
  
  const border =
    status === "running"
      ? "3px solid #f59e0b"
      : status === "success"
      ? "3px solid #10b981"
      : status === "failed"
      ? "3px solid #ef4444"
      : selected
      ? "3px solid #2563eb"
      : "2px solid #2e7d32";

  return (
    <div
      style={{
        padding: "12px 18px",
        borderRadius: "10px",
        border,
        background: "#e8f5e9",
        color: "#2e7d32",
        fontWeight: "bold",
        textAlign: "center",
        position: "relative",
      }}
    >
      {data.title || "Start Node"}

      <Handle type="source" position={Position.Bottom}
        style={{ background: "#2e7d32", width: 10, height: 10, borderRadius: "50%" }}
      />
    </div>
  );
}
