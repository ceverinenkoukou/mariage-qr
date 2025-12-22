import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  CheckCircle2, 
  ArrowLeft,
  XCircle,
  User,
  Info
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getAllGuests, updateGuest } from "@/lib/services/guestService";
import { tableweddingService } from "@/lib/services/tableService"; // Import du service de table
import { Guest } from "@/types/guests";

const ScanDirect = () => {
  const { data } = useParams<{ data: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasProcessed, setHasProcessed] = useState(false);

  // Décoder le QR code depuis l'URL
  const decodedData = data ? decodeURIComponent(data) : "";

  const getQrCode = (input: string) => {
    if (!input) return "";
    // Gère les différents formats possibles dans l'URL
    if (input.includes('|')) return input.split('|')[0];
    if (input.includes('/')) return input.split('/').filter(Boolean).pop() || input;
    return input;
  };

  const qrCode = getQrCode(decodedData);

  // 1. Récupérer tous les invités
  const { data: guests = [], isLoading: isLoadingGuests } = useQuery({
    queryKey: ["guests"],
    queryFn: getAllGuests,
    staleTime: 0, // Force la récupération de données fraîches
  });

  // 2. Récupérer toutes les tables pour la correspondance ID -> Nom
  const { data: tables = [] } = useQuery({
    queryKey: ["tables"],
    queryFn: tableweddingService.getAllTables, // Utiliser le service de tabletables,
  });

  const guest = guests.find((g) => g.qr_code === qrCode);

  

  // 3. Fonction améliorée pour afficher le NOM de la table
  const formatTableName = (tableId: any) => {
    if (!tableId) return "Non assignée";
    
    // Si l'API renvoie déjà un objet avec le nom
    if (typeof tableId === 'object' && tableId.name) return tableId.name;
    
    // Sinon, on cherche le nom dans la liste des tables téléchargées
    const tableFound = tables.find((t: any) => String(t.id) === String(tableId));
    return tableFound ? tableFound.name : `Table ${tableId}`;
  };

  // 4. Mutation pour marquer l'invité comme "Scanné"
  const mutation = useMutation({
    mutationFn: (guestId: string) => 
      updateGuest(guestId, { 
        scanned: true, 
        scanned_at: new Date().toISOString() 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
    },
  });

  // Marquer automatiquement comme présent au scan
  useEffect(() => {
    if (guest && !guest.scanned && !hasProcessed) {
      setHasProcessed(true);
      mutation.mutate(guest.id);
    }
  }, [guest, hasProcessed]);

  if (isLoadingGuests) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center animate-pulse">
          <div className="h-12 w-12 bg-primary/20 rounded-full mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Vérification de l'invitation...</p>
        </div>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-100 shadow-xl">
          <CardContent className="pt-10 pb-10 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl mb-2 text-red-700">Oups ! Invitation invalide</CardTitle>
            <p className="text-slate-500 mb-6">Ce QR code ne correspond à aucun invité dans notre liste.</p>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf8f6] p-4 flex flex-col items-center">
      <div className="w-full max-w-md mt-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")} 
          className="mb-4 text-slate-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>

        <Card className="border-none shadow-2xl overflow-hidden rounded-3xl bg-white">
          {/* Barre de statut */}
          <div className={`h-2 ${guest.scanned ? 'bg-emerald-500' : 'bg-primary'}`} />
          
          <CardHeader className="text-center pt-8">
             <div className="mx-auto mb-4 bg-slate-100 h-20 w-20 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-slate-400" />
            </div>
            <CardTitle className="text-2xl font-black uppercase tracking-tight text-slate-800">
              {guest.name}
            </CardTitle>
            <div className="flex justify-center gap-2 mt-3">
              <span className="bg-primary/10 text-primary text-xs font-bold px-4 py-1.5 rounded-full border border-primary/20">
                {formatTableName(guest.table)}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Message de succès */}
            {guest.scanned && (
              <div className="bg-emerald-50 p-4 rounded-2xl flex items-center gap-3 mb-6 border border-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <p className="text-emerald-800 font-bold text-sm">Entrée validée avec succès</p>
              </div>
            )}

            {/* Texte d'invitation stylisé */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-600 text-sm mb-6 leading-relaxed">
              <div className="flex items-center gap-2 mb-3 text-primary font-semibold">
                <Info className="h-4 w-4" />
                <span>Message d'invitation</span>
              </div>
              <div className="whitespace-pre-line">
                {guest.wedding_text.split('\n').map((line, i) => {
                   const trimmed = line.trim();
                   // Style simple pour les titres dans le ScanDirect
                   if (trimmed.includes("INVITATION") || trimmed.includes("PROGRAMME")) {
                     return <p key={i} className="font-bold text-slate-800 mt-2 mb-1 uppercase underline decoration-primary/30">{trimmed}</p>
                   }
                   return <p key={i}>{trimmed}</p>
                })}
              </div>
            </div>

            <Button 
              onClick={() => navigate("/")} 
              className="w-full rounded-xl py-6 text-lg font-bold shadow-lg shadow-primary/20"
            >
              Fermer
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-slate-400 text-[10px] mt-8 uppercase tracking-[0.2em]">
          Mariage Gaëlle & Théophile • 2027
        </p>
      </div>
    </div>
  );
};

export default ScanDirect;