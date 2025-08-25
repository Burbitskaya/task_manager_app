import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, TaskStatus } from '../../types';

const TaskDetailScreen = () => {
    const { id } = useLocalSearchParams();
    const navigation = useNavigation();
    const [task, setTask] = useState<Task | null>(null);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);



    useEffect(() => {
        if (id) {
            loadTask();
        }
    }, [id]);

    useEffect(() => {
        // Устанавливаем заголовок экрана равным title задачи
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
            Alert.alert('Ошибка', 'Не удалось загрузить задачу');
        }
    };

    const getStatusColor = (status: TaskStatus): string => {
        switch (status) {
            case 'completed': return '#4cd964';
            case 'in-progress': return '#007aff';
            case 'pending': return '#ffcc00';
            case 'cancelled': return '#ff3b30';
            default: return '#8e8e93';
        }
    };

    const getStatusText = (status: TaskStatus): string => {
        switch (status) {
            case 'completed': return 'Завершено';
            case 'in-progress': return 'В процессе';
            case 'pending': return 'Ожидание';
            case 'cancelled': return 'Отменено';
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
            Alert.alert('Ошибка', 'Не удалось обновить статус');
        }
    };

    const showStatusOptions = (): void => {
        setShowStatusDropdown(true);
    };

    const handleStatusChange = (newStatus: TaskStatus): void => {
        updateStatus(newStatus);
        setShowStatusDropdown(false);
    };

    if (!task) {
        return (
            <View style={styles.container}>
                <Text>Загрузка...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={[styles.statusButton, { backgroundColor: getStatusColor(task.status) }]}
                        onPress={showStatusOptions}
                    >
                        <Text style={styles.statusButtonText}>{getStatusText(task.status)}</Text>
                    </TouchableOpacity>
                </View>

                {/* Модальное окно с вариантами статусов */}
                <Modal
                    visible={showStatusDropdown}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowStatusDropdown(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.dropdownContainer}>

                            <TouchableOpacity
                                style={[styles.statusOption, { backgroundColor: getStatusColor('in-progress') }]}
                                onPress={() => handleStatusChange('in-progress')}
                            >
                                <Text style={styles.statusOptionText}>В процессе</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.statusOption, { backgroundColor: getStatusColor('completed') }]}
                                onPress={() => handleStatusChange('completed')}
                            >
                                <Text style={styles.statusOptionText}>Завершено</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.statusOption, { backgroundColor: getStatusColor('cancelled') }]}
                                onPress={() => handleStatusChange('cancelled')}
                            >
                                <Text style={styles.statusOptionText}>Отменено</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cancelOption}
                                onPress={() => setShowStatusDropdown(false)}
                            >
                                <Text style={styles.cancelOptionText}>Отмена</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Описание</Text>
                    <Text style={styles.sectionContent}>{task.description}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Местоположение</Text>
                    <Text style={styles.sectionContent}>{task.location}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Дата и время выполнения</Text>
                    <Text style={styles.sectionContent}>
                        {new Date(task.executionDate).toLocaleString()}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Дата создания</Text>
                    <Text style={styles.sectionContent}>
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
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
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
        color: '#666',
        marginBottom: 8,
    },
    sectionContent: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownContainer: {
        backgroundColor: 'white',
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
        backgroundColor: '#f1f1f1',
        marginTop: 8,
    },
    cancelOptionText: {
        color: '#666',
        fontWeight: '600',
    },
});

export default TaskDetailScreen;