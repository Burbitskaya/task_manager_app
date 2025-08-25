import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, TaskStatus } from '../../types';
import { useTheme } from '../../components/ThemeContext';

const TaskDetailScreen = () => {
    const { id } = useLocalSearchParams();
    const navigation = useNavigation();
    const { colors } = useTheme();
    const [task, setTask] = useState<Task | null>(null);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    // Load task when component mounts or id changes
    useEffect(() => {
        if (id) {
            loadTask();
        }
    }, [id]);

    // Set navigation title to task title
    useEffect(() => {
        if (task) {
            navigation.setOptions({ title: task.title });
        }
    }, [task, navigation]);

    // Load task from AsyncStorage
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

    // Update task status in AsyncStorage
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

    // Show status options dropdown
    const showStatusOptions = (): void => {
        setShowStatusDropdown(true);
    };

    // Handle status change from dropdown
    const handleStatusChange = (newStatus: TaskStatus): void => {
        updateStatus(newStatus);
        setShowStatusDropdown(false);
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
                        <Text style={styles.statusButtonText}>{getStatusText(task.status)}</Text>
                    </TouchableOpacity>
                </View>

                {/* Status options dropdown modal */}
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
        alignItems: 'center',
    },
    statusButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12,
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
});

export default TaskDetailScreen;