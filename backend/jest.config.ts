import type { Config } from 'jest';

const config: Config = {
 preset: 'ts-jest',
 testEnvironment: 'node',
 roots: ['<rootDir>/tests'],
 moduleFileExtensions: ['ts', 'js', 'json'],
 transform: {
 '^.+\\.ts$': 'ts-jest',
 },
 verbose: true,
};

export default config;
