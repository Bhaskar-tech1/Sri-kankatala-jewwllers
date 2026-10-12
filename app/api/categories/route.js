import { NextResponse } from 'next/server';
import { getAllCategories, addCustomCategory } from '@/lib/categories';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = (body?.name || '').trim();

    if (!name || name.toLowerCase() === 'other' || name.toLowerCase() === 'others') {
      return NextResponse.json(
        { error: 'Please provide a valid category name' },
        { status: 400 }
      );
    }

    const categories = await addCustomCategory(name);
    return NextResponse.json(
      { success: true, name, categories },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving custom category:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save custom category' },
      { status: 500 }
    );
  }
}
