import type { AxiosInstance, AxiosResponse } from "axios";
import axios from "axios";

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8006/api/invitations";

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
}

// Generic API error handling
export interface ApiError {
    message: string;
    status?: number;
}

// API response structure for paginated results
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// API response structure for DRF ViewSet actions
export interface ActionResponse<T> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
}

// Helper function for API error handling
export const handleApiError = (error: any): ApiError => {
    if (axios.isAxiosError(error)) {
        return {
            message: error.response?.data?.detail || error.message || 'An error occurred',
            status: error.response?.status,
        };
    }
    return {
        message: error.message || 'An unknown error occurred',
    };
};
