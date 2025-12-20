import { api, handleApiError } from "../api";
import { Guest, ScanResult } from "@/types/guests";
import { AxiosError } from "axios";

// Get all guests
export const getAllGuests = async (): Promise<Guest[]> => {
  try {
    const response = await api.get("/guests/");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get guest by ID
export const getGuestById = async (id: string): Promise<Guest> => {
  try {
    const response = await api.get(`/guests/${id}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Create a new guest
export const createGuest = async (guestData: Partial<Guest>): Promise<Guest> => {
  try {
    const response = await api.post("/guests/", guestData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update a guest
export const updateGuest = async (id: string, guestData: Partial<Guest>): Promise<Guest> => {
  try {
    const response = await api.patch(`/guests/${id}/`, guestData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Delete a guest
export const deleteGuest = async (id: string): Promise<void> => {
  try {
    await api.delete(`/guests/${id}/`);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get QR code for a guest
export const getGuestQRCode = async (id: string): Promise<Blob> => {
  try {
    const response = await api.get(`/guests/${id}/qr-code/`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Validate QR code scan
export const validateQRCode = async (qrCode: string): Promise<ScanResult> => {
  try {
    // This would typically be a POST to a validation endpoint
    // Since the backend doesn't seem to have a dedicated endpoint for this,
    // we'll simulate the validation by checking if the guest exists
    const response = await api.get(`/guests/?qr_code=${qrCode}`);
    
    if (response.data.length > 0) {
      const guest = response.data[0];
      
      // If guest is already scanned, return error
      if (guest.scanned) {
        return {
          status: "error",
          message: "Déjà scanné"
        };
      }
      
      // Mark guest as scanned
      await updateGuest(guest.id, { scanned: true, scanned_at: new Date().toISOString() });
      
      return {
        status: "success",
        affichage_ecran: {
          name: guest.name,
          table: guest.table_id ? `Table ${guest.table_id}` : "Non assignée",
          table_category: guest.statut_guest,
          status: guest.status,
          statut_guest: guest.statut_guest,
          wedding_text: guest.wedding_text
        }
      };
    } else {
      return {
        status: "error",
        message: "Invité non trouvé"
      };
    }
  } catch (error) {
    throw handleApiError(error);
  }
};
export const scanGuestQRCode = async (code: string): Promise<ScanResult> => {
  try {
    // On utilise le endpoint /scan/ que vous avez défini dans votre backend
    const response = await api.post("/invitations/guests/scan/", { qr_code: code });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};