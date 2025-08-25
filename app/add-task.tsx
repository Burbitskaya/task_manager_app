import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';
import moment from 'moment';
import { useTheme } from '../components/ThemeContext';

export default function AddTaskScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [executionDate, setExecutionDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState<'error' | 'success'>('error');

    // Format date for display
    const formatDateTime = (date: Date): string => {
        return moment(date).format('MMMM D, YYYY, h:mm A');
    };

    // Show date/time picker with specified mode
    const showDatePickerModal = (mode: 'date' | 'time') => {
        setPickerMode(mode);
        setShowDatePicker(true);
    };

    // Show custom modal
    const showModal = (message: string, type: 'error' | 'success') => {
        setModalMessage(message);
        setModalType(type);
        setModalVisible(true);
    };

    // Validate form inputs
    const validateForm = (): boolean => {
        if (!title.trim()) {
            showModal('Please enter a task title', 'error');
            return false;
        }
        if (!description.trim()) {
            showModal('Please enter a task description', 'error');
            return false;
        }
        if (!location.trim()) {
            showModal('Please enter a location', 'error');
            return false;
        }
        if (executionDate < new Date()) {
            showModal('Execution date cannot be in the past', 'error');
            return false;
        }
        return true;
    };

    // Save task to AsyncStorage
    const handleSaveTask = async (): Promise<void> => {
        if (!validateForm()) return;

        try {
            const newTask: Task = {
                id: Date.now().toString(),
                title: title.trim(),
                description: description.trim(),
                location: location.trim(),
                executionDate: executionDate.toISOString(),
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            const storedTasks = await AsyncStorage.getItem('tasks');
            const tasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];
            tasks.push(newTask);

            await AsyncStorage.setItem('tasks', JSON.stringify(tasks));

            showModal('Task added successfully', 'success');

            // Navigate back only on success
            setTimeout(() => {
                router.back();
            }, 1500);
        } catch (error) {
            showModal('Failed to save task', 'error');
        }
    };

    // Handle date/time picker change
    const onDateChange = (event: any, selectedDate?: Date): void => {
        setShowDatePicker(false);
        if (selectedDate) {
            if (pickerMode === 'date') {
                // Keep time from previous date, only change date
                const newDate = new Date(selectedDate);
                newDate.setHours(executionDate.getHours());
                newDate.setMinutes(executionDate.getMinutes());
                setExecutionDate(newDate);
            } else {
                // Keep date from previous date, only change time
                const newDate = new Date(executionDate);
                newDate.setHours(selectedDate.getHours());
                newDate.setMinutes(selectedDate.getMinutes());
                setExecutionDate(newDate);
            }
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Task Title *</Text>
                    <TextInput
                        style={[styles.input, {
                            backgroundColor: colors.inputBackground,
                            color: colors.text,
                            borderColor: colors.border
                        }]}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Enter task title"
                        placeholderTextColor={colors.textSecondary}
                        maxLength={100}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea, {
                            backgroundColor: colors.inputBackground,
                            color: colors.text,
                            borderColor: colors.border
                        }]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Describe the task in detail"
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={4}
                        maxLength={500}
                        textAlignVertical="top"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Location *</Text>
                    <TextInput
                        style={[styles.input, {
                            backgroundColor: colors.inputBackground,
                            color: colors.text,
                            borderColor: colors.border
                        }]}
                        value={location}
                        onChangeText={setLocation}
                        placeholder="Enter address or location"
                        placeholderTextColor={colors.textSecondary}
                        maxLength={200}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Execution Date & Time *</Text>

                    <View style={styles.dateTimeContainer}>
                        <TouchableOpacity
                            style={[styles.dateTimeButton, {
                                backgroundColor: colors.inputBackground,
                                borderColor: colors.border
                            }]}
                            onPress={() => showDatePickerModal('date')}
                        >
                            <Ionicons name="calendar" size={20} color={colors.primary} />
                            <Text style={[styles.dateTimeText, { color: colors.text }]}>
                                {moment(executionDate).format('MMMM D, YYYY')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.dateTimeButton, {
                                backgroundColor: colors.inputBackground,
                                borderColor: colors.border
                            }]}
                            onPress={() => showDatePickerModal('time')}
                        >
                            <Ionicons name="time" size={20} color={colors.primary} />
                            <Text style={[styles.dateTimeText, { color: colors.text }]}>
                                {moment(executionDate).format('h:mm A')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={executionDate}
                        mode={pickerMode}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onDateChange}
                        minimumDate={new Date()}
                        locale="en-US"
                    />
                )}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.cancelButton, { backgroundColor: colors.danger }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            { backgroundColor: colors.primary },
                            (!title || !description || !location) && { backgroundColor: colors.textSecondary }
                        ]}
                        onPress={handleSaveTask}
                        disabled={!title || !description || !location}
                    >
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Custom Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                        <Ionicons
                            name={modalType === 'success' ? 'checkmark-circle' : 'alert-circle'}
                            size={48}
                            color={modalType === 'success' ? colors.success : colors.danger}
                            style={styles.modalIcon}
                        />
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            {modalType === 'success' ? 'Success' : 'Error'}
                        </Text>
                        <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
                            {modalMessage}
                        </Text>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: modalType === 'success' ? colors.success : colors.danger }]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 16,
    },
    textArea: {
        minHeight: 130,
        textAlignVertical: 'top',
    },
    dateTimeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 8,
    },
    dateTimeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    dateTimeText: {
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalContent: {
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    modalIcon: {
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    modalMessage: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    modalButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});