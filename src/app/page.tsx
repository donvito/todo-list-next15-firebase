'use client';

import { useState, useEffect, useRef } from 'react';
import { Todo, Category, Priority } from '@/types/todo';
import TodoItem from '@/components/TodoItem';
import {
  PlusCircle,
  Layout,
  CheckCircle2,
  Clock,
  Tag,
  Search,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Category>();
  const [newPriority, setNewPriority] = useState<Priority>();
  const [newDeadline, setNewDeadline] = useState('');
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos');
      const data = await response.json();
      setTodos(data.todos);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setLoading(false);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      let imageUrl: string | undefined;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTodoTitle,
          category: newCategory,
          priority: newPriority,
          deadline: newDeadline || null,
          imageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add todo');
      }

      setNewTodoTitle('');
      setNewCategory(undefined);
      setNewPriority(undefined);
      setNewDeadline('');
      setSelectedImage(null);
      setImagePreview(null);
      setIsAddingTodo(false);
      fetchTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle todo');
      }

      fetchTodos();
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTodos();
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const editTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const response = await fetch(`/api/todos/${id}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update todo');
      }

      // Update the todo in the local state immediately
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id ? { ...todo, ...updates } : todo
        )
      );

    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const filters = [
    {
      id: "all",
      name: "All Tasks",
      icon: Layout,
    },
    {
      id: "completed",
      name: "Completed",
      icon: CheckCircle2,
    },
    {
      id: "pending",
      name: "Pending",
      icon: Clock,
    },
    {
      id: "categories",
      name: "Categories",
      icon: Tag,
    },
  ];

  const filteredTodos = todos.filter((todo) => {
    const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "all" 
      || (selectedFilter === "completed" && todo.completed)
      || (selectedFilter === "pending" && !todo.completed)
      || (selectedFilter === "categories" && todo.category);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      <aside className="w-72 bg-white/70 backdrop-blur-xl border-r border-gray-200/50 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Tasks</h2>
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all"
          />
        </div>
        <nav className="space-y-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                selectedFilter === filter.id
                  ? "bg-indigo-50/80 text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50/80"
              }`}
            >
              <filter.icon className="h-5 w-5" />
              {filter.name}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-12">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Todo List
              </h1>
              <p className="text-gray-500">Organize your tasks efficiently</p>
            </div>
            <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50">
              <span className="text-sm font-medium text-gray-600">
                {todos.filter((t) => t.completed).length}/{todos.length} completed
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    placeholder="Add a new task..."
                    className="w-full pl-4 pr-24 py-3 rounded-xl border border-gray-200/50 bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newTodoTitle.trim()}
                  >
                    Add
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingTodo(!isAddingTodo)}
                  className={`px-4 py-3 rounded-xl border border-gray-200/50 bg-white/60 backdrop-blur-sm hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isAddingTodo ? 'text-gray-700' : 'text-indigo-600'
                  }`}
                >
                  {isAddingTodo ? (
                    <>
                      <Layout className="h-5 w-5" />
                      <span className="sr-only">Simple Mode</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-5 w-5" />
                      <span className="sr-only">Advanced Mode</span>
                    </>
                  )}
                </button>
              </div>

              {isAddingTodo && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 rounded-xl border border-gray-200/50 bg-white/60 backdrop-blur-sm">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category (optional)</label>
                    <select
                      value={newCategory || ''}
                      onChange={(e) => setNewCategory(e.target.value ? e.target.value as Category : undefined)}
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
                      value={newPriority || ''}
                      onChange={(e) => setNewPriority(e.target.value ? e.target.value as Priority : undefined)}
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
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
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
                  <div className="sm:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      disabled={!newTodoTitle.trim()}
                    >
                      <PlusCircle className="h-5 w-5" />
                      Add Task
                    </button>
                  </div>
                </div>
              )}
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : filteredTodos.length === 0 ? (
                <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
                  <p className="text-gray-500 text-lg">No tasks found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={toggleTodo}
                      onDelete={deleteTodo}
                      onEdit={editTodo}
                    />
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
