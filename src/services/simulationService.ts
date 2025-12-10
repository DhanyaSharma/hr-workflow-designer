// src/services/simulationService.ts
import type { Node, Edge } from 'reactflow';
import { getAutomations } from '../api/client'; // uses your client helper

export type LogEntry = {
  time: string;
  nodeId: string | null;
  nodeTitle?: string;
  level: 'info' | 'success' | 'error';
  message: string;
};

export type SimulationResult = {
  success: boolean;
  logs: LogEntry[];
};

export class SimulationController {
  private aborted = false;
  abort() {
    this.aborted = true;
  }
  isAborted() {
    return this.aborted;
  }
}

/**
 * Execute the workflow.
 * - nodes: React Flow nodes
 * - edges: React Flow edges
 * - onLog: callback when a log entry is produced
 * - updateNodeStatus: optional function to mark node status in UI
 * - controller: optional SimulationController to allow cancel
 * - delayMs: per-node delay to simulate processing
 */
export async function executeWorkflow(
  nodes: Node[],
  edges: Edge[],
  onLog: (l: LogEntry) => void,
  updateNodeStatus?: (nodeId: string, status: 'running' | 'success' | 'failed' | null) => void,
  controller?: SimulationController,
  delayMs = 700
): Promise<SimulationResult> {
  const logs: LogEntry[] = [];
  const now = () => new Date().toISOString();
  const findNode = (id: string) => nodes.find((n) => n.id === id)!;
  const outEdges = (nodeId: string) => edges.filter((e) => e.source === nodeId);

  function pushLog(nodeId: string | null, level: LogEntry['level'], message: string, nodeTitle?: string) {
    const entry: LogEntry = { time: now(), nodeId, nodeTitle, level, message };
    logs.push(entry);
    onLog(entry);
  }

  // locate all start nodes
  const startNodes = nodes.filter((n) => n.data?._nodeType === 'start');
  if (startNodes.length === 0) {
    pushLog(null, 'error', 'No Start node found. Simulation aborted.');
    return { success: false, logs };
  }

  // helper to delay and check abort
  const wait = (ms: number) =>
    new Promise<void>((resolve, reject) => {
      let timer = setTimeout(() => {
        timer = undefined as any;
        if (controller?.isAborted()) return reject(new Error('aborted'));
        resolve();
      }, ms);
      if (controller) {
        // check for immediate abort
        if (controller.isAborted()) {
          clearTimeout(timer as unknown as number);
          return reject(new Error('aborted'));
        }
      }
    });

  // BFS/DFS traversal: we'll do sequential traversal from a start node following first outgoing edge
  // For more complex graphs, you can implement branching/conditions; for now we'll traverse breadth-first paths.
  const visited = new Set<string>();

  async function processNode(node: Node): Promise<boolean> {
    if (controller?.isAborted()) throw new Error('aborted');

    const id = node.id;
    const title = node.data?.title || node.id;
    pushLog(id, 'info', `Executing node "${title}"`, title);
    updateNodeStatus?.(id, 'running');

    // small artificial delay
    try {
      await wait(delayMs);
    } catch {
      updateNodeStatus?.(id, null);
      throw new Error('aborted');
    }

    const type = node.data?._nodeType;

    try {
      // VALIDATION: ensure required fields exist for types
      if (type === 'task') {
        // simple validation example: task should have assignee
        if (!node.data?.assignee) {
          const msg = `Task node "${title}" missing assignee.`;
          pushLog(id, 'error', msg, title);
          updateNodeStatus?.(id, 'failed');
          return false;
        }
        pushLog(id, 'success', `Task "${title}" completed.`, title);
        updateNodeStatus?.(id, 'success');
      } else if (type === 'approval') {
        // simulate approval: if autoApproveThreshold exists and <= some value, auto approve
        const threshold = node.data?.autoApproveThreshold;
        if (typeof threshold === 'number') {
          if (threshold <= 0) {
            pushLog(id, 'info', `Auto-approve threshold met for "${title}".`, title);
            updateNodeStatus?.(id, 'success');
          } else {
            // simulate an approver action (random or auto-pass)
            pushLog(id, 'info', `Approval required for "${title}". Simulating approver...`, title);
            await wait(delayMs);
            pushLog(id, 'success', `Approval "${title}" approved.`, title);
            updateNodeStatus?.(id, 'success');
          }
        } else {
          // default approve
          pushLog(id, 'info', `No threshold set; auto-approving "${title}".`, title);
          updateNodeStatus?.(id, 'success');
        }
      } else if (type === 'automated') {
        // run automation: find action id and call its endpoint if present via getAutomations
        const actionId = node.data?.actionId;
        if (!actionId) {
          pushLog(id, 'error', `Automated node "${title}" has no actionId configured.`, title);
          updateNodeStatus?.(id, 'failed');
          return false;
        }
        pushLog(id, 'info', `Triggering automation "${actionId}" for "${title}".`, title);

        try {
          // get automations list and see if action has a URL
          const automations = (await getAutomations()) || [];
          const action = automations.find((a: any) => a.id === actionId);

          if (action?.url) {
            // call remote URL - simulated fetch
            const res = await fetch(action.url, {
              method: action.method || 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(node.data?.actionParams || {}),
            });
            if (!res.ok) {
              pushLog(id, 'error', `Automation "${title}" failed: ${res.statusText}`, title);
              updateNodeStatus?.(id, 'failed');
              return false;
            }
            const body = await res.json().catch(() => ({}));
            pushLog(id, 'success', `Automation "${title}" succeeded. Response: ${JSON.stringify(body)}`, title);
            updateNodeStatus?.(id, 'success');
          } else {
            // if no URL, simulate success
            await wait(delayMs);
            pushLog(id, 'success', `Automation "${title}" simulated successfully.`, title);
            updateNodeStatus?.(id, 'success');
          }
        } catch (err: any) {
          pushLog(id, 'error', `Automation "${title}" failed: ${err?.message || err}`, title);
          updateNodeStatus?.(id, 'failed');
          return false;
        }
      } else if (type === 'start') {
        pushLog(id, 'success', `Start "${title}" initialized.`, title);
        updateNodeStatus?.(id, 'success');
      } else if (type === 'end') {
        pushLog(id, 'success', `End "${title}" reached.`, title);
        updateNodeStatus?.(id, 'success');
      } else {
        pushLog(id, 'info', `Generic node "${title}" executed.`, title);
        updateNodeStatus?.(id, 'success');
      }

      // after success, proceed to connected nodes (first-level only here)
      const outs = outEdges(id);
      for (const e of outs) {
        const target = findNode(e.target);
        if (!target) continue;
        if (visited.has(target.id)) continue; // avoid loops
        visited.add(target.id);

        const ok = await processNode(target);
        if (!ok) {
          // stop on failure
          return false;
        }
      }

      return true;
    } catch (err: any) {
      updateNodeStatus?.(id, 'failed');
      pushLog(id, 'error', `Node "${title}" execution error: ${err?.message || err}`, title);
      return false;
    }
  }

  // run for each start node (sequentially)
  for (const s of startNodes) {
    visited.add(s.id);
    const ok = await processNode(s);
    if (!ok) {
      pushLog(null, 'error', `Workflow stopped due to failure at node ${s.id}.`);
      return { success: false, logs };
    }
    if (controller?.isAborted()) {
      pushLog(null, 'info', 'Simulation aborted by user.');
      return { success: false, logs };
    }
  }

  pushLog(null, 'success', 'Workflow simulation completed successfully.');
  return { success: true, logs };
}
