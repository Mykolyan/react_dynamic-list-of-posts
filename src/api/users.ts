import { client } from '../utils/fetchClient';
import { User } from '../types/User';

export const getUsers = () => client.get<User[]>('/users');

export const getUserById = (id: number) => client.get<User>(`/users/${id}`);

export const getUsersByUsername = (username: string) =>
  client.get<User[]>(`/users?username=${username}`);

export const createUser = (data: Omit<User, 'id'>) =>
  client.post<User>('/users', data);

export const updateUser = (id: number, data: Partial<Omit<User, 'id'>>) =>
  client.patch<User>(`/users/${id}`, data);

export const deleteUser = (id: number) => client.delete(`/users/${id}`);
