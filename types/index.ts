export interface Task {
    id: string;
    title: string;
    description: string;
    location: string;
    executionDate: string;
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
    createdAt: string;
}

export type TaskStatus = Task['status'];