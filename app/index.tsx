import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Task, TaskStatus } from '../types';
import { useTheme } from '../components/ThemeContext';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import StatusEditModal from '../components/StatusEditModal';
import TaskCard from '../components/TaskCard';
import NotificationModal from '../components/NotificationModal';

export default function HomeScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [sortConfig, setSortConfig] = useState<{
        field: 'date' | 'status';
        direction: 'asc' | 'desc';
    }>({ field: 'date', direction: 'desc' });
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [singleDeleteModalVisible, setSingleDeleteModalVisible] = useState(false);
    const [multiDeleteModalVisible, setMultiDeleteModalVisible] = useState(false);
    const [editStatusModalVisible, setEditStatusModalVisible] = useState(false);
    const [notificationModalVisible, setNotificationModalVisible] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState<'error' | 'success'>('error');
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);


    const showNotification = (message: string, type: 'error' | 'success') => {
        setNotificationMessage(message);
        setNotificationType(type);
        setNotificationModalVisible(true);
    };

    // Load tasks when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadTasks();
        }, [])
    );


    const loadTasks = async (): Promise<void> => {
        try {
            const storedTasks = await AsyncStorage.getItem('tasks');
            if (storedTasks) {
                setTasks(JSON.parse(storedTasks));
            }
        } catch (error) {
            showNotification('Failed to load tasks', 'error');
        }
    };


    const showDeleteConfirmation = (id: string): void => {
        setTaskToDelete(id);
        setSingleDeleteModalVisible(true);
    };


    const handleDeleteTask = async (): Promise<void> => {
        if (!taskToDelete) return;

        try {
            const updatedTasks = tasks.filter(task => task.id !== taskToDelete);
            setTasks(updatedTasks);
            await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
            setSingleDeleteModalVisible(false);
            setTaskToDelete(null);
        } catch (error) {
            showNotification('Failed to delete task', 'error');
            setSingleDeleteModalVisible(false);
        }
    };


    const showMultiDeleteConfirmation = (): void => {
        if (selectedTasks.length > 0) {
            setMultiDeleteModalVisible(true);
        }
    };


    const handleMultiDelete = async (): Promise<void> => {
        if (selectedTasks.length === 0) return;

        try {
            const updatedTasks = tasks.filter(task => !selectedTasks.includes(task.id));
            setTasks(updatedTasks);
            await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
            setMultiDeleteModalVisible(false);
            cancelSelectionMode();
        } catch (error) {
            showNotification('Failed to delete tasks', 'error');
            setMultiDeleteModalVisible(false);
        }
    };


    const showEditStatusModal = (): void => {
        if (selectedTasks.length > 0) {
            setEditStatusModalVisible(true);
        }
    };


    const handleMultiStatusUpdate = async (newStatus: TaskStatus): Promise<void> => {
        if (selectedTasks.length === 0) return;

        try {
            const updatedTasks = tasks.map(task =>
                selectedTasks.includes(task.id) ? { ...task, status: newStatus } : task
            );
            setTasks(updatedTasks);
            await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
            setEditStatusModalVisible(false);
            cancelSelectionMode();
        } catch (error) {
            showNotification('Failed to update tasks status', 'error');
            setEditStatusModalVisible(false);
        }
    };


    const toggleTaskSelection = (id: string): void => {
        setSelectedTasks(prev => {
            if (prev.includes(id)) {
                return prev.filter(taskId => taskId !== id);
            } else {
                return [...prev, id];
            }
        });
    };


    const enableSelectionMode = (id: string): void => {
        setIsSelectionMode(true);
        setSelectedTasks([id]);
    };


    const cancelSelectionMode = (): void => {
        setIsSelectionMode(false);
        setSelectedTasks([]);
    };


    const handleSort = (field: 'date' | 'status') => {
        setSortConfig(prev => {
            // If clicking the same field, toggle direction
            if (prev.field === field) {
                return {
                    field,
                    direction: prev.direction === 'asc' ? 'desc' : 'asc'
                };
            }
            // If clicking a new field, set it with default direction
            return {
                field,
                direction: 'desc'
            };
        });
    };


    const sortTasks = (tasksToSort: Task[]): Task[] => {
        const sortedTasks = [...tasksToSort];

        sortedTasks.sort((a, b) => {
            let comparison = 0;

            if (sortConfig.field === 'date') {
                comparison = new Date(a.executionDate).getTime() - new Date(b.executionDate).getTime();
            } else {
                // Sort by status
                const statusOrder = { 'completed': 1, 'in-progress': 2, 'pending': 3, 'cancelled': 4 };
                comparison = statusOrder[a.status] - statusOrder[b.status];
            }

            // Apply sort direction
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });

        return sortedTasks;
    };


    const getSortIcon = (field: 'date' | 'status') => {
        if (sortConfig.field !== field) return 'swap-vertical';

        return sortConfig.direction === 'asc' ? 'arrow-up' : 'arrow-down';
    };


    const renderTaskItem = ({ item }: { item: Task }) => {
        const isSelected = selectedTasks.includes(item.id);

        return (
            <TaskCard
                task={item}
                isSelectionMode={isSelectionMode}
                isSelected={isSelected}
                onPress={() => {
                    if (isSelectionMode) {
                        toggleTaskSelection(item.id);
                    } else {
                        router.push(`/task/${item.id}`);
                    }
                }}
                onLongPress={() => enableSelectionMode(item.id)}
                onDelete={() => showDeleteConfirmation(item.id)}
            />
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Selection mode header */}
            {isSelectionMode && (
                <View style={[styles.selectionHeader, { backgroundColor: colors.primary }]}>
                    <TouchableOpacity onPress={cancelSelectionMode}>
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.selectionHeaderText}>
                        {selectedTasks.length} {selectedTasks.length === 1 ? 'item' : 'items'} selected
                    </Text>
                    <View style={styles.selectionActions}>
                        <TouchableOpacity
                            onPress={showEditStatusModal}
                            disabled={selectedTasks.length === 0}
                            style={styles.selectionActionButton}
                        >
                            <Ionicons
                                name="create-outline"
                                size={24}
                                color={selectedTasks.length > 0 ? "white" : "rgba(255,255,255,0.5)"}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={showMultiDeleteConfirmation}
                            disabled={selectedTasks.length === 0}
                            style={styles.selectionActionButton}
                        >
                            <Ionicons
                                name="trash"
                                size={24}
                                color={selectedTasks.length > 0 ? "white" : "rgba(255,255,255,0.5)"}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Sort panel */}
            {!isSelectionMode && (
                <View style={[styles.sortContainer, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
                    <Text style={[styles.sortLabel, { color: colors.textSecondary }]}>Sort by:</Text>
                    <TouchableOpacity
                        style={[styles.sortButton, { backgroundColor: colors.inputBackground }]}
                        onPress={() => handleSort('date')}
                    >
                        <Ionicons
                            name={getSortIcon('date')}
                            size={16}
                            color={sortConfig.field === 'date' ? colors.primary : colors.textSecondary}
                        />
                        <Text style={[
                            styles.sortButtonText,
                            { color: sortConfig.field === 'date' ? colors.primary : colors.textSecondary },
                            sortConfig.field === 'date' && styles.sortButtonActive
                        ]}>
                            Date
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.sortButton, { backgroundColor: colors.inputBackground }]}
                        onPress={() => handleSort('status')}
                    >
                        <Ionicons
                            name={getSortIcon('status')}
                            size={16}
                            color={sortConfig.field === 'status' ? colors.primary : colors.textSecondary}
                        />
                        <Text style={[
                            styles.sortButtonText,
                            { color: sortConfig.field === 'status' ? colors.primary : colors.textSecondary },
                            sortConfig.field === 'status' && styles.sortButtonActive
                        ]}>
                            Status
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Tasks list */}
            <FlatList
                data={sortTasks(tasks)}
                renderItem={renderTaskItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.text }]}>No tasks</Text>
                        <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Add your first task</Text>
                    </View>
                }
            />

            {/* Fab - only show when not in selection mode */}
            {!isSelectionMode && (
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: colors.primary }]}
                    onPress={() => router.push('/add-task')}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            )}


            <DeleteConfirmationModal
                visible={singleDeleteModalVisible}
                onRequestClose={() => setSingleDeleteModalVisible(false)}
                onConfirm={handleDeleteTask}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
            />


            <DeleteConfirmationModal
                visible={multiDeleteModalVisible}
                onRequestClose={() => setMultiDeleteModalVisible(false)}
                onConfirm={handleMultiDelete}
                title="Delete Tasks"
                message={`Are you sure you want to delete ${selectedTasks.length} ${selectedTasks.length === 1 ? 'task' : 'tasks'}? This action cannot be undone.`}
            />


            <StatusEditModal
                visible={editStatusModalVisible}
                onRequestClose={() => setEditStatusModalVisible(false)}
                onStatusChange={handleMultiStatusUpdate}
                title="Update Status"
                message={`Set new status for ${selectedTasks.length} ${selectedTasks.length === 1 ? 'task' : 'tasks'}:`}
            />


            <NotificationModal
                visible={notificationModalVisible}
                onRequestClose={() => setNotificationModalVisible(false)}
                type={notificationType}
                title={notificationType === 'success' ? 'Success' : 'Error'}
                message={notificationMessage}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    selectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    selectionHeaderText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    selectionActions: {
        flexDirection: 'row',
        gap: 16,
    },
    selectionActionButton: {
        padding: 4,
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    sortLabel: {
        marginRight: 12,
        fontSize: 14,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
    },
    sortButtonText: {
        marginLeft: 4,
        fontSize: 14,
    },
    sortButtonActive: {
        fontWeight: '600',
    },
    list: {
        padding: 16,
        paddingBottom: 80, // Padding for FAB
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 64,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
});