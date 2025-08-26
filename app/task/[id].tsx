import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Task, TaskStatus } from '../../types';
import { useTheme } from '../../components/ThemeContext';

const TaskDetailScreen = () => {
    const { id } = useLocalSearchParams();
    const navigation = useNavigation();
    const router = useRouter();
    const { colors } = useTheme();
    const [task, setTask] = useState<Task | null>(null);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (id) {
            loadTask();
        }
    }, [id]);

    useEffect(() => {
        if (task) {
            navigation.setOptions({ title: task.title });
        }
    }, [task, navigation]);

    const loadTask = async (): Promise<void> => {
        try {
            const storedTasks = await AsyncStorage.getItem('tasks');
            if (storedTasks) {
                const tasks: Task[] = JSON.parse(storedTasks);
                const foundTask = tasks.find(t => t.id === id);
                setTask(foundTask || null);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load task');
        }
    };

    const getStatusColor = (status: TaskStatus): string => {
        switch (status) {
            case 'completed': return colors.success;
            case 'in-progress': return colors.info;
            case 'pending': return colors.warning;
            case 'cancelled': return colors.danger;
            default: return colors.info;
        }
    };

    const getStatusText = (status: TaskStatus): string => {
        switch (status) {
            case 'completed': return 'Completed';
            case 'in-progress': return 'In Progress';
            case 'pending': return 'Pending';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    const updateStatus = async (newStatus: TaskStatus): Promise<void> => {
        if (!task) return;

        try {
            const storedTasks = await AsyncStorage.getItem('tasks');
            const tasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];
            const updatedTasks = tasks.map(t =>
                t.id === task.id ? { ...t, status: newStatus } : t
            );
            await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
            setTask({ ...task, status: newStatus });
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const deleteTask = async (): Promise<void> => {
        if (!task) return;

        try {
            const storedTasks = await AsyncStorage.getItem('tasks');
            const tasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];
            const updatedTasks = tasks.filter(t => t.id !== task.id);
            await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
            setShowDeleteModal(false);
            router.back(); // Вернуться на предыдущий экран после удаления
        } catch (error) {
            Alert.alert('Error', 'Failed to delete task');
            setShowDeleteModal(false);
        }
    };

    const showStatusOptions = (): void => {
        setShowStatusDropdown(true);
    };

    const handleStatusChange = (newStatus: TaskStatus): void => {
        updateStatus(newStatus);
        setShowStatusDropdown(false);
    };

    const showDeleteConfirmation = (): void => {
        setShowDeleteModal(true);
    };

    const cancelDelete = (): void => {
        setShowDeleteModal(false);
    };

    if (!task) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.card, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={[styles.statusButton, { backgroundColor: getStatusColor(task.status) }]}
                        onPress={showStatusOptions}
                    >
                        <View style={styles.statusButtonContent}>
                            <Text style={styles.statusButtonText}>{getStatusText(task.status)}</Text>
                            <Ionicons
                                name="create-outline"
                                size={14}
                                color="rgba(255,255,255,0.7)"
                                style={styles.editIcon}
                            />
                        </View>
                    </TouchableOpacity>

                    {/* Кнопка удаления */}
                    <TouchableOpacity
                        style={[styles.deleteButton]}
                        onPress={showDeleteConfirmation}
                    >
                        <Ionicons name="trash-outline" size={24} color={colors.danger} />
                    </TouchableOpacity>
                </View>

                {/* Модальное окно изменения статуса */}
                <Modal
                    visible={showStatusDropdown}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowStatusDropdown(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.dropdownContainer, { backgroundColor: colors.cardBackground }]}>
                            <TouchableOpacity
                                style={[styles.statusOption, { backgroundColor: getStatusColor('in-progress') }]}
                                onPress={() => handleStatusChange('in-progress')}
                            >
                                <Text style={styles.statusOptionText}>In Progress</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.statusOption, { backgroundColor: getStatusColor('completed') }]}
                                onPress={() => handleStatusChange('completed')}
                            >
                                <Text style={styles.statusOptionText}>Completed</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.statusOption, { backgroundColor: getStatusColor('cancelled') }]}
                                onPress={() => handleStatusChange('cancelled')}
                            >
                                <Text style={styles.statusOptionText}>Cancelled</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.cancelOption, { backgroundColor: colors.inputBackground }]}
                                onPress={() => setShowStatusDropdown(false)}
                            >
                                <Text style={[styles.cancelOptionText, { color: colors.text }]}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Модальное окно подтверждения удаления */}
                <Modal
                    visible={showDeleteModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={cancelDelete}
                >
                    <View style={styles.modalOverlay}>
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
                                    onPress={deleteTask}
                                >
                                    <Text style={[styles.modalButtonText, { color: 'white' }]}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Description</Text>
                    <Text style={[styles.sectionContent, { color: colors.text }]}>{task.description}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Location</Text>
                    <Text style={[styles.sectionContent, { color: colors.text }]}>{task.location}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Execution Date & Time</Text>
                    <Text style={[styles.sectionContent, { color: colors.text }]}>
                        {new Date(task.executionDate).toLocaleString()}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Created At</Text>
                    <Text style={[styles.sectionContent, { color: colors.text }]}>
                        {new Date(task.createdAt).toLocaleString()}
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    card: {
        borderRadius: 16,
        padding: 24,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        marginBottom: 0,
    },
    statusButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 100,
    },
    statusButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12,
    },
    editIcon: {
        marginLeft: 4,
    },
    deleteButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        margin: 0,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    sectionContent: {
        fontSize: 16,
        lineHeight: 24,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownContainer: {
        borderRadius: 12,
        padding: 16,
        width: '80%',
        maxWidth: 300,
    },
    statusOption: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        alignItems: 'center',
    },
    statusOptionText: {
        color: 'white',
        fontWeight: '600',
    },
    cancelOption: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    cancelOptionText: {
        fontWeight: '600',
    },
    // Стили для модального окна удаления
    modalContent: {
        borderRadius: 12,
        padding: 24,
        width: '80%',
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

export default TaskDetailScreen;