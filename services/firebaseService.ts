import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  addDoc,
  doc,
  deleteDoc,
  getDocs,
  where,
  Firestore,
} from 'firebase/firestore';
import { MenuItem } from '../types';

// =====================================================================================
// ============================ ¡ATENCIÓN! CONFIGURACIÓN CRÍTICA =====================
// =====================================================================================
// TU CONFIGURACIÓN DE FIREBASE. En un proyecto de producción, NUNCA expongas las claves
// directamente en el código. Utiliza variables de entorno.
// He reemplazado tu clave API con un marcador de posición por seguridad.
// =====================================================================================
const firebaseConfig = {
  apiKey: 'TU_API_KEY_REAL', // <-- ¡REEMPLAZA ESTO!
  authDomain: 'miapprestaurantepos.firebaseapp.com',
  projectId: 'miapprestaurantepos',
  storageBucket: 'miapprestaurantepos.firebasestorage.app',
  messagingSenderId: '953172596341',
  appId: '1:953172596341:web:57ad6ecbece09253368a3c',
};

// Inicializar Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Autenticación anónima
signInAnonymously(auth).catch((error) => {
  console.error('Error en la autenticación anónima:', error);
});

const appId = firebaseConfig.projectId;

const getMenuCollectionRef = (userId: string) => {
  return collection(db, `artifacts/${appId}/users/${userId}/menuItems`);
};

/**
 * Añade productos por defecto si el menú del usuario está vacío.
 */
async function addDefaultMenuItems(userId: string) {
    const defaultItems = [
        { name: "MICHELADA TRADI NAC", price: 2.50 },
        { name: "MICHELADA TAMA NAC", price: 2.50 },
        { name: "MICHELADA CLAMA NAC", price: 2.50 },
        { name: "MICHELADA TRADI CORONA", price: 3.25 },
        { name: "MICHELADA TAMA CORONA", price: 3.25 },
        { name: "MICHELADA CLAMA CORONA", price: 3.25 },
        { name: "MICHELADA TRADI MINERAL", price: 2.00 },
        { name: "COCTEL CAMARON CEVI", price: 3.50 },
        { name: "COCTEL CONCHAS", price: 3.50 },
        { name: "COCTEL PESCADO", price: 3.50 },
        { name: "COCTEL MIXTO CEVI", price: 3.50 },
        { name: "COCTEL CAMA SALS ROSA", price: 3.50 },
        { name: "PILSENER", price: 1.25 },
        { name: "GOLDEN", price: 1.25 },
        { name: "REGIA", price: 1.25 },
        { name: "SUPREMA", price: 1.50 },
        { name: "CORONA", price: 2.00 }
    ];
    const menuCollectionRef = getMenuCollectionRef(userId);
    for (const item of defaultItems) {
        try {
            const q = query(menuCollectionRef, where("name", "==", item.name));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                await addDoc(menuCollectionRef, item);
            }
        } catch (error) {
            console.error("Error añadiendo producto por defecto:", item.name, error);
        }
    }
}


/**
 * Configura un listener en tiempo real para la colección de menú de un usuario.
 * @param userId - El ID del usuario.
 * @param callback - Función a la que llamar con los nuevos datos del menú.
 * @param onError - Función a la que llamar si hay un error.
 * @returns - Una función para cancelar la suscripción al listener.
 */
export const setupMenuListener = (
  userId: string,
  callback: (items: MenuItem[]) => void,
  onError: (error: Error) => void
) => {
  const menuCollectionRef = getMenuCollectionRef(userId);
  const q = query(menuCollectionRef);

  const unsubscribe = onSnapshot(
    q,
    async (snapshot) => {
      if (snapshot.empty && userId) {
        await addDefaultMenuItems(userId);
      } else {
        const items = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as MenuItem)
        );
        callback(items);
      }
    },
    (error) => {
      console.error('Error al escuchar cambios en el menú:', error);
      onError(error);
    }
  );

  return unsubscribe;
};

/**
 * Añade un nuevo producto al menú del usuario en Firestore.
 * @param userId - El ID del usuario.
 * @param name - El nombre del nuevo producto.
 * @param price - El precio del nuevo producto.
 */
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

/**
 * Elimina un producto del menú del usuario en Firestore.
 * @param userId - El ID del usuario.
 * @param itemId - El ID del producto a eliminar.
 */
export const deleteMenuItem = async (userId: string, itemId: string) => {
  const itemDocRef = doc(db, `artifacts/${appId}/users/${userId}/menuItems`, itemId);
  await deleteDoc(itemDocRef);
};
