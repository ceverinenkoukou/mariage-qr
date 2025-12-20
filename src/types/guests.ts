

export interface Guest {
    id: string;
    name: string;
    wedding_text: string;
    status: 'VIP' | 'STAND' | 'FAM' | 'AMI' | 'AUTRE';
    statut_guest: 'COUPLE' | 'SINGLE' | 'FAMILY';
    table: string | null;
    scanned: boolean;
    created_at: string;
    scanned_at: string | null;
    qr_code: string;
    qr_code_image: string | null;
}

export interface GuestFormData {
    name: string;
    last_name: string;
    table_id: string;
    status: Guest['status'];
    statut_guest: Guest['statut_guest'];
    wedding_text: string;
}

export interface ScanResult {
    status: 'success' | 'error';
    message?: string;
    invitation_complete?: string;

    already_scanned?: boolean;
    affichage_ecran?: {
        nom: string;
        table: string;
        table_category: string;
        status: string;
        statut_guest: string;
        wedding_text: string;
    };
    places_restantes?: number;
}

export interface ScanLog {
    id: string;
    guest: string; // Foreign key to Guest
    scanned_at: string;
    ip_address: string | null;
    success: boolean;
}
