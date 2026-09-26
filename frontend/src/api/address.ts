import { api } from './axios';
import { Address, AddressInput } from '../types/address';

export const fetchAddresses = async (): Promise<Address[]> => {
 const response = await api.get('/addresses');
 return response.data?.data || [];
};

export const createAddress = async (data: AddressInput): Promise<Address> => {
 const response = await api.post('/addresses', data);
 return response.data?.data;
};

export const updateAddress = async (id: string, data: Partial<AddressInput>): Promise<Address> => {
 const response = await api.put(`/addresses/${id}`, data);
 return response.data?.data;
};

export const deleteAddress = async (id: string): Promise<void> => {
 await api.delete(`/addresses/${id}`);
};

export const setDefaultAddress = async (id: string): Promise<Address> => {
 const response = await api.put(`/addresses/${id}/default`);
 return response.data?.data;
};
