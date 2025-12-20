import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  CheckCircle2, 
  ArrowLeft,
  XCircle,
  User
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getAllGuests, updateGuest } from "@/lib/services/guestService";
import { Guest } from "@/types/guests";

const ScanDirect = () => {
  const { data } = useParams<{ data: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasProcessed, setHasProcessed] = useState(false);

  const decodedData = data ? decodeURIComponent(data) : "";

  const getQrCode = (input: string) => {
    if (!input) return "";
    if (input.includes('|')) return input.split('|')[0];
    if (input.includes('/')) return input.split('/').filter(Boolean).pop() || input;
    return input;
  };

  const qrCode = getQrCode(decodedData);

  const { data: guests = [], isLoading } = useQuery({
    queryKey: ["guests"],
    queryFn: getAllGuests,
  });

  const guest = guests.find((g: Guest) => g.qr_code === qrCode);

  // FONCTION DE FORMATAGE SÉCURISÉE
  const formatTableName = (table: any) => {
    if (!table) return "N/A";
    if (typeof table === 'object' && table.name) return table.name;
    return String(table);
  };

  const mutation = useMutation({
    mutationFn: (guestId: string) => 
      updateGuest(guestId, { 
        scanned: true, 
        scanned_at: new Date().toISOString() 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      toast({ title: "Présence confirmée", description: "L'invité a été marqué comme présent." });
    }
  });

  useEffect(() => {
    if (guest && !guest.scanned && !hasProcessed) {
      setHasProcessed(true);
      mutation.mutate(guest.id);
    }
  }, [guest, hasProcessed, mutation]);

  if (isLoading) return <div className="flex h-screen items-center justify-center">Chargement...</div>;

  if (!guest) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center bg-slate-50">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">QR Code Invalide</h2>
        <Button onClick={() => navigate('/scanner')} variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/scanner')}><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button>

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
          <div className={`h-2 ${guest.scanned ? 'bg-emerald-500' : 'bg-primary'}`} />
          <CardHeader className="text-center">
             <div className="mx-auto mb-4 bg-slate-100 h-20 w-20 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-slate-400" />
            </div>
            <CardTitle className="text-2xl font-black uppercase">{guest.name}</CardTitle>
            <div className="flex justify-center gap-2 mt-2">
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full">
                TABLE : {formatTableName(guest.table)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {guest.scanned && (
              <div className="bg-emerald-50 p-4 rounded-2xl flex items-center gap-3 mb-6">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <p className="text-emerald-800 font-bold text-sm">Entrée déjà validée</p>
              </div>
            )}
            <div className="bg-slate-50 p-5 rounded-2xl border italic text-slate-600 text-sm mb-6">
              {guest.wedding_text || "Bienvenue au mariage !"}
            </div>
            <Button className="w-full h-12 rounded-2xl font-bold" onClick={() => navigate('/scanner')}>Scanner un autre invité</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScanDirect;