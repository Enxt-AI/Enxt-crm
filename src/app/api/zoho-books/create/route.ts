import { createInvoice } from '../../../../lib/zohoBooks';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json(); // payload from client
    const invoice = await createInvoice(payload);
    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
