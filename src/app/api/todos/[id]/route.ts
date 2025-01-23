import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

type Context = {
  params: Promise<{ id: string }> | { id: string };
};

export async function DELETE(
  request: NextRequest,
  context: Context
) {
  try {
    const { id } = await context.params;
    const todoRef = adminDb.collection('todos').doc(id);
    const todo = await todoRef.get();

    if (!todo.exists) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    await todoRef.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
