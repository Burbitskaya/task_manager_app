import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';
import moment from 'moment';
import 'moment/locale/ru'; // Импортируем русскую локализацию

// Устанавливаем русскую локаль для moment.js
moment.locale('ru');

export default function AddTaskScreen() {
    const router = useRouter();
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [executionDate, setExecutionDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

    const formatDateTime = (date: Date): string => {
        return moment(date).format('D MMMM YYYY, HH:mm');
    };

    const showDatePickerModal = (mode: 'date' | 'time') => {
        setPickerMode(mode);
        setShowDatePicker(true);
    };

    const validateForm = (): boolean => {
        if (!title.trim()) {
            Alert.alert('Ошибка', 'Введите название задачи');
            return false;
        }
        if (!description.trim()) {
            Alert.alert('Ошибка', 'Введите описание задачи');
            return false;
        }
        if (!location.trim()) {
            Alert.alert('Ошибка', 'Введите местоположение');
            return false;
        }
        if (executionDate < new Date()) {
            Alert.alert('Ошибка', 'Дата выполнения не может быть в прошлом');
            return false;
        }
        return true;
    };

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

            router.back();
            Alert.alert('Успех', 'Задача успешно добавлена');
        } catch (error) {
            Alert.alert('Ошибка', 'Не удалось сохранить задачу');
        }
    };

    const onDateChange = (event: any, selectedDate?: Date): void => {
        setShowDatePicker(false);

        if (selectedDate) {
            if (pickerMode === 'date') {
                // Сохраняем время от предыдущей даты, меняем только дату
                const newDate = new Date(selectedDate);
                newDate.setHours(executionDate.getHours());
                newDate.setMinutes(executionDate.getMinutes());
                setExecutionDate(newDate);
            } else {
                // Сохраняем дату от предыдущей даты, меняем только время
                const newDate = new Date(executionDate);
                newDate.setHours(selectedDate.getHours());
                newDate.setMinutes(selectedDate.getMinutes());
                setExecutionDate(newDate);
            }
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Название задачи *</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Введите название задачи"
                        placeholderTextColor="#999"
                        maxLength={100}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Описание *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Опишите задачу подробнее"
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={4}
                        maxLength={500}
                        textAlignVertical="top"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Местоположение *</Text>
                    <TextInput
                        style={styles.input}
                        value={location}
                        onChangeText={setLocation}
                        placeholder="Введите адрес или местоположение"
                        placeholderTextColor="#999"
                        maxLength={200}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Дата и время выполнения *</Text>

                    <View style={styles.dateTimeContainer}>
                        <TouchableOpacity
                            style={styles.dateTimeButton}
                            onPress={() => showDatePickerModal('date')}
                        >
                            <Ionicons name="calendar" size={20} color="#007aff" />
                            <Text style={styles.dateTimeText}>
                                {moment(executionDate).format('D MMMM YYYY')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.dateTimeButton}
                            onPress={() => showDatePickerModal('time')}
                        >
                            <Ionicons name="time" size={20} color="#007aff" />
                            <Text style={styles.dateTimeText}>
                                {moment(executionDate).format('HH:mm')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.selectedDateTime}>
                        Выбрано: {formatDateTime(executionDate)}
                    </Text>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={executionDate}
                        mode={pickerMode}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onDateChange}
                        minimumDate={new Date()}
                        locale="ru-RU"
                    />
                )}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.cancelButtonText}>Отмена</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.saveButton, (!title || !description || !location) && styles.saveButtonDisabled]}
                        onPress={handleSaveTask}
                        disabled={!title || !description || !location}
                    >
                        <Text style={styles.saveButtonText}>Сохранить</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
        color: '#333',
    },
    input: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
        color: '#333',
    },
    textArea: {
        minHeight: 120,
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
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        gap: 8,
    },
    dateTimeText: {
        fontSize: 16,
        color: '#333',
    },
    selectedDateTime: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
        marginTop: 32,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#ff3b30',
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
        backgroundColor: '#007aff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#ccc',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});