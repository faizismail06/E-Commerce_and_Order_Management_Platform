export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';

export interface User {
 id: string;
 fullName: string;
 email: string;
 phone?: string | null;
 role: Role;
 createdAt: string;
}

export interface AuthResponse {
 success: boolean;
 message: string;
 data: {
 user: User;
 token: string;
 };
}
