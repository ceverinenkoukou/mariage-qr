import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllGuests } from "@/lib/services/guestService";
import { Card, CardContent } from "@/components/ui/card";
import { User, MapPin, Calendar, Info } from "lucide-react";

const Invitation = () => {
  const { code } = useParams<{ code: string }>();
  
  const { data: guests = [], isLoading } = useQuery({
    queryKey: ["guests"],
    queryFn: getAllGuests,
  });

  const guest = guests.find(g => g.qr_code === code);

  if (isLoading) return <div className="flex h-screen items-center justify-center italic">Chargement de votre invitation...</div>;
  if (!guest) return <div className="p-10 text-center">Invitation introuvable.</div>;

  return (
    <div className="min-h-screen bg-[#fdf8f6] p-4 flex flex-col items-center">
      {/* Header Élégant */}
      <div className="text-center mt-8 mb-6">
        <h1 className="text-3xl font-serif text-[#70372c]">Notre Mariage</h1>
        <div className="h-px w-20 bg-[#70372c] mx-auto mt-2" />
      </div>

      <Card className="w-full max-w-md border-none shadow-xl bg-white rounded-3xl overflow-hidden">
        <div className="bg-[#70372c] p-6 text-white text-center">
          <User className="mx-auto h-12 w-12 mb-2 opacity-80" />
          <h2 className="text-xl font-bold uppercase tracking-widest">{guest.name}</h2>
          <p className="text-sm opacity-90 mt-1">Vous êtes notre invité(e)</p>
        </div>

        <CardContent className="p-8 space-y-8">
          {/* Information Table */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center">
              <MapPin className="text-orange-600 h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Votre Table</p>
              <p className="text-lg font-bold text-slate-800">{guest.table || "Sera assignée à l'entrée"}</p>
            </div>
          </div>

          {/* Programme / Texte personnalisé */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
            <div className="flex items-center gap-2 mb-3 text-[#70372c]">
              <Info className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">À savoir</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed italic whitespace-pre-line">
              {guest.wedding_text || "Nous avons hâte de célébrer ce moment magique avec vous !"}
            </p>
          </div>
          
          <div className="text-center pt-4">
             <p className="text-[10px] text-slate-300 uppercase">Présentez ce code à l'accueil le jour J</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invitation;