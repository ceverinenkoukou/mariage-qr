import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { scanGuestQRCode } from "@/lib/services/guestService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Quote, 
  AlertTriangle, 
  ArrowLeft 
} from "lucide-react";

const ScanResult = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const { data: result, isLoading, error } = useQuery({
    queryKey: ["scan", code],
    queryFn: () => scanGuestQRCode(code!),
    enabled: !!code,
    // On ne veut pas que React Query réessaie automatiquement en boucle si c'est une erreur 400
    retry: false, 
  });

  // 1. ÉTAT DE CHARGEMENT
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-slate-600 font-medium">Validation de l'invitation...</p>
      </div>
    );
  }

  // 2. ÉTAT DÉJÀ SCANNÉ (DOUBLON)
  if (result?.already_scanned) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-orange-50">
        <Card className="w-full max-w-md border-t-8 border-orange-500 shadow-xl">
          <CardContent className="pt-8 text-center space-y-4">
            <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto" />
            <h2 className="text-2xl font-bold text-orange-800">Déjà Présent</h2>
            <div className="bg-white p-4 rounded-lg border border-orange-200">
              <p className="font-bold text-lg text-slate-800">{result.affichage_ecran?.name}</p>
              <p className="text-sm text-slate-500 mt-1">{result.message}</p>
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

  // 3. ÉTAT ERREUR (CODE INVALIDE)
  if (error || result?.status === "error") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-slate-50">
        <Card className="w-full max-w-md border-t-8 border-red-500 shadow-xl">
          <CardContent className="pt-8 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700">Accès Refusé</h2>
            <p className="text-slate-500 mt-2">
              {result?.message || "Ce QR Code n'est pas valide ou a été révoqué."}
            </p>
            <Button className="mt-6 w-full bg-slate-800" onClick={() => navigate('/scanner')}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const info = result?.affichage_ecran;

  // 4. ÉTAT SUCCÈS (BIENVENUE)
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-50">
      <Card className="w-full max-w-md border-t-8 border-t-primary shadow-2xl bg-white">
        <CardHeader className="text-center pb-2">
          <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-2" />
          <CardTitle className="text-2xl font-serif text-primary uppercase tracking-widest">
            Bienvenue
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-4 text-center">
          {/* INFORMATIONS INVITÉ */}
          <div>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              {info?.nom}
            </h2>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Badge variant="outline" className="text-sm px-4 py-1">
                {info?.status}
              </Badge>
              <Badge className="bg-emerald-600 text-sm px-4 py-1 text-white border-none">
                TABLE : {info?.table || 'Non assignée'}
              </Badge>
              {info?.table_category && (
                <Badge className="bg-blue-600 text-sm px-4 py-1 text-white border-none">
                  Catégorie : {info?.table_category}
                </Badge>
              )}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* INFORMATIONS DE LA TABLE */}
          <div className="space-y-4">
            {/* Catégorie de la table */}
            {info?.table_category && (
              <div className="text-center">
                <p className="text-sm text-slate-500 uppercase tracking-wider">Catégorie de la table</p>
                <p className="text-lg font-semibold text-slate-800">{info?.table_category}</p>
              </div>
            )}

            {/* MESSAGE PERSONNALISÉ (WEDDING TEXT) */}
            <div className="relative p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <Quote className="absolute top-2 left-2 h-6 w-6 text-slate-200" />
              <p className="text-slate-700 leading-relaxed text-sm italic whitespace-pre-line relative z-10 text-left">
                {info?.wedding_text}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
              Entrée validée le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
            </p>
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white" 
              onClick={() => navigate('/scanner')}
            >
              Suivant
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanResult;