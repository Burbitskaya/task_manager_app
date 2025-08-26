import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from './ThemeContext';

interface NotificationModalProps {
    visible: boolean;
    onRequestClose: () => void;
    type: 'error' | 'success';
    title: string;
    message: string;
    buttonText?: string;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
                                                                 visible,
                                                                 onRequestClose,
                                                                 type,
                                                                 title,
                                                                 message,
                                                                 buttonText = 'OK'
                                                             }) => {
    const {colors} = useTheme();

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onRequestClose}
        >
            <View style={[styles.modalOverlay, {backgroundColor: 'rgba(0, 0, 0, 0.5)'}]}>
                <View style={[styles.modalContent, {backgroundColor: colors.cardBackground}]}>
                    <Ionicons
                        name={type === 'success' ? 'checkmark-circle' : 'alert-circle'}
                        size={48}
                        color={type === 'success' ? colors.success : colors.danger}
                        style={styles.modalIcon}
                    />
                    <Text style={[styles.modalTitle, {color: colors.text}]}>
                        {title}
                    </Text>
                    <Text style={[styles.modalMessage, {color: colors.textSecondary}]}>
                        {message}
                    </Text>
                    <TouchableOpacity
                        style={[styles.modalButton, {backgroundColor: type === 'success' ? colors.success : colors.danger}]}
                        onPress={onRequestClose}
                    >
                        <Text style={styles.modalButtonText}>{buttonText}</Text>
                    </TouchableOpacity>
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

export default NotificationModal;