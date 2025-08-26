import {Stack} from 'expo-router';
import {ThemeProvider, useTheme} from '../components/ThemeContext';
import {TouchableOpacity} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

function ThemeSwitcher() {
    const {colorScheme, toggleTheme} = useTheme();

    return (
        <TouchableOpacity onPress={toggleTheme} style={{marginRight: 16}}>
            <Ionicons
                name={colorScheme === 'light' ? 'moon' : 'sunny'}
                size={24}
                color="#fff"
            />
        </TouchableOpacity>
    );
}

function RootLayoutContent() {
    const {colors} = useTheme();

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.primary,
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Task Manager',
                    headerBackTitle: 'Back',
                    headerRight: () => <ThemeSwitcher/>,
                }}
            />
            <Stack.Screen
                name="add-task"
                options={{
                    title: 'Add Task',
                    presentation: 'modal',
                    headerRight: () => <ThemeSwitcher/>,
                }}
            />
            <Stack.Screen
                name="task/[id]"
                options={{
                    title: 'Task Details',
                    headerRight: () => <ThemeSwitcher/>,
                }}
            />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <RootLayoutContent/>
        </ThemeProvider>
    );
}