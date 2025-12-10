// src/hooks/useWorkflow.ts
import { useState, useCallback } from 'react';

// Runtime imports
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';

// Type-only imports (required for verbatimModuleSyntax)
import type {
  Node,
  Edge,
  Connection,
  OnNodesChange,
  OnEdgesChange,
} from 'reactflow';

export function useWorkflow() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Add node
  const addNode = useCallback((node: Node) => {
    setNodes((prev: Node[]) => [...prev, node]);
  }, []);

  // Update node
  const updateNode = useCallback((id: string, data: any) => {
    setNodes((prev: Node[]) =>
      prev.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      )
    );
  }, []);

  // Remove node and edges
  const removeNode = useCallback(
    (id: string) => {
      setNodes((prev: Node[]) => prev.filter((n) => n.id !== id));
      setEdges((prev: Edge[]) =>
        prev.filter((e) => e.source !== id && e.target !== id)
      );

      if (selectedNode?.id === id) {
        setSelectedNode(null);
      }
    },
    [selectedNode]
  );

  // Node changes handler
  const onNodesChange: OnNodesChange = useCallback((changes) => {
    setNodes((prev: Node[]) => applyNodeChanges(changes, prev));
  }, []);

  // Edge changes handler
  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    setEdges((prev: Edge[]) => applyEdgeChanges(changes, prev));
  }, []);

  // When the user connects two nodes
  const onConnect = useCallback((connection: Connection) => {
    setEdges((prev: Edge[]) => addEdge(connection, prev));
  }, []);

  return {
    nodes,
    edges,
    selectedNode,
    setNodes,
    setEdges,
    setSelectedNode,
    addNode,
    updateNode,
    removeNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
  };
}
