import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    'Variáveis do Firebase ausentes. Verifique VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, ' +
    'VITE_FIREBASE_PROJECT_ID e VITE_FIREBASE_APP_ID (no .env local ou em Environment variables na Netlify). ' +
    'Na Netlify, depois de criar/alterar variáveis, faça um novo deploy.'
  );
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export type Role = 'admin' | 'lojista';

export interface Profile {
  id: string;
  email: string;
  role: Role;
  store_name: string | null;
  active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  store_id: string;
  store_name: string;
  client_name: string;
  client_whatsapp: string;
  address: string;
  neighborhood: string;
  city: string;
  fee: number | null;
  payment_method: 'pago_loja' | 'receber_loja';
  status: 'pendente' | 'em_rota' | 'entregue' | 'nao_entregue';
  received_by: string | null;
  floripa_distance_km: number | null;
  notes: string | null;
  created_at: string;
  sent_to_giroloc: boolean;
  collected_at: string | null;
  collected_by: string | null;
  delivered_at: string | null;
}
