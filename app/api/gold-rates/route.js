import { NextResponse } from 'next/server';
import { getCentralizedRates, saveCentralizedRates } from '@/lib/pricing';
import { getAdminSession } from '@/lib/admin-auth';

export async function GET() {
  try {
    const rates = await getCentralizedRates();
    return NextResponse.json({ rates });
  } catch (error) {
    console.error('Error fetching gold rates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gold rates', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const adminUid = session.username || 'admin';
    const updatedRates = await saveCentralizedRates(body, adminUid);

    return NextResponse.json({
      success: true,
      rates: updatedRates,
      message: 'Centralized gold rates updated successfully',
    });
  } catch (error) {
    console.error('Error saving gold rates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save gold rates' },
      { status: 500 }
    );
  }
}
