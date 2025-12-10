import type { Node } from 'reactflow';
import { v4 as uuid } from 'uuid';

type Props = {
  onAddNode: (node: Node) => void;
};

const nodeOptions = [
  { type: 'start', label: 'Start Node' },
  { type: 'task', label: 'Task Node' },
  { type: 'approval', label: 'Approval Node' },
  { type: 'automated', label: 'Automated Node' },
  { type: 'end', label: 'End Node' },
];

export default function NodePalette({ onAddNode }: Props) {
  return (
    <div style={{ width: 200, borderRight: '1px solid #ddd', padding: '12px' }}>
      <h3>Node Library</h3>
      {nodeOptions.map((option) => (
        <button
          key={option.type}
          style={{ width: '100%', marginBottom: 10 }}
          onClick={() => {
            const newNode: Node = {
              id: uuid(),
              type: option.type,
              position: { x: 200, y: 200 },
              data: {
                _nodeType: option.type,   // IMPORTANT
                title: option.label       // Shown inside node + editor
              }
            };
            onAddNode(newNode);
          }}
        >
          + {option.label}
        </button>
      ))}
    </div>
  );
}
