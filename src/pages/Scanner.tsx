import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ArrowLeft, Users, Camera, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAllGuests } from "@/lib/services/guestService";

const Scanner = () => {
  const navigate = useNavigate();
  
  const { data: guests = [], isLoading } = useQuery({
    queryKey: ["guests"],
    queryFn: getAllGuests,
  });

  const total = guests.length;
  const presents = guests.filter(g => g.scanned).length;
  const taux = total > 0 ? Math.round((presents / total) * 100) : 0;

  // Fonction utilitaire pour éviter l'erreur 'guest.table is possibly null'
  const formatTableName = (table: any) => {
    if (!table) return "N/A";
    // Si table est un objet (cas d'une jointure côté API)
    if (typeof table === 'object' && table.name) return table.name;
    // Si table est une simple chaîne (cas d'un ID)
    return String(table);
  };

  useEffect(() => {
    // Configuration du scanner
    const scanner = new Html5QrcodeScanner(
      "reader", 
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 } 
      }, 
      /* verbose= */ false
    );

    // CORRECTION : render attend 2 arguments (SuccessCallback, ErrorCallback)
    scanner.render(
      (decodedText) => {
        if (decodedText) {
          // Stopper le scanner après détection
          scanner.clear().catch(error => console.error("Erreur clear scanner:", error));

          // Extraction intelligente du code (si c'est une URL)
          let finalCode = decodedText;
          if (decodedText.includes('/')) {
            const segments = decodedText.split('/').filter(Boolean);
            finalCode = segments.pop() || decodedText;
          }

          navigate(`/scan-direct/${encodeURIComponent(finalCode)}`);
        }
      },
      (errorMessage) => {
        // Deuxième argument obligatoire : callback d'erreur
        // On le laisse vide pour ne pas polluer la console à chaque frame vide
      }
    );

    return () => {
      // Nettoyage lors du démontage du composant
      scanner.clear().catch(error => console.warn("Scanner déjà arrêté ou erreur:", error));
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header simple */}
        <div className="flex items-center justify-between">
          <Link to="/guests" className="flex items-center text-slate-600 font-medium">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
          <h1 className="text-lg font-bold">Scanner</h1>
          <div className="w-8" />
        </div>

        {/* Statistiques rapides */}
        <div className="space-y-2 bg-white p-4 rounded-2xl shadow-sm border">
          <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
            <span>Progression</span>
            <span className="text-primary">{presents} / {total}</span>
          </div>
          <Progress value={taux} className="h-2" />
        </div>

        {/* Zone du Scanner */}
        <Card className="rounded-3xl overflow-hidden border-none shadow-xl bg-white">
          <CardHeader className="bg-slate-900 text-white py-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" /> 
              Scanner le QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* L'ID "reader" est indispensable pour html5-qrcode */}
            <div id="reader" className="w-full"></div>
          </CardContent>
        </Card>

        {/* Liste des arrivées récentes */}
        <Card className="rounded-3xl border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="border-b py-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Dernières entrées
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-[250px] overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center text-slate-400 text-sm">Chargement...</div>
            ) : presents === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm italic">Aucun scan pour le moment.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {guests
                  .filter(g => g.scanned)
                  .sort((a, b) => new Date(b.scanned_at || 0).getTime() - new Date(a.scanned_at || 0).getTime())
                  .map((guest) => (
                    <div key={guest.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-bold text-sm text-slate-900">{guest.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">
                          Table: {formatTableName(guest.table)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <p className="text-[10px] text-slate-400 mt-1">
                          {guest.scanned_at ? new Date(guest.scanned_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}) : ''}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Scanner;