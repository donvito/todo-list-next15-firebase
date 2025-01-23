import { Todo, Priority, Category } from '@/types/todo';
import { useState, useEffect } from 'react';
import { CheckCircle2, Pencil } from "lucide-react";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Todo>) => void;
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [editedCategory, setEditedCategory] = useState<Category | undefined>(todo.category);
  const [editedPriority, setEditedPriority] = useState<Priority | undefined>(todo.priority);
  const [editedDeadline, setEditedDeadline] = useState<string>(
    todo.deadline ? new Date(todo.deadline).toISOString().split('T')[0] : ''
  );
  const [editedImageUrl, setEditedImageUrl] = useState<string | undefined>(todo.imageUrl);

  useEffect(() => {
    setEditedTitle(todo.title);
    setEditedCategory(todo.category);
    setEditedPriority(todo.priority);
    setEditedDeadline(todo.deadline ? new Date(todo.deadline).toISOString().split('T')[0] : '');
    setEditedImageUrl(todo.imageUrl);
  }, [todo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedTitle.trim()) {
      const updates: Partial<Todo> = {
        title: editedTitle.trim()
      };

      if (editedCategory) updates.category = editedCategory;
      if (editedPriority) updates.priority = editedPriority;
      if (editedDeadline) updates.deadline = editedDeadline;
      if (editedImageUrl) updates.imageUrl = editedImageUrl;

      console.log('Submitting edit with:', updates);
      onEdit(todo.id, updates);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedTitle(todo.title);
    setEditedCategory(todo.category);
    setEditedPriority(todo.priority);
    setEditedDeadline(todo.deadline ? new Date(todo.deadline).toISOString().split('T')[0] : '');
    setEditedImageUrl(todo.imageUrl);
    setIsEditing(false);
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'bg-rose-50 text-rose-700';
      case 'medium': return 'bg-amber-50 text-amber-700';
      case 'low': return 'bg-emerald-50 text-emerald-700';
    }
  };

  const formatDate = (date: Date | string) => {
    try {
      return new Date(date).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (isEditing) {
    return (
      <div className="group rounded-xl border border-gray-200/50 bg-white/60 backdrop-blur-sm p-5 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category (optional)</label>
              <select
                value={editedCategory || ''}
                onChange={(e) => setEditedCategory(e.target.value ? e.target.value as Category : undefined)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No category</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="shopping">Shopping</option>
                <option value="health">Health</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority (optional)</label>
              <select
                value={editedPriority || ''}
                onChange={(e) => setEditedPriority(e.target.value ? e.target.value as Priority : undefined)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (optional)</label>
              <input
                type="date"
                value={editedDeadline}
                onChange={(e) => setEditedDeadline(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
            <input
              type="text"
              value={editedImageUrl || ''}
              onChange={(e) => setEditedImageUrl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-4 rounded-xl border border-gray-200/50 bg-white/60 backdrop-blur-sm p-5 shadow-sm transition-all hover:shadow-md hover:border-gray-300/50 hover:bg-white/80">
      <div className="relative flex-shrink-0 w-5 h-5 mt-1">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="absolute z-10 w-5 h-5 cursor-pointer rounded-lg border-2 border-gray-300 text-indigo-600 transition-all focus:ring-indigo-500 focus:ring-offset-0 checked:border-indigo-600 checked:bg-indigo-600"
        />
        {todo.completed && (
          <CheckCircle2 className="pointer-events-none absolute inset-0 text-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-4 flex-wrap">
          <span
            className={`flex-1 transition-all ${
              todo.completed ? "text-gray-400 line-through" : "text-gray-700"
            }`}
            onDoubleClick={() => setIsEditing(true)}
          >
            {todo.title}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {todo.category && (
              <span className="rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
                {todo.category}
              </span>
            )}
            {todo.priority && (
              <span
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${getPriorityColor(todo.priority)}`}
              >
                {todo.priority}
              </span>
            )}
            {todo.deadline && (
              <span className="text-sm text-gray-500">
                Due: {formatDate(todo.deadline)}
              </span>
            )}
          </div>
        </div>
        {todo.imageUrl && (
          <div className="mt-3">
            <img
              src={todo.imageUrl}
              alt={todo.title}
              className="max-h-48 rounded-lg object-cover"
            />
          </div>
        )}
      </div>
      <div className="flex gap-2 opacity-0 transition-all group-hover:opacity-100">
        <button
          onClick={() => setIsEditing(true)}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-400 hover:bg-gray-50 hover:text-indigo-600 focus:outline-none"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-400 hover:bg-gray-50 hover:text-rose-600 focus:outline-none"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
