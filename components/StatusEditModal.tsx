import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTheme } from './ThemeContext';
import { TaskStatus } from '../types';

interface StatusEditModalProps {
    visible: boolean;
    onRequestClose: () => void;
    onStatusChange: (status: TaskStatus) => void;
    title: string;
    message: string;
    cancelText?: string;
}

const StatusEditModal: React.FC<StatusEditModalProps> = ({
                                                             visible,
                                                             onRequestClose,
                                                             onStatusChange,
                                                             title,
                                                             message,
                                                             cancelText = 'Cancel'
                                                         }) => {
    const { colors } = useTheme();

    const getStatusColor = (status: TaskStatus): string => {
        switch (status) {
            case 'completed': return colors.success;
            case 'in-progress': return colors.info;
            case 'pending': return colors.warning;
            case 'cancelled': return colors.danger;
            default: return colors.info;
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onRequestClose}
        >
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
                <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
                    <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
                        {message}
                    </Text>

                    <View style={styles.statusOptions}>
                        <TouchableOpacity
                            style={[styles.statusOption, { backgroundColor: getStatusColor('in-progress') }]}
                            onPress={() => onStatusChange('in-progress')}
                        >
                            <Text style={styles.statusOptionText}>In Progress</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.statusOption, { backgroundColor: getStatusColor('completed') }]}
                            onPress={() => onStatusChange('completed')}
                        >
                            <Text style={styles.statusOptionText}>Completed</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.statusOption, { backgroundColor: getStatusColor('cancelled') }]}
                            onPress={() => onStatusChange('cancelled')}
                        >
                            <Text style={styles.statusOptionText}>Cancelled</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: colors.inputBackground }]}
                            onPress={onRequestClose}
                        >
                            <Text style={[styles.modalButtonText, { color: colors.text }]}>{cancelText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
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
    statusOptions: {
        marginBottom: 24,
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

export default StatusEditModal;