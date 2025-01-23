import { Todo, Priority, Category } from '@/types/todo';
import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Pencil, X, Image as ImageIcon } from "lucide-react";
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(todo.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedTitle(todo.title);
    setEditedCategory(todo.category);
    setEditedPriority(todo.priority);
    setEditedDeadline(todo.deadline ? new Date(todo.deadline).toISOString().split('T')[0] : '');
    setEditedImageUrl(todo.imageUrl);
    setImagePreview(todo.imageUrl || null);
  }, [todo]);

  const uploadImage = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `todo-images/${Date.now()}-${file.name}`);
    try {
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size must be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setEditedImageUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedTitle.trim()) return;

    try {
      const updates: Partial<Todo> = { title: editedTitle.trim() };
      if (editedCategory) updates.category = editedCategory;
      if (editedPriority) updates.priority = editedPriority;
      if (editedDeadline) updates.deadline = editedDeadline;

      if (selectedImage) {
        updates.imageUrl = await uploadImage(selectedImage);
      } else if (imagePreview === null) {
        updates.imageUrl = undefined; // Remove image if it was deleted
      }

      onEdit(todo.id, updates);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleCancel = () => {
    setEditedTitle(todo.title);
    setEditedCategory(todo.category);
    setEditedPriority(todo.priority);
    setEditedDeadline(todo.deadline ? new Date(todo.deadline).toISOString().split('T')[0] : '');
    setSelectedImage(null);
    setImagePreview(todo.imageUrl || null);
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
      <div className="space-y-4 p-6 rounded-xl border border-gray-200/50 bg-white/60 backdrop-blur-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>
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
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
            <div className="mt-1 flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                ref={fileInputRef}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <ImageIcon className="h-5 w-5 text-gray-400" />
                Choose Image
              </button>
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleImageRemove}
                    className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
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
            {todo.imageUrl && (
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                Image
              </span>
            )}
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
