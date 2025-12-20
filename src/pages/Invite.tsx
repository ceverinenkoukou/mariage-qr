import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart, MapPin, Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getGuestById } from "@/lib/services/guestService";
import { Table } from "@/types/guests";



const Invite = () => {
  const { qrCode } = useParams<{ qrCode: string }>();

  const { data: guest, isLoading, error } = useQuery({
    queryKey: ["guest", qrCode],
    queryFn: async () => {
      if (!qrCode) return null;
      const data = await getGuestById(qrCode);
      // Transform guest data to match frontend expectations
      return {
        ...data,
        first_name: data.name.split(' ')[0] || '',
        last_name: data.name.split(' ').slice(1).join(' ') || '',
      };
    },
    enabled: !!qrCode,
  });

  const { data: table } = useQuery({
    queryKey: ["table", guest?.table_id],
    queryFn: async () => {
      if (!guest?.table_id) return null;
      // Since tables are not a separate model in Django,
      // we'll create a mock table object
      return {
        id: guest.table_id,
        table_number: parseInt(guest.table_id) || 0,
        table_name: `Table ${guest.table_id}`,
      } as Table;
    },
    enabled: !!guest?.table_id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-wedding-gradient flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary animate-pulse mx-auto" />
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="min-h-screen bg-wedding-gradient flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold mb-2">Invitation non trouvée</h1>
            <p className="text-muted-foreground">
              Ce code QR ne correspond à aucune invitation.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wedding-gradient">
      <div className="container mx-auto px-4 py-12">
        {/* Welcome Card */}
        <Card className="max-w-lg mx-auto overflow-hidden">
          <div className="bg-primary/10 py-8 text-center border-b">
            <Heart className="h-16 w-16 text-primary fill-primary/20 mx-auto mb-4" />
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              Bienvenue
            </h1>
            <p className="text-xl text-muted-foreground">à notre mariage</p>
          </div>

          <CardContent className="py-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-display font-bold text-primary mb-2">
                {guest.first_name} {guest.last_name}
              </h2>
              <p className="text-muted-foreground">
                Nous sommes heureux de vous compter parmi nous
              </p>
            </div>

            {/* Table Assignment */}
            {table && (
              <div className="bg-secondary/20 rounded-xl p-6 text-center mb-6">
                <p className="text-sm text-muted-foreground mb-2">Votre table</p>
                <p className="text-3xl font-display font-bold text-foreground">
                  {table.table_name || `Table ${table.table_number}`}
                </p>
                <p className="text-lg text-muted-foreground mt-1">
                  Table n°{table.table_number}
                </p>
              </div>
            )}

            {/* Event Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">À définir</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Clock className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Heure</p>
                  <p className="text-sm text-muted-foreground">À définir</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <MapPin className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Lieu</p>
                  <p className="text-sm text-muted-foreground">À définir</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Message */}
        <p className="text-center text-muted-foreground mt-8 font-body">
          Présentez ce QR code à votre arrivée ❤️
        </p>
      </div>
    </div>
  );
};

export default Invite;
