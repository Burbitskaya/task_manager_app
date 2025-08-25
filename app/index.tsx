import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Modal,
    Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Task, TaskStatus } from '../types';
import { useTheme } from '../components/ThemeContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [sortConfig, setSortConfig] = useState<{
        field: 'date' | 'status';
        direction: 'asc' | 'desc';
    }>({ field: 'date', direction: 'desc' });
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Load tasks when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadTasks();
        }, [])
    );

    // Load tasks from AsyncStorage
    const loadTasks = async (): Promise<void> => {
        try {
            const storedTasks = await AsyncStorage.getItem('tasks');
            if (storedTasks) {
                setTasks(JSON.parse(storedTasks));
            }
        } catch (error) {
            // Handle error with custom modal if needed
        }
    };

    // Toggle view mode between list and grid
    const toggleViewMode = (): void => {
        setViewMode(prevMode => prevMode === 'list' ? 'grid' : 'list');
    };

    // Show delete confirmation modal
    const showDeleteConfirmation = (id: string): void => {
        setTaskToDelete(id);
        setDeleteModalVisible(true);
    };

    // Handle task deletion
    const handleDeleteTask = async (): Promise<void> => {
        if (!taskToDelete) return;

        try {
            const updatedTasks = tasks.filter(task => task.id !== taskToDelete);
            setTasks(updatedTasks);
            await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
            setDeleteModalVisible(false);
            setTaskToDelete(null);
        } catch (error) {
            // Handle error
            setDeleteModalVisible(false);
        }
    };

    // Cancel deletion
    const cancelDelete = (): void => {
        setDeleteModalVisible(false);
        setTaskToDelete(null);
    };

    // Handle sort configuration change
    const handleSort = (field: 'date' | 'status') => {
        setSortConfig(prev => {
            if (prev.field === field) {
                return {
                    field,
                    direction: prev.direction === 'asc' ? 'desc' : 'asc'
                };
            }
            return {
                field,
                direction: 'desc'
            };
        });
    };

    // Sort tasks based on current sort configuration
    const sortTasks = (tasksToSort: Task[]): Task[] => {
        const sortedTasks = [...tasksToSort];

        sortedTasks.sort((a, b) => {
            let comparison = 0;

            if (sortConfig.field === 'date') {
                comparison = new Date(a.executionDate).getTime() - new Date(b.executionDate).getTime();
            } else {
                const statusOrder = { 'completed': 1, 'in-progress': 2, 'pending': 3, 'cancelled': 4 };
                comparison = statusOrder[a.status] - statusOrder[b.status];
            }

            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });

        return sortedTasks;
    };

    // Render individual task item in list view
    const renderTaskItemList = ({ item }: { item: Task }) => (
        <TouchableOpacity
            style={[styles.taskItem, styles.taskItemList, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}
            onPress={() => router.push(`/task/${item.id}`)}
        >
            <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.taskDate, { color: colors.textSecondary }]}>
                    {new Date(item.executionDate).toLocaleDateString()}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                </View>
            </View>
            <View style={styles.taskActions}>
                <TouchableOpacity onPress={() => showDeleteConfirmation(item.id)}>
                    <Ionicons name="trash-outline" size={24} color={colors.danger} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    // Render individual task item in grid view
    const renderTaskItemGrid = ({ item }: { item: Task }) => (
        <TouchableOpacity
            style={[styles.taskItem, styles.taskItemGrid, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}
            onPress={() => router.push(`/task/${item.id}`)}
        >
            <View style={styles.taskInfoGrid}>
                <Text style={[styles.taskTitleGrid, { color: colors.text }]} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={[styles.taskDateGrid, { color: colors.textSecondary }]} numberOfLines={1}>
                    {new Date(item.executionDate).toLocaleDateString()}
                </Text>
                <View style={[styles.statusBadgeGrid, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusTextGrid}>{getStatusText(item.status)}</Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.taskActionsGrid}
                onPress={() => showDeleteConfirmation(item.id)}
            >
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    // Get color for status badge
    const getStatusColor = (status: TaskStatus): string => {
        switch (status) {
            case 'completed': return colors.success;
            case 'in-progress': return colors.info;
            case 'pending': return colors.warning;
            case 'cancelled': return colors.danger;
            default: return colors.info;
        }
    };

    // Get text for status badge
    const getStatusText = (status: TaskStatus): string => {
        switch (status) {
            case 'completed': return 'Completed';
            case 'in-progress': return 'In Progress';
            case 'pending': return 'Pending';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    // Get icon for sort button
    const getSortIcon = (field: 'date' | 'status') => {
        if (sortConfig.field !== field) return 'swap-vertical';

        return sortConfig.direction === 'asc' ? 'arrow-up' : 'arrow-down';
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Sort panel */}
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

                {/* View mode toggle button */}
                <TouchableOpacity
                    style={[styles.viewModeButton, { backgroundColor: colors.inputBackground }]}
                    onPress={toggleViewMode}
                >
                    <Ionicons
                        name={viewMode === 'list' ? 'grid' : 'list'}
                        size={20}
                        color={colors.primary}
                    />
                </TouchableOpacity>
            </View>

            {/* Tasks list - using key to force re-render when viewMode changes */}
            {viewMode === 'list' ? (
                <FlatList
                    key="list-view" // Key forces re-render when changed
                    data={sortTasks(tasks)}
                    renderItem={renderTaskItemList}
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
            ) : (
                <FlatList
                    key="grid-view" // Key forces re-render when changed
                    data={sortTasks(tasks)}
                    renderItem={renderTaskItemGrid}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.listGrid}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
                            <Text style={[styles.emptyText, { color: colors.text }]}>No tasks</Text>
                            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Add your first task</Text>
                        </View>
                    }
                />
            )}

            {/* Floating action button */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/add-task')}
            >
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>

            {/* Custom Delete Confirmation Modal */}
            <Modal
                visible={deleteModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={cancelDelete}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Delete Task</Text>
                        <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
                            Are you sure you want to delete this task? This action cannot be undone.
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.inputBackground }]}
                                onPress={cancelDelete}
                            >
                                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.danger }]}
                                onPress={handleDeleteTask}
                            >
                                <Text style={[styles.modalButtonText, { color: 'white' }]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding:12,
        borderBottomWidth: 1,
    },
    sortLabel: {
        marginRight: 12,
        marginLeft:12,
        fontSize: 14,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
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
    viewModeButton: {
        padding: 8,
        borderRadius: 8,
        marginLeft: 'auto',
    },
    list: {
        padding: 16,
        paddingBottom: 80,
    },
    listGrid: {
        padding: 8,
        paddingBottom: 80,
    },
    taskItem: {
        borderRadius: 12,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    taskItemList: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
    },
    taskItemGrid: {
        flex: 1,
        margin: 8,
        padding: 12,
        height: 140,
        justifyContent: 'space-between',
    },
    taskInfo: {
        flex: 1,
    },
    taskInfoGrid: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    taskTitleGrid: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    taskDate: {
        fontSize: 14,
        marginBottom: 8,
    },
    taskDateGrid: {
        fontSize: 12,
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusBadgeGrid: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },
    statusTextGrid: {
        color: 'white',
        fontSize: 10,
        fontWeight: '500',
    },
    taskActions: {
        flexDirection: 'row',
        gap: 16,
    },
    taskActionsGrid: {
        alignSelf: 'flex-end',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 64,
        width: '100%',
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
    // Modal styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalContent: {
        borderRadius: 12,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    modalMessage: {
        fontSize: 16,
        marginBottom: 24,
        lineHeight: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    modalButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        minWidth: 80,
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});