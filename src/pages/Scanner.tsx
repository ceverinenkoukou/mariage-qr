import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ArrowLeft, Users, Camera, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllGuests } from "@/lib/services/guestService";

const Scanner = () => {
  const navigate = useNavigate();
  const { data: guests = [] } = useQuery({
    queryKey: ["guests"],
    queryFn: getAllGuests,
  });

  const total = guests.length;
  const presents = guests.filter(g => g.scanned).length;
  const taux = total > 0 ? Math.round((presents / total) * 100) : 0;

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
    scanner.render((text) => {
      try {
        console.log("QR Code scanned successfully:", text);
        
        // Validate that we have a QR code
        if (!text) {
          console.error("Empty QR code scanned");
          return;
        }
        
        // Clear the scanner first
        scanner.clear();
        
        // Redirect to ScanDirect page with the scanned data
        const encodedData = encodeURIComponent(text);
        navigate(`/scan-direct/${encodedData}`);
      } catch (error) {
        console.error("Error processing QR code:", error);
        // Handle error gracefully
      }
    }, (error) => {
      // Handle scanning errors
      console.warn("QR Code scan error:", error);
      
      // If it's a permission error, show a more user-friendly message
      if (error.toString().includes("Permission") || error.toString().includes("permission")) {
        console.error("Camera permission denied. Please allow camera access to scan QR codes.");
      }
      
      // If it's a NotFoundError, it might mean no camera is available
      if (error.toString().includes("NotFoundError") || error.toString().includes("not found")) {
        console.error("No camera found. Please make sure you have a working camera.");
      }
    });
    return () => { scanner.clear().catch(() => {}); };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between py-2">
          <Button variant="ghost" size="sm" asChild><Link to="/"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <h1 className="font-bold text-slate-800">Check-in Mariage</h1>
          <div className="w-8"></div>
        </div>

        {/* Chiffres clés */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white p-3 rounded-xl shadow-sm text-center border-b-4 border-primary">
            <span className="text-[10px] text-slate-400 block uppercase">Invités</span>
            <span className="text-xl font-bold">{total}</span>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm text-center border-b-4 border-emerald-500">
            <span className="text-[10px] text-slate-400 block uppercase">Présents</span>
            <span className="text-xl font-bold">{presents}</span>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm text-center border-b-4 border-orange-400">
            <span className="text-[10px] text-slate-400 block uppercase">Taux</span>
            <span className="text-xl font-bold">{taux}%</span>
          </div>
        </div>

        {/* Scanner */}
        <Card className="overflow-hidden border-none shadow-md">
          <div id="reader" className="w-full bg-black"></div>
          <div className="p-3 text-center text-sm text-slate-500 bg-slate-100">
            Positionnez le QR code dans le cadre pour le scanner
          </div>
        </Card>

        {/* Liste des présents */}
        <Card className="border-none shadow-md">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Liste des présents
            </CardTitle>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
              {presents} ARRIVÉS
            </span>
          </CardHeader>
          <CardContent className="p-4 max-h-[300px] overflow-y-auto mt-2">
            <div className="space-y-2">
              {guests
                .filter(g => g.scanned)
                .sort((a, b) => new Date(b.scanned_at || 0).getTime() - new Date(a.scanned_at || 0).getTime())
                .map((guest) => (
                  <div key={guest.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <p className="font-bold text-sm text-slate-800">{guest.name}</p>
                      <p className="text-[10px] text-slate-500">Table: {guest.table?.name || '?'}</p>
                    </div>
                    <div className="text-right">
                      <CheckCircle className="h-4 w-4 text-emerald-500 ml-auto" />
                      <p className="text-[10px] text-slate-400">
                        {guest.scanned_at ? new Date(guest.scanned_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}) : ''}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Scanner;