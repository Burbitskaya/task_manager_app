import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Task, TaskStatus } from '../types';

export default function HomeScreen() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [sortConfig, setSortConfig] = useState<{
        field: 'date' | 'status';
        direction: 'asc' | 'desc';
    }>({ field: 'date', direction: 'desc' });

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
            Alert.alert('Ошибка', 'Не удалось загрузить задачи');
        }
    };

    const deleteTask = async (id: string): Promise<void> => {
        Alert.alert(
            'Удалить задачу',
            'Вы уверены?',
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: async () => {
                        const updatedTasks = tasks.filter(task => task.id !== id);
                        setTasks(updatedTasks);
                        await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
                    }
                }
            ]
        );
    };

    const handleSort = (field: 'date' | 'status') => {
        setSortConfig(prev => {
            // Если кликаем по тому же полю, меняем направление
            if (prev.field === field) {
                return {
                    field,
                    direction: prev.direction === 'asc' ? 'desc' : 'asc'
                };
            }
            // Если кликаем по новому полю, устанавливаем его с направлением по умолчанию
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
                // Сортировка по статусу
                const statusOrder = { 'completed': 1, 'in-progress': 2, 'pending': 3, 'cancelled': 4 };
                comparison = statusOrder[a.status] - statusOrder[b.status];
            }

            // Применяем направление сортировки
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });

        return sortedTasks;
    };

    const renderTaskItem = ({ item }: { item: Task }) => (
        <TouchableOpacity
            style={styles.taskItem}
            onPress={() => router.push(`/task/${item.id}`)}
        >
            <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text style={styles.taskDate}>
                    {new Date(item.executionDate).toLocaleDateString()}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                </View>
            </View>
            <View style={styles.taskActions}>
                <TouchableOpacity onPress={() => deleteTask(item.id)}>
                    <Ionicons name="trash-outline" size={24} color="#ff3b30" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

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

    const getSortIcon = (field: 'date' | 'status') => {
        if (sortConfig.field !== field) return 'swap-vertical';

        return sortConfig.direction === 'asc' ? 'arrow-up' : 'arrow-down';
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Панель сортировки */}
            <View style={styles.sortContainer}>
                <Text style={styles.sortLabel}>Сортировка:</Text>
                <TouchableOpacity
                    style={styles.sortButton}
                    onPress={() => handleSort('date')}
                >
                    <Ionicons
                        name={getSortIcon('date')}
                        size={16}
                        color={sortConfig.field === 'date' ? '#007aff' : '#666'}
                    />
                    <Text style={[
                        styles.sortButtonText,
                        sortConfig.field === 'date' && styles.sortButtonActive
                    ]}>
                        По дате
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.sortButton}
                    onPress={() => handleSort('status')}
                >
                    <Ionicons
                        name={getSortIcon('status')}
                        size={16}
                        color={sortConfig.field === 'status' ? '#007aff' : '#666'}
                    />
                    <Text style={[
                        styles.sortButtonText,
                        sortConfig.field === 'status' && styles.sortButtonActive
                    ]}>
                        По статусу
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Список задач */}
            <FlatList
                data={sortTasks(tasks)}
                renderItem={renderTaskItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>Нет задач</Text>
                        <Text style={styles.emptySubtext}>Добавьте первую задачу</Text>
                    </View>
                }
            />

            {/* Плавающая кнопка добавления */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/add-task')}
            >
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sortLabel: {
        marginRight: 12,
        color: '#666',
        fontSize: 14,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#f8f9fa',
        marginRight: 8,
    },
    sortButtonText: {
        marginLeft: 4,
        color: '#666',
        fontSize: 14,
    },
    sortButtonActive: {
        color: '#007aff',
        fontWeight: '600',
    },
    list: {
        padding: 16,
        paddingBottom: 80, // Отступ для FAB
    },
    taskItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },
    taskDate: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },
    taskActions: {
        flexDirection: 'row',
        gap: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 64,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#007aff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
});