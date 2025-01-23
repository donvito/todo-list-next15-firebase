export type Priority = 'low' | 'medium' | 'high';
export type Category = 'work' | 'personal' | 'shopping' | 'health' | 'other';

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date | string;
  category?: Category;
  priority?: Priority;
  deadline: Date | string | null;
  imageUrl?: string;
};
