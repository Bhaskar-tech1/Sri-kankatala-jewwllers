import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAdminSession } from '@/lib/admin-auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product: { id: docSnap.id, ...docSnap.data() } });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const updates = await request.json();

    // Sanitize numeric fields if present
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.weightGrams !== undefined) updates.weightGrams = Number(updates.weightGrams);
    if (updates.makingChargeValue !== undefined) updates.makingChargeValue = Number(updates.makingChargeValue);

    updates.updatedAt = new Date().toISOString();

    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, updates);

    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
