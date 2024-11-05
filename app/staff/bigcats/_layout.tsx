import { Stack } from 'expo-router';

export default function BigCatsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{
          title: 'Big Cats Management',
        }} 
      />
      <Stack.Screen 
        name="details" 
        options={{
          title: 'Big Cat Details',
        }} 
      />
    </Stack>
  );
} 