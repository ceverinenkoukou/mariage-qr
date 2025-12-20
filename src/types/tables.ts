export interface Table {
    id: string;
    name: string; // Correspond au champ Django
    description: string | null;
    capacity: number;
    category: string;
    occupancy: number;
    created_at: string;
}

// On peut garder WeddingTable pour des besoins d'affichage spécifique si besoin
export interface WeddingTable extends Table {}
