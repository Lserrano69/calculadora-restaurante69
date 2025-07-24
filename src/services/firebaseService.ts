
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    onSnapshot, 
    addDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    getDocs,
    QuerySnapshot
} from 'firebase/firestore';
import { MenuItem } from '../types';

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: 'miapprestaurantepos.firebaseapp.com',
  projectId: 'miapprestaurantepos',
  storageBucket: 'miapprestaurantepos.firebasestorage.app',
  messagingSenderId: '953172596341',
  appId: '1:953172596341:web:57ad6ecbece09253368a3c',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

signInAnonymously(auth).catch((error) => {
  console.error('Error en la autenticación anónima:', error);
});

const appId = firebaseConfig.projectId;

const getMenuCollectionRef = (userId: string) => {
  return collection(db, `artifacts/${appId}/users/${userId}/menuItems`);
};

async function addDefaultMenuItems(userId: string) {
    const defaultItems = [
        { name: "MICHELADA TRADI NAC", price: 2.50 }, { name: "MICHELADA TAMA NAC", price: 2.50 },
        { name: "MICHELADA CLAMA NAC", price: 2.50 }, { name: "MICHELADA TRADI CORONA", price: 3.25 },
        { name: "MICHELADA TAMA CORONA", price: 3.25 }, { name: "MICHELADA CLAMA CORONA", price: 3.25 },
        { name: "MICHELADA TRADI MINERAL", price: 2.00 }, { name: "COCTEL CAMARON CEVI", price: 3.50 },
        { name: "COCTEL CONCHAS", price: 3.50 }, { name: "COCTEL PESCADO", price: 3.50 },
        { name: "COCTEL MIXTO CEVI", price: 3.50 }, { name: "COCTEL CAMA SALS ROSA", price: 3.50 },
        { name: "PILSENER", price: 1.25 }, { name: "GOLDEN", price: 1.25 },
        { name: "REGIA", price: 1.25 }, { name: "SUPREMA", price: 1.50 },
        { name: "CORONA", price: 2.00 }
    ];
    const menuCollectionRef = getMenuCollectionRef(userId);
    const writePromises = defaultItems.map(item => addDoc(menuCollectionRef, item));
    await Promise.all(writePromises);
}

export const setupMenuListener = (
  userId: string,
  callback: (items: MenuItem[]) => void,
  onError: (error: Error) => void
) => {
  const menuCollectionRef = getMenuCollectionRef(userId);

  const handleSnapshot = async (snapshot: QuerySnapshot) => {
      if (snapshot.empty && userId) {
        try {
            await addDefaultMenuItems(userId);
        } catch (e) {
            onError(e as Error);
        }
      } else {
        const items = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as MenuItem)
        );
        callback(items);
      }
  };

  const unsubscribe = onSnapshot(menuCollectionRef, handleSnapshot, (error) => {
    console.error('Error al escuchar cambios en el menú:', error);
    onError(error);
  });

  return unsubscribe;
};

export const addMenuItem = async (userId: string, name: string, price: number) => {
  if (!name || isNaN(price) || price <= 0) {
    throw new Error('Por favor, ingresa un nombre y un precio válido.');
  }

  const menuCollectionRef = getMenuCollectionRef(userId);
  const q = query(menuCollectionRef, where('name', '==', name));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    throw new Error(`El producto "${name}" ya existe en el menú.`);
  }

  await addDoc(menuCollectionRef, { name, price });
};

export const deleteMenuItem = async (userId: string, itemId: string) => {
  const itemDocRef = doc(db, `artifacts/${appId}/users/${userId}/menuItems`, itemId);
  await deleteDoc(itemDocRef);
};

export { auth, onAuthStateChanged, User };
