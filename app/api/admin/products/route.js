import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { getAdminSession } from '@/lib/admin-auth';
import { getCentralizedRates, calculateProductPrice } from '@/lib/pricing';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function GET() {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const rates = await getCentralizedRates();
    const products = snapshot.docs.map((doc) => {
      const data = doc.data();
      let price = data.price;
      if (data.weightGrams && data.makingChargeValue !== undefined) {
        const dynamicPrice = calculateProductPrice({
          weightGrams: data.weightGrams,
          material: data.material,
          purity: data.purity,
          makingChargeType: data.makingChargeType,
          makingChargeValue: data.makingChargeValue,
          extraAmount: data.extraAmount || 0,
          rates,
        });
        if (dynamicPrice > 0) price = dynamicPrice;
      }
      return {
        id: doc.id,
        ...data,
        price,
      };
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products from Firestore:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      material,
      audience,
      category,
      weightGrams,
      purity,
      price,
      makingChargeType = 'percentage',
      makingChargeValue = 0,
      extraAmount = 0,
      images,
      stockStatus = 'in_stock',
      featured = false,
    } = body;

    if (!name || !category || !material || !weightGrams) {
      return NextResponse.json(
        { error: 'Name, material, category, and weight are required' },
        { status: 400 }
      );
    }

    // Auto-calculate final product price from centralized rates if not explicitly passed
    let finalPrice = Number(price) || 0;
    const rates = await getCentralizedRates();
    const calculatedPrice = calculateProductPrice({
      weightGrams: Number(weightGrams) || 0,
      material,
      purity,
      makingChargeType,
      makingChargeValue,
      extraAmount: Number(extraAmount) || 0,
      rates,
    });

    if (!finalPrice || finalPrice <= 0) {
      finalPrice = calculatedPrice;
    }

    // Generate unique slug
    const baseSlug = slugify(name);
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const newProduct = {
      name: name.trim(),
      slug: uniqueSlug,
      description: description ? description.trim() : '',
      material: material.toLowerCase(),
      audience: (audience || 'women').toLowerCase(),
      category: category.trim(),
      weightGrams: Number(weightGrams) || 0,
      purity: purity || (material.toLowerCase() === 'gold' ? '22K' : '92.5 Sterling'),
      makingChargeType: makingChargeType === 'milligrams' ? 'milligrams' : 'percentage',
      makingChargeValue: Number(makingChargeValue) || 0,
      extraAmount: Number(extraAmount) || 0,
      price: finalPrice,
      images: Array.isArray(images) && images.length > 0 ? images : ['/images/categories/Necklaces.png'],
      stockStatus: stockStatus || 'in_stock',
      featured: Boolean(featured),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'products'), newProduct);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      product: { id: docRef.id, ...newProduct },
    });
  } catch (error) {
    console.error('Error adding product to Firestore:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add product' },
      { status: 500 }
    );
  }
}
