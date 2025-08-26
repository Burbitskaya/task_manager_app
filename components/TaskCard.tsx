import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';
import { useTheme } from './ThemeContext';
import { getStatusColor, getStatusText } from '../utils/statusUtils';

interface TaskCardProps {
    task: Task;
    isSelectionMode: boolean;
    isSelected: boolean;
    onPress: () => void;
    onLongPress: () => void;
    onDelete: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
                                               task,
                                               isSelectionMode,
                                               isSelected,
                                               onPress,
                                               onLongPress,
                                               onDelete
                                           }) => {
    const { colors } = useTheme();
    const statusColor = getStatusColor(task.status, colors);

    return (
        <TouchableOpacity
            style={[
                styles.taskItem,
                {
                    backgroundColor: colors.cardBackground,
                    shadowColor: colors.shadow,
                    borderColor: isSelected ? colors.primary : statusColor,
                    borderWidth: 2,
                }
            ]}
            onPress={onPress}
            onLongPress={onLongPress}
            delayLongPress={300}
        >
            {/* Status header strip */}
            <View style={[styles.statusHeader, { backgroundColor: statusColor }]}>
                <Text style={styles.statusHeaderText}>{getStatusText(task.status)}</Text>
            </View>

            <View style={styles.taskContent}>
                <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
                    <Text style={[styles.taskDate, { color: colors.textSecondary }]}>
                        {new Date(task.executionDate).toLocaleDateString()}
                    </Text>
                </View>
                <View style={styles.taskActions}>
                    {isSelectionMode ? (
                        <Ionicons
                            name={isSelected ? "checkbox" : "square-outline"}
                            size={24}
                            color={isSelected ? colors.primary : colors.textSecondary}
                        />
                    ) : (
                        <TouchableOpacity onPress={onDelete}>
                            <Ionicons name="trash-outline" size={24} color={colors.danger} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
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
});

export default TaskCard;