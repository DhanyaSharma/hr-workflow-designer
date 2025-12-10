// src/components/Sandbox/SimulatorPanel.tsx
import { useState, useRef } from 'react';
import type { Node, Edge } from 'reactflow';
import { SimulationController, executeWorkflow, type LogEntry } from '../../services/simulationService';

type Props = {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
};

export default function SimulatorPanel({ nodes, edges, setNodes }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(700); // ms per node
  const controllerRef = useRef<SimulationController | null>(null);

  const appendLog = (l: LogEntry) => setLogs((prev) => [...prev, l]);

  // helper to update node UI status
  const updateNodeStatus = (nodeId: string, status: 'running' | 'success' | 'failed' | null) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, _status: status } }
          : n
      )
    );
  };

  const resetStatuses = () => {
    setNodes((prev) => prev.map((n) => ({ ...n, data: { ...n.data, _status: null } })));
  };

  const runSimulation = async () => {
    if (running) return;
    setLogs([]);
    resetStatuses();
    setRunning(true);
    const controller = new SimulationController();
    controllerRef.current = controller;

    try {
      await executeWorkflow(nodes, edges, appendLog, updateNodeStatus, controller, speed);
    } catch (err: any) {
      appendLog({ time: new Date().toISOString(), nodeId: null, level: 'error', message: `Simulation error: ${err?.message || err}` });
    } finally {
      setRunning(false);
      controllerRef.current = null;
    }
  };

  const stopSimulation = () => {
    if (!running || !controllerRef.current) return;
    controllerRef.current.abort();
    setRunning(false);
    appendLog({ time: new Date().toISOString(), nodeId: null, level: 'info', message: 'Stop requested by user.' });
  };

  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'simulation-logs.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => setLogs([]);

  return (
    <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column', gap: 12, background: '#ffffff', borderLeft: '1px solid #e2e8f0' }}>
      <h3>Simulator</h3>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={runSimulation} disabled={running}>Run</button>
        <button onClick={stopSimulation} disabled={!running}>Stop</button>
        <button onClick={() => { resetStatuses(); setLogs([]); }}>Reset</button>
        <button onClick={exportLogs} disabled={logs.length === 0}>Export Logs</button>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label style={{ fontSize: 12 }}>Speed</label>
        <input type="range" min={100} max={2000} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
        <div style={{ width: 60, textAlign: 'right' }}>{speed}ms</div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', border: '1px solid #eef2f6', padding: 8, borderRadius: 6, background: '#fbfdff' }}>
        {logs.length === 0 ? <div style={{ color: '#667085' }}>No logs yet.</div> : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {logs.map((l, idx) => (
              <li key={idx} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: '#667085' }}>{new Date(l.time).toLocaleTimeString()}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ fontWeight: 600, color: l.level === 'error' ? '#c53030' : l.level === 'success' ? '#047857' : '#0f172a' }}>
                    {l.nodeTitle ?? 'Workflow'}:
                  </div>
                  <div style={{ color: '#0f172a' }}>{l.message}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={clearLogs}>Clear</button>
      </div>
    </div>
  );
}
