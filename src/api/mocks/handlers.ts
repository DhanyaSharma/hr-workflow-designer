// src/api/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [

  // GET /automations
  http.get('/automations', () => {
    return HttpResponse.json([
      { id: 'send_email', label: 'Send Email', params: ['to', 'subject'] },
      { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
    ]);
  }),

  // POST /simulate
  http.post('/simulate', async ({ request }) => {
    const body = await request.json();

    const logs = [
      { step: 1, nodeId: 'start', message: 'Workflow started' },
      { step: 2, nodeId: 'mock-step', message: 'Executed step in mock simulation' },
      { step: 3, nodeId: 'end', message: 'Workflow completed successfully' },
    ];

    return HttpResponse.json({
      ok: true,
      logs,
      input: body,
    });
  }),
];
