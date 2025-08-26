import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {useLocalSearchParams, useNavigation, useRouter} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Ionicons} from '@expo/vector-icons';
import {Task, TaskStatus} from '../../types';
import {useTheme} from '../../components/ThemeContext';
import {getStatusColor, getStatusText} from '../../utils/statusUtils';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import NotificationModal from '../../components/NotificationModal';
import StatusEditModal from '../../components/StatusEditModal';

const TaskDetailScreen = () => {
    const {id} = useLocalSearchParams();
    const navigation = useNavigation();
    const router = useRouter();
    const {colors} = useTheme();
    const [task, setTask] = useState<Task | null>(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [notificationModalVisible, setNotificationModalVisible] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState<'error' | 'success'>('error');

    // Load task when component mounts or id changes
    useEffect(() => {
        if (id) {
            loadTask();
        }
    }, [id]);

    useEffect(() => {
        if (task) {
            navigation.setOptions({title: task.title});
        }
    }, [task, navigation]);

    const showNotification = (message: string, type: 'error' | 'success') => {
        setNotificationMessage(message);
        setNotificationType(type);
        setNotificationModalVisible(true);
    };


    const loadTask = async (): Promise<void> => {
        try {
            const storedTasks = await AsyncStorage.getItem('tasks');
            if (storedTasks) {
                const tasks: Task[] = JSON.parse(storedTasks);
                const foundTask = tasks.find(t => t.id === id);
                setTask(foundTask || null);
            }
        } catch (error) {
            showNotification('Failed to load task', 'error');
        }
    };


    const updateStatus = async (newStatus: TaskStatus): Promise<void> => {
        if (!task) return;

        try {
            const storedTasks = await AsyncStorage.getItem('tasks');
            const tasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];
            const updatedTasks = tasks.map(t =>
                t.id === task.id ? {...t, status: newStatus} : t
            );
            await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
            setTask({...task, status: newStatus});
        } catch (error) {
            showNotification('Failed to update status', 'error');
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
            showNotification('Task deleted successfully', 'success');

            // Navigate back after successful deletion
            setTimeout(() => {
                router.back();
            }, 1500);
        } catch (error) {
            showNotification('Failed to delete task', 'error');
            setShowDeleteModal(false);
        }
    };


    const handleStatusChange = (newStatus: TaskStatus): void => {
        updateStatus(newStatus);
        setShowStatusModal(false);
    };


    const showDeleteConfirmation = (): void => {
        setShowDeleteModal(true);
    };


    const cancelDelete = (): void => {
        setShowDeleteModal(false);
    };


    if (!task) {
        return (
            <View style={[styles.container, {backgroundColor: colors.background}]}>
                <Text style={{color: colors.text}}>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, {backgroundColor: colors.background}]}>
            <View style={[styles.card, {backgroundColor: colors.cardBackground, shadowColor: colors.shadow}]}>
                <View style={styles.header}>
                    {/* Status button with edit icon */}
                    <TouchableOpacity
                        style={[styles.statusButton, {backgroundColor: getStatusColor(task.status, colors)}]}
                        onPress={() => setShowStatusModal(true)}
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

                    {/* Delete button */}
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={showDeleteConfirmation}
                    >
                        <Ionicons name="trash-outline" size={24} color={colors.danger}/>
                    </TouchableOpacity>
                </View>


                <StatusEditModal
                    visible={showStatusModal}
                    onRequestClose={() => setShowStatusModal(false)}
                    onStatusChange={handleStatusChange}
                    title="Change Status"
                    message="Select new status for this task:"
                />


                <DeleteConfirmationModal
                    visible={showDeleteModal}
                    onRequestClose={cancelDelete}
                    onConfirm={deleteTask}
                    title="Delete Task"
                    message="Are you sure you want to delete this task? This action cannot be undone."
                />


                <NotificationModal
                    visible={notificationModalVisible}
                    onRequestClose={() => setNotificationModalVisible(false)}
                    type={notificationType}
                    title={notificationType === 'success' ? 'Success' : 'Error'}
                    message={notificationMessage}
                />


                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, {color: colors.textSecondary}]}>Description</Text>
                    <Text style={[styles.sectionContent, {color: colors.text}]}>{task.description}</Text>
                </View>


                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, {color: colors.textSecondary}]}>Location</Text>
                    <Text style={[styles.sectionContent, {color: colors.text}]}>{task.location}</Text>
                </View>


                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, {color: colors.textSecondary}]}>Execution Date & Time</Text>
                    <Text style={[styles.sectionContent, {color: colors.text}]}>
                        {new Date(task.executionDate).toLocaleString()}
                    </Text>
                </View>


                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, {color: colors.textSecondary}]}>Created At</Text>
                    <Text style={[styles.sectionContent, {color: colors.text}]}>
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
        shadowOffset: {width: 0, height: 4},
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
});

export default TaskDetailScreen;