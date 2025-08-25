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

// Theme types
export interface ThemeColors {
    background: string;
    cardBackground: string;
    text: string;
    textSecondary: string;
    primary: string;
    danger: string;
    success: string;
    warning: string;
    info: string;
    border: string;
    shadow: string;
    inputBackground: string;
}

export interface Theme {
    light: ThemeColors;
    dark: ThemeColors;
}

export type ColorScheme = 'light' | 'dark';