import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const material = searchParams.get('material');
    const audience = searchParams.get('audience');

    let products = [];
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }
    } catch (fsErr) {
      console.warn('Firestore fetch failed:', fsErr.message);
    }

    if (material) {
      products = products.filter((p) => p.material === material);
    }
    if (audience) {
      products = products.filter((p) => p.audience === audience);
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error in /api/products:', error);
    return NextResponse.json({ products: [] });
  }
}
