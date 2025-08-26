import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTheme } from './ThemeContext';

interface DeleteConfirmationModalProps {
    visible: boolean;
    onRequestClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    cancelText?: string;
    confirmText?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
                                                                             visible,
                                                                             onRequestClose,
                                                                             onConfirm,
                                                                             title,
                                                                             message,
                                                                             cancelText = 'Cancel',
                                                                             confirmText = 'Delete'
                                                                         }) => {
    const { colors } = useTheme();

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
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: colors.inputBackground }]}
                            onPress={onRequestClose}
                        >
                            <Text style={[styles.modalButtonText, { color: colors.text }]}>{cancelText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: colors.danger }]}
                            onPress={onConfirm}
                        >
                            <Text style={[styles.modalButtonText, { color: 'white' }]}>{confirmText}</Text>
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

export default DeleteConfirmationModal;