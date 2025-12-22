import { api, handleApiError } from "../api";
import { ScanLog, ScanResult } from "@/types/guests";

// Get all scan logs
export const getAllScanLogs = async (): Promise<ScanLog[]> => {
  try {
    const response = await api.get("/scanlogs/");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get scan log by ID
export const getScanLogById = async (id: string): Promise<ScanLog> => {
  try {
    const response = await api.get(`/scanlogs/${id}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Create a new scan log
export const createScanLog = async (scanData: Partial<ScanLog>): Promise<ScanLog> => {
  try {
    const response = await api.post("/scanlogs/", scanData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Validate QR code and create scan log
export const validateAndLogScan = async (qrCode: string, ipAddress?: string): Promise<ScanResult> => {
  try {
    // Use the dedicated scan endpoint which handles everything
    const response = await api.post(`/guests/scan/${qrCode}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};