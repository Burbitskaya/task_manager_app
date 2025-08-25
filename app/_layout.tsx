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
              headerBackTitle: 'Назад', // Для iOS
            }}
        />
        <Stack.Screen
            name="add-task"
            options={{
              title: 'Добавить задачу',
              presentation: 'modal', // Открывает как модальное окно
            }}
        />
        <Stack.Screen
            name="task"
            options={{
              title: 'Детали задачи',
            }}
        />
      </Stack>
  );
}