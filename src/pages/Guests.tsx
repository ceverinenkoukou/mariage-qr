import { useState, useEffect, useMemo } from "react";
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [openTableSelect, setOpenTableSelect] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 1. Récupération des invités et des tables
  const { data: guests = [] } = useQuery({ queryKey: ["guests"], queryFn: getAllGuests });
  const { data: tables = [] } = useQuery({ queryKey: ["tables"], queryFn: tableweddingService.getAllTables });

  // 2. Fonctions utilitaires (CORRIGÉES POUR COMPARAISON STRING/NUMBER)
  const getTableOccupancy = (tableId: any) => {
    if (!tableId) return 0;
    // On convertit les deux en string pour une comparaison sûre
    return guests.filter(guest => String(guest.table) === String(tableId)).length;
  };
  
  const getTableName = (tableId: any) => {
    if (!tableId) return "N/A";
    const table = tables.find((t: any) => String(t.id) === String(tableId));
    return table ? table.name : "N/A";
  };
  
  const getTableCategory = (tableId: any) => {
    if (!tableId) return null;
    const table = tables.find(t => String(t.id) === String(tableId));
    return table ? table.category : null;
  };
  const getTableDescription = (tableId: any) => {
    if (!tableId) return null;
    const table = tables.find(t => String(t.id) === String(tableId));
    return table ? table.description : null;
  };

  // 3. Filtrage des invités avec recherche
  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim()) return guests;
    
    const query = searchQuery.toLowerCase().trim();
    
    return guests.filter(guest => {
      const tableName = getTableName(guest.table);
      const tableCategory = getTableCategory(guest.table);
      
      const matchesName = guest.name.toLowerCase().includes(query);
      const matchesTable = tableName && tableName !== "N/A" && tableName.toLowerCase().includes(query);
      const matchesCategory = tableCategory && tableCategory.toLowerCase().includes(query);
      
      return matchesName || matchesTable || matchesCategory;
    });
  }, [guests, searchQuery, tables]);

  // 4. Mutations
  const mutation = useMutation({
    mutationFn: (data: any) => selectedGuest ? updateGuest(selectedGuest.id, data) : createGuest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      setIsDialogOpen(false);
      setSelectedGuest(null);
      toast({ title: "Enregistrement réussi" });
    },
  });

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

  const bulkDeleteMutation = useMutation({
    mutationFn: async (guestIds: string[]) => {
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
  });

  // 5. Handlers (MODIFIÉ POUR LA SOLUTION A)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // CONVERSION DE L'ID EN NOMBRE ENTIER POUR DJANGO
    const tableIdNumeric = selectedTableId ? parseInt(selectedTableId, 10) : null;
    
    if (tableIdNumeric) {
      const count = getTableOccupancy(tableIdNumeric);
      const isFull = count >= 10;
      // Ne bloque que si c'est un nouvel invité sur une table pleine
      if (!selectedGuest && isFull) {
          toast({ 
              variant: "destructive", 
              title: "Table saturée", 
              description: "Cette table a déjà atteint sa limite de 10 personnes." 
          });
          return;
      }
    }

    const guestData: any = {
      name: formData.get("name"),
      status: formData.get("status"),
      statut_guest: formData.get("statut_guest"),
      wedding_text: formData.get("wedding_text"),
    };
    
    // Envoyer l'ID sous forme de nombre
    if (tableIdNumeric !== null) {
      guestData.table = tableIdNumeric;
    }
    
    mutation.mutate(guestData);
  };

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

  const handleOpenEditDialog = (guest: Guest) => {
    setSelectedGuest(guest);
    // On convertit en string pour le composant UI Popover/Command
    setSelectedTableId(guest.table ? String(guest.table) : null); 
    setIsDialogOpen(true);
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

  // Fonctions d'export (CSV & PDF) - conservées telles quelles
  const exportGuestsByTable = () => {
    const guestsByTable: Record<string, Guest[]> = {};
    guests.forEach(guest => {
      const tableName = getTableName(guest.table) || 'Sans table';
      if (!guestsByTable[tableName]) guestsByTable[tableName] = [];
      guestsByTable[tableName].push(guest);
    });
    let csvContent = 'Nom,Table,Statut,Accompagnement,Scanné\n';
    Object.keys(guestsByTable).sort().forEach(tableName => {
      const tableGuests = guestsByTable[tableName];
      csvContent += `"Table: ${tableName}",,,\n`;
      tableGuests.forEach(guest => {
        const statut = guest.statut_guest === 'COUPLE' ? 'Couple' : guest.statut_guest === 'SINGLE' ? 'Seul' : 'Famille';
        const scanned = guest.scanned ? 'Oui' : 'Non';
        csvContent += `${guest.name.replace(/,/g, ' ')},"${tableName}",${guest.status},${statut},${scanned}\n`;
      });
      csvContent += '\n';
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `liste-invites-par-table-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const exportGuestsByTablePDF = () => {
    const doc = new jsPDF();
    const guestsByTable: Record<string, Guest[]> = {};
    guests.forEach(guest => {
      const tableName = getTableName(guest.table) || 'Sans table';
      if (!guestsByTable[tableName]) guestsByTable[tableName] = [];
      guestsByTable[tableName].push(guest);
      const getTableCategory = (tableId: any) => {
        if (!tableId) return "N/A";
        const table = tables.find((t: any) => String(t.id) === String(tableId));
        return table ? table.category : "N/A"; 
      }
    });
    doc.setFontSize(18);
    doc.text('Liste des Invités par Table', 20, 20);
    let yPosition = 30;
    Object.keys(guestsByTable).sort().forEach((tableName) => {
      const tableGuests = guestsByTable[tableName],
        tableCategory = getTableCategory(tableGuests[0].table),tableDescription=getTableDescription(tableGuests[0].table);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`Table: ${tableName},${tableCategory},${tableDescription}`, 20, yPosition);
      yPosition += 10;
      const tableData = tableGuests.map(guest => [
        guest.name,
        guest.status,
       
        guest.scanned ? 'Oui' : 'Non'
      ]);
      autoTable(doc, {
        head: [['Nom', 'Statut',  'Scanné']],
        body: tableData,
        startY: yPosition,
        margin: { left: 20, right: 20 },
      });
      yPosition = (doc as any).lastAutoTable.finalY + 15;
      if (yPosition > 270) { doc.addPage(); yPosition = 20; }
    });
    doc.save(`liste-invites-par-table-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* EN-TÊTE */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                  <Link to="/"><ArrowLeft className="h-4 w-4"/></Link>
                </Button>
                <h1 className="text-2xl font-bold text-slate-900 font-serif">Liste des Invités</h1>
            </div>
            <p className="text-sm text-slate-500 ml-10">
                {filteredGuests.length} invité{filteredGuests.length > 1 ? 's' : ''} affiché{filteredGuests.length > 1 ? 's' : ''} sur {guests.length} au total
            </p>
          </div>
          
          <div className="flex gap-2">
            {!isSelectionMode ? (
              <>
                <Button onClick={() => setIsSelectionMode(true)} variant="outline" className="border-slate-300">
                  <Trash2 className="mr-2 h-4 w-4" /> Sélectionner
                </Button>
                <Button onClick={() => { setSelectedGuest(null); setSelectedTableId(null); setIsDialogOpen(true); }} className="bg-primary shadow-lg">
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un invité
                </Button>
                <Button onClick={exportGuestsByTable} variant="outline" className="border-slate-300">
                  <Users className="mr-2 h-4 w-4" /> CSV
                </Button>
                <Button onClick={exportGuestsByTablePDF} variant="outline" className="border-slate-300">
                  <Users className="mr-2 h-4 w-4" /> PDF
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleSelectAll} variant="outline" className="border-slate-300">
                  {selectedGuestIds.length === filteredGuests.length ? "Tout désélectionner" : "Tout sélectionner"}
                </Button>
                <Button onClick={handleBulkDelete} variant="destructive" disabled={selectedGuestIds.length === 0}>
                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer ({selectedGuestIds.length})
                </Button>
                <Button onClick={() => { setIsSelectionMode(false); setSelectedGuestIds([]); }} variant="ghost">Annuler</Button>
              </>
            )}
          </div>
        </div>

        {/* RECHERCHE */}
        <div className="max-w-md mx-auto w-full">
          <div className="relative">
            <Input
              type="text"
              placeholder="Rechercher par nom, table ou catégorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-2 w-full rounded-lg"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* GRILLE DES INVITÉS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGuests.map((guest) => (
            <Card key={guest.id} className={`border-none shadow-sm ${selectedGuestIds.includes(guest.id) ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="p-5">
                {isSelectionMode && (
                  <div className="flex items-center mb-3">
                    <Checkbox checked={selectedGuestIds.includes(guest.id)} onCheckedChange={() => handleSelectGuest(guest.id)} />
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800">{guest.name}</h3>
                    <div className="flex gap-2">
                        <Badge variant="secondary" className="text-[10px] uppercase">{getTableName(guest.table)}</Badge>
                        <Badge className="bg-slate-100 text-slate-600 border-none text-[10px] uppercase">{getTableCategory(guest.table) || guest.status}</Badge>
                    </div>
                  </div>
                  {guest.scanned && <Badge className="bg-emerald-500">Présent</Badge>}
                </div>
                {!isSelectionMode && (
                  <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-50">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setQrGuest(guest); setShowQRDialog(true); }}>
                      <QrCode className="h-4 w-4 mr-2" /> QR
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenEditDialog(guest)}>
                      <Edit className="h-4 w-4 mr-2" /> Éditer
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteSingle(guest)} className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* DIALOG FORMULAIRE (Modification pour utiliser IDs numériques) */}
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
                <Popover open={openTableSelect} onOpenChange={setOpenTableSelect}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedTableId
                        ? `${tables.find((t) => String(t.id) === selectedTableId)?.name} (${getTableOccupancy(selectedTableId)}/10 places)`
                        : "Sélectionnez une table..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Rechercher une table..." />
                      <CommandList>
                        <CommandEmpty>Aucune table trouvée.</CommandEmpty>
                        <CommandGroup>
                          {tables.map((t) => (
                            <CommandItem
                              key={t.id}
                              value={String(t.id)}
                              onSelect={(v) => { setSelectedTableId(v); setOpenTableSelect(false); }}
                              disabled={getTableOccupancy(t.id) >= 10 && String(selectedGuest?.table) !== String(t.id)}
                            >
                              {t.name} ({getTableOccupancy(t.id)}/10) - {t.category}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
                <Label>Texte personnalisé</Label>
                <Textarea name="wedding_text" defaultValue={selectedGuest?.wedding_text} className="h-20" />
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? "Traitement..." : "Enregistrer l'invité"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG QR CODE & SUPPRESSION (Conservés) */}
        <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
          <DialogContent className="max-w-xs">
            <DialogHeader><DialogTitle className="text-center">{qrGuest?.name}</DialogTitle></DialogHeader>
            {qrGuest && <QRCodeDisplay value={`${window.location.origin}/invitation/${qrGuest.qr_code}`} guestName={qrGuest.name} tableName={getTableName(qrGuest.table)} />}
          </DialogContent>
        </Dialog>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Confirmer la suppression</DialogTitle>
              <DialogDescription>Supprimer <strong>{guestToDelete?.name}</strong> ?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Annuler</Button>
              <Button variant="destructive" onClick={confirmDeleteSingle} disabled={deleteMutation.isPending}>Supprimer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default Guests;