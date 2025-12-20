import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  ArrowLeft,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllGuests, updateGuest } from "@/lib/services/guestService";

const ScanDirect = () => {
  const { data } = useParams<{ data: string }>();
  const navigate = useNavigate();
  
  // Decode the data
  const decodedData = data ? decodeURIComponent(data) : "";
  
  // Get the QR code from the scanned data
  const getQrCode = (data: string) => {
    if (data.includes('|')) {
      // Pipe-delimited format: qr_code|name|table|category|wedding_text
      return data.split('|')[0];
    } else if (data.includes('/invite/')) {
      // URL format
      return data.split('/').pop() || data;
    }
    // Direct QR code
    return data;
  };
  
  const qrCode = getQrCode(decodedData);
  
  const queryClient = useQueryClient();
  
  // Fetch guests to check if QR code has been scanned
  const { data: guests = [], isLoading: guestsLoading } = useQuery({
    queryKey: ["guests"],
    queryFn: getAllGuests,
  });
  
  // Find the guest with this QR code
  const guest = guests.find(g => g.qr_code === qrCode);
  
  // Check if already scanned
  const isAlreadyScanned = guest ? guest.scanned : false;
  
  // Mutation to mark guest as scanned
  const markAsScannedMutation = useMutation({
    mutationFn: (guestId: string) => 
      updateGuest(guestId, { 
        scanned: true, 
        scanned_at: new Date().toISOString() 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
    },
    onError: (error) => {
      console.error("Error marking guest as scanned:", error);
    },
  });
  
  // Mark as scanned when component loads (if not already scanned)
  React.useEffect(() => {
    if (guest && !guest.scanned && !markAsScannedMutation.isPending) {
      markAsScannedMutation.mutate(guest.id);
    }
  }, [guest, markAsScannedMutation.isPending]);
  
  // Parse the information from the QR code
  const parseQRData = (data: string) => {
    // Handle empty data
    if (!data) {
      return { 'Message': 'Aucune donnée scannée', 'Error': 'Données vides' };
    }
    
    // For simple QR codes, we'll fetch the data from the backend
    // Return minimal information for now
    return { 'Code': data };
  };
  
  const info = parseQRData(decodedData);

  // Show loading state
  if (guestsLoading || markAsScannedMutation.isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-slate-50">
        <Card className="w-full max-w-md border-t-8 border-t-primary shadow-2xl bg-white">
          <CardContent className="pt-8 text-center">
            <div className="animate-pulse">Vérification de l'invitation...</div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Show error state if guest not found
  if (!guest && qrCode) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-slate-50">
        <Card className="w-full max-w-md border-t-8 border-red-500 shadow-xl">
          <CardContent className="pt-8 text-center space-y-4">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-red-700">QR Code Invalide</h2>
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <p className="text-sm text-slate-500 mt-1">Ce QR code n'est pas reconnu</p>
            </div>
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white" 
              onClick={() => navigate('/scanner')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour au scanner
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show already scanned message
  if (isAlreadyScanned) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-orange-50">
        <Card className="w-full max-w-md border-t-8 border-orange-500 shadow-xl">
          <CardContent className="pt-8 text-center space-y-4">
            <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto" />
            <h2 className="text-2xl font-bold text-orange-800">Déjà Utilisé</h2>
            <div className="bg-white p-4 rounded-lg border border-orange-200">
              <p className="font-bold text-lg text-slate-800">{guest ? guest.name : 'Invité'}</p>
              <p className="text-sm text-slate-500 mt-1">Ce QR code a déjà été scanné</p>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4" 
              onClick={() => navigate('/scanner')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour au scanner
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-50">
      <Card className="w-full max-w-md border-t-8 border-t-primary shadow-2xl bg-white">
        <CardHeader className="text-center pb-2">
          <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-2" />
          <CardTitle className="text-2xl font-serif text-primary uppercase tracking-widest">
            Invitation Valide
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-4 text-center">
          {/* INFORMATIONS INVITÉ */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{guest ? guest.name : 'Chargement...'}</h2>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <div className="bg-emerald-600 text-sm px-4 py-1 text-white border-none rounded-full">
                TABLE : {guest?.table || 'Non assignée'}
              </div>
              <div className="bg-blue-600 text-sm px-4 py-1 text-white border-none rounded-full">
                Catégorie : {guest?.status || 'Non spécifiée'}
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* INFORMATIONS DE LA TABLE */}
          <div className="space-y-4">
            {/* MESSAGE PERSONNALISÉ (WEDDING TEXT) */}
            <div className="relative p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-line relative z-10 text-left">
                {guest ? guest.wedding_text : 'Chargement...'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
              Informations lues le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
            </p>
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white" 
              onClick={() => navigate('/scanner')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour au scanner
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanDirect;