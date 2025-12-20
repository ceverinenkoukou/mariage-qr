import { useState, useCallback } from 'react';
import { tableweddingService } from '@/lib/services/tableService';
import { Table } from '@/types/tables';

export const useTableHook = () => {
    const [tables, setTables] = useState<Table[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchTables = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedTables = await tableweddingService.getAllTables();
            setTables(fetchedTables);
        } catch (error) {
            console.error('Error fetching tables:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addTable = async (tableData: Partial<Table>) => {
        const newTable = await tableweddingService.createTable(tableData);
        setTables((prev) => [...prev, newTable]);
        return newTable;
    };

    const updateTable = async (id: string, tableData: Partial<Table>) => {
        const updated = await tableweddingService.updateTable(id, tableData);
        setTables((prev) => prev.map(t => t.id === id ? updated : t));
        return updated;
    };

    const deleteTable = async (id: string) => {
        await tableweddingService.deleteTable(id);
        setTables((prev) => prev.filter(t => t.id !== id));
    };

    return { tables, fetchTables, addTable, updateTable, deleteTable, isLoading };
};