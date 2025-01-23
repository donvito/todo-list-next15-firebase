import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Todo } from '@/types/todo';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET() {
  try {
    const todosSnapshot = await adminDb.collection('todos').orderBy('createdAt', 'desc').get();
    const todos = todosSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || null,
        deadline: data.deadline?.toDate?.() || null
      };
    });
    
    return NextResponse.json({ todos });
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
      createdAt: Timestamp.now()
    });
    
    return NextResponse.json({ id: docRef.id });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
