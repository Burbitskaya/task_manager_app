import { TaskStatus } from '../types';

export const getStatusColor = (status: TaskStatus, colors: any): string => {
    switch (status) {
        case 'completed': return colors.success;
        case 'in-progress': return colors.info;
        case 'pending': return colors.warning;
        case 'cancelled': return colors.danger;
        default: return colors.info;
    }
};


export const getStatusText = (status: TaskStatus): string => {
    switch (status) {
        case 'completed': return 'Completed';
        case 'in-progress': return 'In Progress';
        case 'pending': return 'Pending';
        case 'cancelled': return 'Cancelled';
        default: return status;
    }
};