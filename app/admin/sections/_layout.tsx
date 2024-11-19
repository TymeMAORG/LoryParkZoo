import { Stack } from 'expo-router';

export default function SectionsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Section Details',
          headerShown: false,
        }}
      />
    </Stack>
  );
}