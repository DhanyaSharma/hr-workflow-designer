import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";

export default function TaskNode({ data, selected }: NodeProps) {
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
      : "2px solid #1e40af";

  return (
    <div
      style={{
        padding: "12px 18px",
        borderRadius: "8px",
        border,
        background: "#dbeafe",
        color: "#1e40af",
        fontWeight: "bold",
        textAlign: "center",
      }}
    >
      {data.title || "Task Node"}

      <Handle type="target" position={Position.Top}
        style={{ background: "#1e40af", width: 10, height: 10, borderRadius: "50%" }}
      />
      <Handle type="source" position={Position.Bottom}
        style={{ background: "#1e40af", width: 10, height: 10, borderRadius: "50%" }}
      />
    </div>
  );
}
