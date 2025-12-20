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
    // In a real implementation, this would be a dedicated endpoint
    // For now, we'll simulate the backend service logic
    
    // First, try to find the guest by QR code
    const guestsResponse = await api.get(`/guests/?qr_code=${qrCode}`);
    const guests = guestsResponse.data;
    
    if (guests.length === 0) {
      // Log the failed scan
      await createScanLog({
        guest: "", // No guest found
        ip_address: ipAddress || null,
        success: false
      });
      
      return {
        status: "error",
        message: "Invité non trouvé"
      };
    }
    
    const guest = guests[0];
    
    // Check if already scanned
    if (guest.scanned) {
      // Log the failed scan
      await createScanLog({
        guest: guest.id,
        ip_address: ipAddress || null,
        success: false
      });
      
      return {
        status: "error",
        message: "Déjà scanné"
      };
    }
    
    // Mark guest as scanned
    await api.patch(`/guests/${guest.id}/`, {
      scanned: true,
      scanned_at: new Date().toISOString()
    });
    
    // Log the successful scan
    await createScanLog({
      guest: guest.id,
      ip_address: ipAddress || null,
      success: true
    });
    
    return {
      status: "success",
      affichage_ecran: {
        nom: guest.name,
        table: guest.table_id ? `Table ${guest.table_id}` : "Non assignée",
        status: guest.status,
        statut_guest: guest.statut_guest,
        wedding_text: guest.wedding_text
      }
    };
  } catch (error) {
    throw handleApiError(error);
  }
};