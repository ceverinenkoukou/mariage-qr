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
          <div className="space-y-6 text-slate-700 leading-relaxed text-sm text-center">
            {guest.wedding_text.split('\n').map((line, index) => {
              const trimmedLine = line.trim();
              
              // Style pour les titres (INVITATION et PROGRAMME)
              if (trimmedLine === "✨ INVITATION ✨" || trimmedLine === "✨ PROGRAMME ✨") {
                return (
                  <div key={index} className="py-4">
                    <h2 className="text-xl font-serif font-bold text-[#70372c] uppercase tracking-widest inline-block border-b-2 border-[#70372c] pb-1">
                      {trimmedLine}
                    </h2>
                  </div>
                );
              }

              // Style pour les noms des mariés (plus gros et élégant)
              if (trimmedLine.includes("💍")) {
                return (
                  <p key={index} className="text-lg font-bold text-[#70372c] py-4 leading-snug">
                    {trimmedLine}
                  </p>
                );
              }

              // Style pour le programme (aligné à gauche pour plus de lisibilité)
              if (trimmedLine.startsWith("⭐")) {
                return (
                  <p key={index} className="text-left pl-4 py-1 flex items-start gap-3">
                    <span className="text-orange-400">{trimmedLine.slice(0, 1)}</span>
                    <span>{trimmedLine.slice(2)}</span>
                  </p>
                );
              }

              // Lignes vides
              if (trimmedLine === "") return <div key={index} className="h-2" />;

              // Texte normal
              return (
                <p key={index} className="px-2">
                  {trimmedLine}
                </p>
              );
            })}
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