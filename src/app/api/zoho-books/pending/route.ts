import { NextResponse } from 'next/server';
import { fetchPendingInvoices } from '../../../../lib/zohoBooks';

export async function GET() {
  try {
    const invoices = await fetchPendingInvoices();
    return NextResponse.json({ success: true, data: invoices });
  } catch (error: any) {
    console.error('Error fetching pending invoices:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
