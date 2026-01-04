// src/api/client.ts
export async function getAutomations() {
  const res = await fetch('/automations');
  if (!res.ok) throw new Error('Failed to fetch automations');
  return res.json();
}
export async function simulateWorkflow(workflowJson: any) {
  const res = await fetch('/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflowJson),
  });
  if (!res.ok) throw new Error('Simulation failed');
  return res.json();
}
