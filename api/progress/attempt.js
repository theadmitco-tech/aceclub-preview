const ACTIVITY_TYPES = new Set(['predict', 'multiple-choice', 'number-input', 'drag-and-drop']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requestBody(request) {
  if (typeof request.body === 'string') return JSON.parse(request.body);
  return request.body || {};
}

function text(value, limit) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= limit ? value.trim() : null;
}

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') return response.status(204).end();
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return response.status(503).json({ error: 'Progress storage is not configured.' });

  try {
    const body = requestBody(request);
    const visitorId = text(body.visitorId, 36);
    const lessonId = text(body.lessonId, 200);
    const interactionId = text(body.interactionId, 200);
    const activityType = text(body.activityType, 40);
    const attemptNumber = Number(body.attemptNumber);

    if (!visitorId || !UUID.test(visitorId) || !lessonId || !interactionId || !ACTIVITY_TYPES.has(activityType) || !Number.isInteger(attemptNumber) || attemptNumber < 1 || attemptNumber > 10000 || typeof body.isCorrect !== 'boolean' || !Array.isArray(body.answer) && (typeof body.answer !== 'object' || body.answer === null)) {
      return response.status(400).json({ error: 'Invalid attempt payload.' });
    }

    const supabaseResponse = await fetch(`${url.replace(/\/$/, '')}/rest/v1/interaction_attempts`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        visitor_id: visitorId,
        lesson_id: lessonId,
        interaction_id: interactionId,
        activity_type: activityType,
        answer: body.answer,
        is_correct: body.isCorrect,
        attempt_number: attemptNumber,
      }),
    });

    if (!supabaseResponse.ok) {
      const message = await supabaseResponse.text();
      console.error('Supabase attempt write failed:', message);
      return response.status(502).json({ error: 'Unable to save progress.' });
    }

    return response.status(201).json({ saved: true });
  } catch (error) {
    console.error('Attempt persistence failed:', error);
    return response.status(400).json({ error: 'Unable to save progress.' });
  }
}
