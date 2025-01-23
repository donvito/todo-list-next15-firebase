import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

type Context = {
  params: Promise<{ id: string }> | { id: string };
};

async function getUserFromToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function PUT(
  request: NextRequest,
  context: Context
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split('Bearer ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getUserFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const todoRef = adminDb.collection('todos').doc(id);
    const todo = await todoRef.get();

    if (!todo.exists) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    // Verify ownership
    const todoData = todo.data();
    if (todoData?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const currentCompleted = todoData?.completed || false;
    await todoRef.update({ completed: !currentCompleted });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error toggling todo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
