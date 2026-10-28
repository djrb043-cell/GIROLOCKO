import { adminAuth, adminDb, errorResponse, json, requireAdmin } from '../lib/firebaseAdmin';

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    await requireAdmin(req);

    const { email, password, store_name } = await req.json();
    if (!email || !password || !store_name) {
      return json({ error: 'email, password e store_name são obrigatórios.' }, 400);
    }

    const user = await adminAuth().createUser({ email, password, emailVerified: true });

    try {
      await adminDb().doc(`profiles/${user.uid}`).set({
        email,
        role: 'lojista',
        store_name,
        active: true,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      // desfaz a criação do login se não conseguiu gravar o perfil
      await adminAuth().deleteUser(user.uid);
      throw err;
    }

    return json({ success: true, user_id: user.uid });
  } catch (err) {
    return errorResponse(err);
  }
};
