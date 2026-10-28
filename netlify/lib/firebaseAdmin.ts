import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function init() {
  if (getApps().length) return;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) {
    throw new HttpError(
      500,
      'Credenciais do Firebase Admin ausentes na Netlify (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).'
    );
  }
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

export function adminAuth() {
  init();
  return getAuth();
}

export function adminDb() {
  init();
  return getFirestore();
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Confirma que quem chamou está logado e é um admin ativo. Devolve o uid do admin. */
export async function requireAdmin(req: Request): Promise<string> {
  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw new HttpError(401, 'Missing authorization');

  let uid: string;
  try {
    uid = (await adminAuth().verifyIdToken(token)).uid;
  } catch {
    throw new HttpError(401, 'Unauthorized');
  }

  const snap = await adminDb().doc(`profiles/${uid}`).get();
  const profile = snap.data();
  if (!profile || profile.role !== 'admin' || profile.active !== true) {
    throw new HttpError(403, 'Forbidden: admin only');
  }
  return uid;
}

const AUTH_ERRORS: Record<string, string> = {
  'auth/email-already-exists': 'Já existe uma conta com este e-mail.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/invalid-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/user-not-found': 'Usuário não encontrado.',
};

export function errorResponse(err: unknown) {
  if (err instanceof HttpError) return json({ error: err.message }, err.status);
  const code = (err as { code?: string }).code;
  if (code && AUTH_ERRORS[code]) return json({ error: AUTH_ERRORS[code] }, 400);
  console.error(err);
  return json({ error: (err as Error).message ?? 'Erro inesperado.' }, 500);
}
