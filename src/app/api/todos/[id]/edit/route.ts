import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Todo, Priority, Category } from '@/types/todo';
import { Timestamp } from 'firebase-admin/firestore';

type Context = {
  params: Promise<{ id: string }> | { id: string };
};

type UpdateFields = {
  title: string;
  category?: Category;
  priority?: Priority;
  deadline?: string | null;
};

export async function PUT(
  request: NextRequest,
  context: Context
) {
  try {
    // 1. Get and validate the ID
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({
        error: 'Invalid request',
        details: 'Todo ID is required'
      }, { status: 400 });
    }

    // 2. Parse the request body
    let body: UpdateFields;
    try {
      body = await request.json();
      console.log('Received request body:', body);
    } catch (error) {
      return NextResponse.json({
        error: 'Invalid request',
        details: 'Failed to parse request body'
      }, { status: 400 });
    }

    const { title, category, priority, deadline } = body;

    // 3. Validate required fields
    if (!title?.trim()) {
      return NextResponse.json({
        error: 'Validation failed',
        details: 'Title is required'
      }, { status: 400 });
    }

    // 4. Validate category and priority values if provided
    const validCategories: Category[] = ['work', 'personal', 'shopping', 'health', 'other'];
    const validPriorities: Priority[] = ['low', 'medium', 'high'];

    if (category && !validCategories.includes(category as Category)) {
      return NextResponse.json({
        error: 'Invalid category',
        details: `Category must be one of: ${validCategories.join(', ')}`
      }, { status: 400 });
    }

    if (priority && !validPriorities.includes(priority as Priority)) {
      return NextResponse.json({
        error: 'Invalid priority',
        details: `Priority must be one of: ${validPriorities.join(', ')}`
      }, { status: 400 });
    }

    // 5. Check if todo exists
    const todoRef = adminDb.collection('todos').doc(id);
    const todo = await todoRef.get();
    
    if (!todo.exists) {
      return NextResponse.json({
        error: 'Todo not found',
        details: `No todo found with ID: ${id}`
      }, { status: 404 });
    }

    // 6. Handle deadline conversion
    let deadlineTimestamp = null;
    if (deadline) {
      try {
        deadlineTimestamp = Timestamp.fromDate(new Date(deadline));
      } catch (error) {
        return NextResponse.json({
          error: 'Invalid deadline',
          details: 'Could not parse deadline date'
        }, { status: 400 });
      }
    }

    // 7. Prepare and perform update
    const updates: Record<string, any> = {
      title: title.trim(),
      updatedAt: Timestamp.now()
    };

    // Only include optional fields if they are provided
    if (category) updates.category = category;
    if (priority) updates.priority = priority;
    if (deadline !== undefined) updates.deadline = deadlineTimestamp;

    console.log('Updating todo with:', updates);
    await todoRef.update(updates);

    // 8. Return success response
    return NextResponse.json({
      success: true,
      message: 'Todo updated successfully',
      id
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
