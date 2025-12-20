import { Link } from "react-router-dom";
import { Users, QrCode, Scan, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-wedding-gradient">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex justify-center mb-6">
            <Heart className="h-16 w-16 text-primary fill-primary/20" />
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground mb-4">
            Notre Mariage
          </h1>
          <p className="text-xl text-muted-foreground font-body max-w-2xl mx-auto">
            Bienvenu au maraige de THEO et GAELLE
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-border/50 animate-scale-in">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl font-display">Gestion Invités</CardTitle>
              <CardDescription className="font-body">
                Ajouter, modifier et gérer la liste des invités
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link to="/guests">
                <Button className="w-full" size="lg">
                  Accéder
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-border/50 animate-scale-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 rounded-full bg-secondary/20 group-hover:bg-secondary/30 transition-colors">
                <Scan className="h-10 w-10 text-accent" />
              </div>
              <CardTitle className="text-2xl font-display">Scanner QR</CardTitle>
              <CardDescription className="font-body">
                Scanner les codes QR pour le check-in
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link to="/scanner">
                <Button className="w-full" variant="secondary" size="lg">
                  Accéder
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-border/50 animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <QrCode className="h-10 w-10 text-wedding-brown" />
              </div>
              <CardTitle className="text-2xl font-display">Plan de Table</CardTitle>
              <CardDescription className="font-body">
                Gérer les tables et l'attribution des places
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link to="/tables">
                <Button className="w-full" variant="outline" size="lg">
                  Accéder
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground font-body">
            Bienvenue dans votre application de gestion de mariage
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
