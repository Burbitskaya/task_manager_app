import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#007aff',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Менеджер задач',
                    headerBackTitle: 'Назад',
                }}
            />
            <Stack.Screen
                name="add-task"
                options={{
                    title: 'Добавить задачу',
                    presentation: 'modal',
                }}
            />
            <Stack.Screen
                name="task/[id]"
                options={{
                    title: 'Детали задачи', // Это будет переопределено в компоненте
                }}
            />
        </Stack>
    );
}