import { adminAuth, errorResponse, json, requireAdmin } from '../lib/firebaseAdmin';

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    await requireAdmin(req);

    const { user_id, password } = await req.json();
    if (!user_id || !password) {
      return json({ error: 'user_id e password são obrigatórios.' }, 400);
    }

    await adminAuth().updateUser(user_id, { password });
    return json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
};
