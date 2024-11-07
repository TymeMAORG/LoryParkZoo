// __tests__/Login.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Login, { useUserStore } from '../../app/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { router } from 'expo-router';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

describe('Login Component', () => {
  beforeEach(() => {
    AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('displays an error if fields are empty', () => {
    const { getByText } = render(<Login />);
    const loginButton = getByText('Login');
    jest.spyOn(Alert, 'alert');

    fireEvent.press(loginButton);

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all fields');
  });

  it('displays an error if user is not found', () => {
    const { getByPlaceholderText, getByText } = render(<Login />);
    const usernameInput = getByPlaceholderText('Enter your username');
    const sectionInput = getByPlaceholderText('Enter your section code');
    const loginButton = getByText('Login');
    jest.spyOn(Alert, 'alert');

    fireEvent.changeText(usernameInput, 'nonexistentuser');
    fireEvent.changeText(sectionInput, 'all');
    fireEvent.press(loginButton);

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'User not found');
  });

  it('displays an error if section code is invalid for the user', () => {
    const { getByPlaceholderText, getByText } = render(<Login />);
    const usernameInput = getByPlaceholderText('Enter your username');
    const sectionInput = getByPlaceholderText('Enter your section code');
    const loginButton = getByText('Login');
    jest.spyOn(Alert, 'alert');

    fireEvent.changeText(usernameInput, 'robynn');
    fireEvent.changeText(sectionInput, 'birds');
    fireEvent.press(loginButton);

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid section for this user');
  });

  it('logs in and navigates to admin screen for admin user', async () => {
    const { getByPlaceholderText, getByText } = render(<Login />);
    const usernameInput = getByPlaceholderText('Enter your username');
    const sectionInput = getByPlaceholderText('Enter your section code');
    const loginButton = getByText('Login');

    fireEvent.changeText(usernameInput, 'admin');
    fireEvent.changeText(sectionInput, 'all');
    fireEvent.press(loginButton);

    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'user',
      JSON.stringify({ username: 'admin', section: 'all', isAdmin: true })
    ));

    expect(useUserStore.getState().username).toBe('admin');
    expect(useUserStore.getState().isAdmin).toBe(true);
    expect(router.replace).toHaveBeenCalledWith('/admin/');
  });

  it('logs in and navigates to staff screen for non-admin user', async () => {
    const { getByPlaceholderText, getByText } = render(<Login />);
    const usernameInput = getByPlaceholderText('Enter your username');
    const sectionInput = getByPlaceholderText('Enter your section code');
    const loginButton = getByText('Login');

    fireEvent.changeText(usernameInput, 'kyle');
    fireEvent.changeText(sectionInput, 'bigcats');
    fireEvent.press(loginButton);

    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'user',
      JSON.stringify({ username: 'kyle', section: 'bigcats', isAdmin: false })
    ));

    expect(useUserStore.getState().username).toBe('kyle');
    expect(useUserStore.getState().isAdmin).toBe(false);
    expect(router.replace).toHaveBeenCalledWith('/staff/bigcats');
  });

  it('displays an error if AsyncStorage fails', async () => {
    const { getByPlaceholderText, getByText } = render(<Login />);
    const usernameInput = getByPlaceholderText('Enter your username');
    const sectionInput = getByPlaceholderText('Enter your section code');
    const loginButton = getByText('Login');
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('AsyncStorage error'));
    jest.spyOn(Alert, 'alert');

    fireEvent.changeText(usernameInput, 'admin');
    fireEvent.changeText(sectionInput, 'all');
    fireEvent.press(loginButton);

    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to log in'));
  });
});
