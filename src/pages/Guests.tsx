import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Edit, QrCode, Users, Info, AlertTriangle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { getAllGuests, createGuest, updateGuest, deleteGuest } from "@/lib/services/guestService";
import { tableweddingService } from "@/lib/services/tableService";
import { Guest } from "@/types/guests";

const Guests = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrGuest, setQrGuest] = useState<Guest | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Debugging: log qrGuest changes
  useEffect(() => {
    if (qrGuest) {
      console.log("QR Guest data:", qrGuest);
    }
  }, [qrGuest]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 1. Récupération des invités et des tables (créées manuellement)
  const { data: guests = [] } = useQuery({ queryKey: ["guests"], queryFn: getAllGuests });
  const { data: tables = [] } = useQuery({ queryKey: ["tables"], queryFn: tableweddingService.getAllTables });

  // Filtrer les invités en fonction de la recherche
  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim()) return guests;
    
    const query = searchQuery.toLowerCase().trim();
    return guests.filter(guest => 
      guest.name.toLowerCase().includes(query) ||
      getTableName(guest.table)?.toLowerCase().includes(query) ||
      getTableCategory(guest.table)?.toLowerCase().includes(query)
    );
  }, [guests, searchQuery, tables]);

  // 2. Logique de calcul du remplissage
  const getTableOccupancy = (tableId: string) => {
    return guests.filter(g => g.table === tableId).length;
  };
  
  const getTableName = (tableId: any) => {
  const table = tables.find((t: any) => String(t.id) === String(tableId));
  return table ? table.name : "N/A";
};
  
  const getTableCategory = (tableId: string | null) => {
    if (!tableId) return null;
    const table = tables.find(t => t.id === tableId);
    return table ? table.category : null;
  }

  // Mutation pour créer/modifier un invité
  const mutation = useMutation({
    mutationFn: (data: any) => selectedGuest ? updateGuest(selectedGuest.id, data) : createGuest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      setIsDialogOpen(false);
      setSelectedGuest(null);
      toast({ title: "Enregistrement réussi" });
    },
  });

  // Mutation pour supprimer un invité
  const deleteMutation = useMutation({
    mutationFn: (guestId: string) => deleteGuest(guestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      setShowDeleteDialog(false);
      setGuestToDelete(null);
      toast({ 
        title: "Invité supprimé", 
        description: "L'invité et son QR code ont été supprimés avec succès." 
      });
    },
    onError: (error) => {
      toast({ 
        variant: "destructive",
        title: "Erreur de suppression", 
        description: "Impossible de supprimer l'invité. Veuillez réessayer." 
      });
      console.error("Delete error:", error);
    }
  });

  // Mutation pour suppression en masse
  const bulkDeleteMutation = useMutation({
    mutationFn: async (guestIds: string[]) => {
      // Supprimer tous les invités sélectionnés en parallèle
      await Promise.all(guestIds.map(id => deleteGuest(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      setShowBulkDeleteDialog(false);
      setSelectedGuestIds([]);
      setIsSelectionMode(false);
      toast({ 
        title: "Invités supprimés", 
        description: `${selectedGuestIds.length} invité(s) et leurs QR codes ont été supprimés.` 
      });
    },
    onError: (error) => {
      toast({ 
        variant: "destructive",
        title: "Erreur de suppression", 
        description: "Impossible de supprimer certains invités. Veuillez réessayer." 
      });
      console.error("Bulk delete error:", error);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tableId = formData.get("table") as string;
    
    // Vérification de sécurité : pas plus de 10 personnes
    const count = getTableOccupancy(tableId);
    const isFull = count >= 10;
    if (!selectedGuest && isFull) {
        toast({ 
            variant: "destructive", 
            title: "Table saturée", 
            description: "Cette table a déjà atteint sa limite de 10 personnes." 
        });
        return;
    }

    mutation.mutate({
      name: formData.get("name"),
      table: tableId,
      status: formData.get("status"),
      statut_guest: formData.get("statut_guest"),
      wedding_text: formData.get("wedding_text"),
    });
  };

  // Gestion de la sélection
  const handleSelectGuest = (guestId: string) => {
    setSelectedGuestIds(prev => 
      prev.includes(guestId) 
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    );
  };

  const handleSelectAll = () => {
    if (selectedGuestIds.length === filteredGuests.length) {
      setSelectedGuestIds([]);
    } else {
      setSelectedGuestIds(filteredGuests.map(g => g.id));
    }
  };

  const handleDeleteSingle = (guest: Guest) => {
    setGuestToDelete(guest);
    setShowDeleteDialog(true);
  };

  const confirmDeleteSingle = () => {
    if (guestToDelete) {
      deleteMutation.mutate(guestToDelete.id);
    }
  };

  const handleBulkDelete = () => {
    if (selectedGuestIds.length > 0) {
      setShowBulkDeleteDialog(true);
    }
  };

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedGuestIds);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* EN-TÊTE AVEC RÉCAPITULATIF */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                  <Link to="/"><ArrowLeft className="h-4 w-4"/></Link>
                </Button>
                <h1 className="text-2xl font-bold text-slate-900 font-serif">Liste des Invités</h1>
               <h1 className="text-2xl font-bold text-slate-900 font-serif">Liste des Invités</h1>
            </div>
            <p className="text-sm text-slate-500 ml-10">
                {filteredGuests.length} invité{filteredGuests.length > 1 ? 's' : ''} affiché{filteredGuests.length > 1 ? 's' : ''} sur {guests.length} au total
                {searchQuery && ` pour "${searchQuery}"`}
            </p>
          </div>
          
          <div className="flex gap-2">
            {!isSelectionMode ? (
              <>
                <Button 
                  onClick={() => setIsSelectionMode(true)} 
                  variant="outline"
                  className="border-slate-300"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Sélectionner
                </Button>
                <Button 
                  onClick={() => { setSelectedGuest(null); setIsDialogOpen(true); }} 
                  className="bg-primary shadow-lg"
                >
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un invité
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={handleSelectAll} 
                  variant="outline"
                  className="border-slate-300"
                >
                  {selectedGuestIds.length === filteredGuests.length ? "Tout désélectionner" : "Tout sélectionner"}
                </Button>
                <Button 
                  onClick={handleBulkDelete} 
                  variant="destructive"
                  disabled={selectedGuestIds.length === 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> 
                  Supprimer ({selectedGuestIds.length})
                </Button>
                <Button 
                  onClick={() => {
                    setIsSelectionMode(false);
                    setSelectedGuestIds([]);
                  }} 
                  variant="ghost"
                >
                  Annuler
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="max-w-md mx-auto w-full">
          <div className="relative">
            <Input
              type="text"
              placeholder="Rechercher par nom, table ou catégorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* LISTE DES INVITÉS SOUS FORME DE GRILLE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGuests.map((guest) => (
            <Card 
              key={guest.id} 
              className={`border-none shadow-sm hover:shadow-md transition-all ${
                selectedGuestIds.includes(guest.id) ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              
            >
              <CardContent className="p-5">
                {isSelectionMode && (
                  <div className="flex items-center mb-3">
                    <Checkbox 
                      checked={selectedGuestIds.includes(guest.id)}
                      onCheckedChange={() => handleSelectGuest(guest.id)}
                      id={`select-${guest.id}`}
                    />
                    <label 
                      htmlFor={`select-${guest.id}`} 
                      className="ml-2 text-sm text-slate-600 cursor-pointer"
                    >
                      Sélectionner
                    </label>
                  </div>
                )}
                
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800">{guest.name}</h3>
                    <div className="flex gap-2">
                        <Badge variant="secondary" className="text-[10px] uppercase">
                          {getTableName(guest.table) || "Pas de table"}
                        </Badge>
                        <Badge className="bg-slate-100 text-slate-600 border-none text-[10px] uppercase">
                          {getTableCategory(guest.table) || guest.status}
                        </Badge>
                    </div>
                  </div>
                  {guest.scanned && <Badge className="bg-emerald-500">Présent</Badge>}
                </div>
                
                {!isSelectionMode && (
                  <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-50">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1" 
                      onClick={() => { setQrGuest(guest); setShowQRDialog(true); }}
                    >
                      <QrCode className="h-4 w-4 mr-2" /> QR
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1" 
                      onClick={() => { setSelectedGuest(guest); setIsDialogOpen(true); }}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Éditer
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteSingle(guest)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Message quand aucun résultat */}
        {searchQuery && filteredGuests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun invité trouvé pour "<span className="font-semibold">{searchQuery}</span>"</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSearchQuery('')}
            >
              Réinitialiser la recherche
            </Button>
          </div>
        )
        }

        {/* DIALOG FORMULAIRE */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedGuest ? "Modifier l'invité" : "Nouvel Invité"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nom complet</Label>
                <Input name="name" defaultValue={selectedGuest?.name} required placeholder="Ex: Mme Gaëlle Minko" />
              </div>

              <div className="space-y-2">
                <Label>Attribuer une table (Max 10 pers.)</Label>
                <Select name="table" defaultValue={selectedGuest?.table || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une table" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((t) => {
                      const count = getTableOccupancy(t.id);
                      const isFull = count >= 10;
                      return (
                        <SelectItem key={t.id} value={t.id} disabled={isFull && (selectedGuest?.table !== t.id)}>
                          {t.name} ({count}/10 places) - {t.category}
                        </SelectItem>
                      );
                    })}
                    {tables.length === 0 && <SelectItem value="none" disabled>Aucune table créée dans "Gestion Tables"</SelectItem>}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Info className="h-3 w-3" /> Seules les tables créées manuellement apparaissent ici.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type d'accès</Label>
                  <Select name="status" defaultValue={selectedGuest?.status || "STAND"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIP">💎 VIP</SelectItem>
                      <SelectItem value="STAND">🍷 Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Accompagnement</Label>
                  <Select name="statut_guest" defaultValue={selectedGuest?.statut_guest || "SINGLE"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COUPLE">👫 Couple</SelectItem>
                      <SelectItem value="FAMILLE">👨‍👩‍👧‍👦 Famille</SelectItem>
                      <SelectItem value="SINGLE">👤 Seul(e)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Texte personnalisé (facultatif)</Label>
                <Textarea name="wedding_text" defaultValue={selectedGuest?.wedding_text} placeholder="Un message spécial pour cet invité..." className="h-20" />
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? "Traitement..." : "Enregistrer l'invité"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG QR CODE */}
        <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
          <DialogContent className="max-w-xs">
            <DialogHeader>
              <DialogTitle className="text-center">{qrGuest?.name}</DialogTitle>
            </DialogHeader>
            {qrGuest && (
              <QRCodeDisplay 
                    value={`${window.location.origin}/invitation/${qrGuest.qr_code}`} 
                    guestName={qrGuest.name}
                    tableName={getTableName(qrGuest.table) || ""}
                                        
                  />
            )}
            {/* {qrGuest && (
              <div className="text-center mt-4">
                <p className="text-sm text-slate-400">Scan ce QR code pour rejoindre l'invité</p>
              </div>
            )} */}
          </DialogContent>
        </Dialog>

        {/* DIALOG CONFIRMATION SUPPRESSION UNIQUE */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Confirmer la suppression
              </DialogTitle>
              <DialogDescription className="pt-4">
                Êtes-vous sûr de vouloir supprimer <strong>{guestToDelete?.name}</strong> ?
                <br /><br />
                <span className="text-red-600 font-medium">
                  Cette action est irréversible et supprimera également le QR code associé.
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleteMutation.isPending}
              >
                Annuler
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDeleteSingle}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOG CONFIRMATION SUPPRESSION EN MASSE */}
        <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Confirmer la suppression en masse
              </DialogTitle>
              <DialogDescription className="pt-4">
                Êtes-vous sûr de vouloir supprimer <strong>{selectedGuestIds.length} invité(s)</strong> ?
                <br /><br />
                <span className="text-red-600 font-medium">
                  Cette action est irréversible et supprimera également tous les QR codes associés.
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setShowBulkDeleteDialog(false)}
                disabled={bulkDeleteMutation.isPending}
              >
                Annuler
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmBulkDelete}
                disabled={bulkDeleteMutation.isPending}
              >
                {bulkDeleteMutation.isPending ? "Suppression..." : `Supprimer ${selectedGuestIds.length} invité(s)`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default Guests;