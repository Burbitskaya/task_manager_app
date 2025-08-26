import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Modal,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Task, TaskStatus } from '../types';
import { useTheme } from '../components/ThemeContext';

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
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

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
            Alert.alert('Error', 'Failed to load tasks');
        }
    };

    // Show delete confirmation modal for single task
    const showDeleteConfirmation = (id: string): void => {
        setTaskToDelete(id);
        setSingleDeleteModalVisible(true);
    };

    // Handle single task deletion
    const handleDeleteTask = async (): Promise<void> => {
        if (!taskToDelete) return;

        try {
            const updatedTasks = tasks.filter(task => task.id !== taskToDelete);
            setTasks(updatedTasks);
            await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
            setSingleDeleteModalVisible(false);
            setTaskToDelete(null);
        } catch (error) {
            Alert.alert('Error', 'Failed to delete task');
            setSingleDeleteModalVisible(false);
        }
    };

    // Cancel single deletion
    const cancelSingleDelete = (): void => {
        setSingleDeleteModalVisible(false);
        setTaskToDelete(null);
    };

    // Show delete confirmation modal for multiple tasks
    const showMultiDeleteConfirmation = (): void => {
        if (selectedTasks.length > 0) {
            setMultiDeleteModalVisible(true);
        }
    };

    // Handle multiple task deletion
    const handleMultiDelete = async (): Promise<void> => {
        if (selectedTasks.length === 0) return;

        try {
            const updatedTasks = tasks.filter(task => !selectedTasks.includes(task.id));
            setTasks(updatedTasks);
            await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
            setMultiDeleteModalVisible(false);
            cancelSelectionMode();
        } catch (error) {
            Alert.alert('Error', 'Failed to delete tasks');
            setMultiDeleteModalVisible(false);
        }
    };

    // Cancel multiple deletion
    const cancelMultiDelete = (): void => {
        setMultiDeleteModalVisible(false);
    };

    // Toggle task selection
    const toggleTaskSelection = (id: string): void => {
        setSelectedTasks(prev => {
            if (prev.includes(id)) {
                return prev.filter(taskId => taskId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Enable selection mode
    const enableSelectionMode = (id: string): void => {
        setIsSelectionMode(true);
        setSelectedTasks([id]);
    };

    // Cancel selection mode
    const cancelSelectionMode = (): void => {
        setIsSelectionMode(false);
        setSelectedTasks([]);
    };

    // Handle sort configuration change
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

    // Sort tasks based on current sort configuration
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

    // Render individual task item
    const renderTaskItem = ({ item }: { item: Task }) => {
        const statusColor = getStatusColor(item.status);

        return (
            <TouchableOpacity
                style={[
                    styles.taskItem,
                    {
                        backgroundColor: colors.cardBackground,
                        shadowColor: colors.shadow,
                        borderColor: selectedTasks.includes(item.id) ? colors.primary : statusColor,
                        borderWidth: 2,
                    }
                ]}
                onPress={() => {
                    if (isSelectionMode) {
                        toggleTaskSelection(item.id);
                    } else {
                        router.push(`/task/${item.id}`);
                    }
                }}
                onLongPress={() => enableSelectionMode(item.id)}
                delayLongPress={300}
            >
                {/* Status header strip */}
                <View style={[styles.statusHeader, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusHeaderText}>{getStatusText(item.status)}</Text>
                </View>

                <View style={styles.taskContent}>
                    <View style={styles.taskInfo}>
                        <Text style={[styles.taskTitle, { color: colors.text }]}>{item.title}</Text>
                        <Text style={[styles.taskDate, { color: colors.textSecondary }]}>
                            {new Date(item.executionDate).toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={styles.taskActions}>
                        {isSelectionMode ? (
                            <Ionicons
                                name={selectedTasks.includes(item.id) ? "checkbox" : "square-outline"}
                                size={24}
                                color={selectedTasks.includes(item.id) ? colors.primary : colors.textSecondary}
                            />
                        ) : (
                            <TouchableOpacity onPress={() => showDeleteConfirmation(item.id)}>
                                <Ionicons name="trash-outline" size={24} color={colors.danger} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
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
                    <TouchableOpacity
                        onPress={showMultiDeleteConfirmation}
                        disabled={selectedTasks.length === 0}
                    >
                        <Ionicons
                            name="trash"
                            size={24}
                            color={selectedTasks.length > 0 ? "white" : "rgba(255,255,255,0.5)"}
                        />
                    </TouchableOpacity>
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

            {/* Floating action button - only show when not in selection mode */}
            {!isSelectionMode && (
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: colors.primary }]}
                    onPress={() => router.push('/add-task')}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            )}

            {/* Single Delete Confirmation Modal */}
            <Modal
                visible={singleDeleteModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={cancelSingleDelete}
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
                                onPress={cancelSingleDelete}
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

            {/* Multiple Delete Confirmation Modal */}
            <Modal
                visible={multiDeleteModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={cancelMultiDelete}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Delete Tasks</Text>
                        <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
                            Are you sure you want to delete {selectedTasks.length} {selectedTasks.length === 1 ? 'task' : 'tasks'}? This action cannot be undone.
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.inputBackground }]}
                                onPress={cancelMultiDelete}
                            >
                                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.danger }]}
                                onPress={handleMultiDelete}
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
    taskItem: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statusHeader: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    statusHeaderText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    taskContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    taskDate: {
        fontSize: 14,
    },
    taskActions: {
        marginLeft: 16,
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