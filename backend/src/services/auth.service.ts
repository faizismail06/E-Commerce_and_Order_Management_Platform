import { RoleName } from '@prisma/client';
import { prisma } from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

export class AuthService {
 static async register(input: RegisterInput) {
 const existingUser = await prisma.user.findUnique({
 where: { email: input.email },
 });

 if (existingUser) {
 const error: any = new Error('Email address is already registered');
 error.statusCode = 400;
 error.code = 'EMAIL_ALREADY_EXISTS';
 throw error;
 }

 const customerRole = await prisma.role.findUnique({
 where: { name: RoleName.CUSTOMER },
 });

 if (!customerRole) {
 const error: any = new Error('Customer role not initialized in database');
 error.statusCode = 500;
 throw error;
 }

 const hashedPassword = await hashPassword(input.password);

 const user = await prisma.user.create({
 data: {
 fullName: input.fullName,
 email: input.email,
 password: hashedPassword,
 phone: input.phone || null,
 roleId: customerRole.id,
 cart: {
 create: {},
 },
 },
 include: {
 role: true,
 },
 });

 const token = generateAccessToken({
 userId: user.id,
 email: user.email,
 role: user.role.name,
 });

 return {
 user: {
 id: user.id,
 fullName: user.fullName,
 email: user.email,
 phone: user.phone,
 role: user.role.name,
 createdAt: user.createdAt,
 },
 token,
 };
 }

 static async login(input: LoginInput) {
 const user = await prisma.user.findUnique({
 where: { email: input.email },
 include: { role: true },
 });

 if (!user) {
 const error: any = new Error('Invalid email or password credential');
 error.statusCode = 401;
 error.code = 'INVALID_CREDENTIALS';
 throw error;
 }

 if (!user.isActive) {
 const error: any = new Error('Your account has been deactivated. Please contact support.');
 error.statusCode = 403;
 error.code = 'ACCOUNT_DEACTIVATED';
 throw error;
 }

 const isPasswordValid = await comparePassword(input.password, user.password);
 if (!isPasswordValid) {
 const error: any = new Error('Invalid email or password credential');
 error.statusCode = 401;
 error.code = 'INVALID_CREDENTIALS';
 throw error;
 }

 const token = generateAccessToken({
 userId: user.id,
 email: user.email,
 role: user.role.name,
 });

 return {
 user: {
 id: user.id,
 fullName: user.fullName,
 email: user.email,
 phone: user.phone,
 role: user.role.name,
 createdAt: user.createdAt,
 },
 token,
 };
 }

 static async getProfile(userId: string) {
 const user = await prisma.user.findUnique({
 where: { id: userId },
 include: { role: true },
 });

 if (!user) {
 const error: any = new Error('User account not found');
 error.statusCode = 404;
 error.code = 'USER_NOT_FOUND';
 throw error;
 }

 return {
 id: user.id,
 fullName: user.fullName,
 email: user.email,
 phone: user.phone,
 isActive: user.isActive,
 role: user.role.name,
 createdAt: user.createdAt,
 updatedAt: user.updatedAt,
 };
 }
}
