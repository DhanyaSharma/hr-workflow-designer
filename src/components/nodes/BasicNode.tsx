import type { NodeProps } from 'reactflow';

export default function BasicNode({ data }: NodeProps) {
  return (
    <div
      style={{
        padding: '10px 16px',
        border: '2px solid #333',
        borderRadius: '10px',
        background: '#fff',
        fontSize: '14px',
        fontWeight: 'bold',
        textAlign: 'center',
        minWidth: '140px',
      }}
    >
      {data.title || 'Node'}
    </div>
  );
}
