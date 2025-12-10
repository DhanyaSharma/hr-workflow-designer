import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";

export default function EndNode({ data, selected }: NodeProps) {
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
      : "2px solid #b91c1c";

  return (
    <div
      style={{
        padding: "12px 18px",
        borderRadius: "10px",
        border,
        background: "#fee2e2",
        color: "#b91c1c",
        fontWeight: "bold",
        textAlign: "center",
      }}
    >
      {data.title || "End Node"}

      <Handle type="target" position={Position.Top}
        style={{ background: "#b91c1c", width: 10, height: 10, borderRadius: "50%" }}
      />
    </div>
  );
}
