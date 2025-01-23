import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

async function getUserFromToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader ? 'present' : 'missing');
    
    const token = authHeader?.split('Bearer ')[1];
    if (!token) {
      console.log('No token found in auth header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getUserFromToken(token);
    console.log('User ID from token:', userId ? 'found' : 'not found');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get todos that have the userId field matching current user
    const userTodosSnapshot = await adminDb.collection('todos')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    console.log('User-specific todos found:', userTodosSnapshot.size);

    const todos = [];
    for (const doc of userTodosSnapshot.docs) {
      const data = doc.data();
      todos.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || null,
        deadline: data.deadline?.toDate?.() || null
      });
    }
    
    console.log('Processed todos:', todos.length);
    return NextResponse.json({ todos });
  } catch (error) {
    console.error('Error fetching todos:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const { title, category, priority, deadline, imageUrl } = await request.json();
    
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const docRef = await adminDb.collection('todos').add({
      title: title.trim(),
      category: category || null,
      priority: priority || null,
      deadline: deadline ? Timestamp.fromDate(new Date(deadline)) : null,
      imageUrl: imageUrl || null,
      completed: false,
      createdAt: Timestamp.now(),
      userId
    });
    
    return NextResponse.json({ id: docRef.id });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
