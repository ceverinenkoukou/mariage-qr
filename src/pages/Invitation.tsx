import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  MapPin,
  Calendar,
  Clock,
  Users,
  Heart,
  Sparkles,
  User
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllGuests } from "@/lib/services/guestService";
import { tableweddingService } from "@/lib/services/tableService";
import { Guest } from "@/types/guests";

const Invitation = () => {
  const { qrCode } = useParams<{ qrCode: string }>();

  const { data: guests = [], isLoading: loadingGuests } = useQuery({
    queryKey: ["guests"],
    queryFn: getAllGuests,
  });

  const { data: tables = [], isLoading: loadingTables } = useQuery({
    queryKey: ["tables"],
    queryFn: tableweddingService.getAllTables,
  });

  const guest = guests.find((g: Guest) => g.qr_code === qrCode);

  const getTableInfo = (tableId: string | null) => {
    if (!tableId || !tables.length) return null;
    return tables.find(t => t.id === tableId);
  };

  const tableInfo = guest ? getTableInfo(guest.table) : null;

  if (loadingGuests || loadingTables) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-rose-400 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Chargement de votre invitation...</p>
        </div>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-4">
        <Card className="max-w-md w-full border-none shadow-xl">
          <CardContent className="p-8 text-center">
            <Heart className="h-16 w-16 text-rose-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Invitation introuvable</h2>
            <p className="text-slate-600">
              Ce QR code ne correspond à aucune invitation. Veuillez vérifier avec les organisateurs.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* En-tête élégant avec photo de profil */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg mb-4 border-4 border-rose-100">
            <User className="h-12 w-12 text-rose-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2 font-serif">
            {guest.name}
          </h1>
          <p className="text-rose-600 font-medium flex items-center justify-center gap-2">
            <Heart className="h-4 w-4 fill-current" />
            Vous êtes invité(e) à notre mariage
            <Heart className="h-4 w-4 fill-current" />
          </p>
        </div>

        {/* Informations de la table */}
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
          <div className="h-2 bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400" />
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl font-bold text-slate-800 flex items-center justify-center gap-2">
              <Users className="h-5 w-5 text-rose-500" />
              Votre placement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            {tableInfo ? (
              <>
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-6 rounded-2xl text-center border border-rose-100">
                  <p className="text-sm text-slate-600 mb-2">Vous êtes assigné(e) à la</p>
                  <h3 className="text-4xl font-black text-rose-600 mb-1">{tableInfo.name}</h3>
                  <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold">
                    {tableInfo.category}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50 p-4 rounded-xl text-center border">
                    <p className="text-slate-500 mb-1">Type d'accès</p>
                    <Badge variant={guest.status === 'VIP' ? 'default' : 'secondary'} className="text-xs">
                      {guest.status === 'VIP' ? '💎 VIP' : '🍷 Standard'}
                    </Badge>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl text-center border">
                    <p className="text-slate-500 mb-1">Accompagnement</p>
                    <Badge variant="outline" className="text-xs">
                      {guest.statut_guest === 'COUPLE' && '👫 Couple'}
                      
                      {guest.statut_guest === 'SINGLE' && '👤 Seul(e)'}
                    </Badge>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-amber-50 p-4 rounded-2xl text-center border border-amber-200">
                <p className="text-amber-800 text-sm">
                  Votre table sera confirmée prochainement. Veuillez vérifier plus tard.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message personnalisé */}
        {guest.wedding_text && (
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
            <div className="h-2 bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400" />
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-xl font-bold text-slate-800 flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Message spécial
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                <p className="text-slate-700 italic text-center leading-relaxed">
                  "{guest.wedding_text}"
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informations de la cérémonie */}
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
          <div className="h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl font-bold text-slate-800 flex items-center justify-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-500" />
              Détails de la cérémonie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border">
                <Calendar className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">Date</p>
                  <p className="text-slate-600 text-sm">Samedi 15 Juin 2025</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border">
                <Clock className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">Horaires</p>
                  <p className="text-slate-600 text-sm">Cérémonie : 14h00</p>
                  <p className="text-slate-600 text-sm">Réception : 17h00</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border">
                <MapPin className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">Lieu</p>
                  <p className="text-slate-600 text-sm">Château de Versailles</p>
                  <p className="text-slate-500 text-xs mt-1">Place d'Armes, 78000 Versailles</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-xl border border-rose-100 mt-6">
              <p className="text-center text-slate-700 text-sm leading-relaxed">
                <strong className="text-rose-600">Dress code :</strong> Tenue de soirée élégante<br />
                <span className="text-xs text-slate-500">Merci d'éviter le blanc</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-slate-500 text-sm">
            Nous avons hâte de célébrer ce moment avec vous ! 💕
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Pour toute question, contactez-nous au +33 6 XX XX XX XX
          </p>
        </div>

      </div>
    </div>
  );
};

export default Invitation;