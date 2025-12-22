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
    // Use the dedicated scan endpoint
    const response = await api.post(`/guests/scan/${qrCode}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
export const scanGuestQRCode = async (code: string): Promise<ScanResult> => {
  try {
    // On utilise le endpoint /scan/ que vous avez défini dans votre backend
    // Le code doit être passé dans l'URL, pas dans le corps de la requête
    const response = await api.post(`/invitations/guests/scan/${code}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Dans guestService.ts
