import { api, handleApiError } from "../api";
import { Table } from "@/types/tables"; // Utiliser le bon type

export const tableweddingService = {
    getAllTables: async (): Promise<Table[]> => {
        try {
            const response = await api.get("/tables/");
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
    
    createTable: async (tableData: Partial<Table>): Promise<Table> => {
        try {
            const response = await api.post("/tables/", tableData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
    
    updateTable: async (id: string, tableData: Partial<Table>): Promise<Table> => {
        try {
            const response = await api.patch(`/tables/${id}/`, tableData);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
    
    deleteTable: async (id: string): Promise<void> => {
        try {
            await api.delete(`/tables/${id}/`);
        } catch (error) {
            throw handleApiError(error);
        }
    },
    getTableOccupancy: async (id: string): Promise<{ isFull: boolean }> => {
        try {
            const response = await api.get(`/tables/${id}/`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
};