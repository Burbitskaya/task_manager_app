import React, { createContext, useContext, useEffect, useState } from 'react';
import {useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ColorScheme, ThemeColors } from '../types';

const theme: Theme = {
    light: {
        background: '#f8f9fa',
        cardBackground: '#ffffff',
        text: '#2d3748',
        textSecondary: '#718096',
        primary: '#667eea',
        danger: '#e53e3e',
        success: '#48bb78',
        warning: '#ed8936',
        info: '#4299e1',
        border: '#e2e8f0',
        shadow: '#000000',
        inputBackground: '#ffffff',
    },
    dark: {
        background: '#1a202c',
        cardBackground: '#2d3748',
        text: '#e2e8f0',
        textSecondary: '#a0aec0',
        primary: '#7c73e6',
        danger: '#fc8181',
        success: '#68d391',
        warning: '#f6ad55',
        info: '#63b3ed',
        border: '#4a5568',
        shadow: '#000000',
        inputBackground: '#2d3748',
    },
};

interface ThemeContextType {
    colors: ThemeColors;
    colorScheme: ColorScheme;
    toggleTheme: () => void;
    setTheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    colors: theme.light,
    colorScheme: 'light',
    toggleTheme: () => {},
    setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [colorScheme, setColorScheme] = useState<ColorScheme>(systemColorScheme || 'light');

    // Load saved theme preference
    useEffect(() => {
        const loadThemePreference = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('themePreference');
                if (savedTheme === 'light' || savedTheme === 'dark') {
                    setColorScheme(savedTheme);
                }
            } catch (error) {
                console.error('Error loading theme preference:', error);
            }
        };

        loadThemePreference();
    }, []);

    // Save theme preference
    const saveThemePreference = async (scheme: ColorScheme) => {
        try {
            await AsyncStorage.setItem('themePreference', scheme);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    const toggleTheme = () => {
        const newScheme = colorScheme === 'light' ? 'dark' : 'light';
        setColorScheme(newScheme);
        saveThemePreference(newScheme);
    };

    const setTheme = (scheme: ColorScheme) => {
        setColorScheme(scheme);
        saveThemePreference(scheme);
    };

    const colors = colorScheme === 'light' ? theme.light : theme.dark;

    return (
        <ThemeContext.Provider value={{ colors, colorScheme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};