import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Edit, Users, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { tableweddingService } from "@/lib/services/tableService";
import { Table } from "@/types/tables";

const Tables = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 1. Récupération des tables via React Query
  const { data: tables = [], isLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: tableweddingService.getAllTables,
  });

  // 2. Formulaire local
  const [formData, setFormData] = useState({
    name: "",
    category: "STAND",
    capacity: 10,
    description: "",
  });

  // 3. Mutation pour créer/modifier
  const tableMutation = useMutation({
    mutationFn: (data: any) => 
      selectedTable 
        ? tableweddingService.updateTable(selectedTable.id, data) 
        : tableweddingService.createTable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: selectedTable ? "Table mise à jour" : "Table créée avec succès" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tableweddingService.deleteTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast({ title: "Table supprimée" });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", category: "STAND", capacity: 10, description: "" });
    setSelectedTable(null);
  };

  const handleEdit = (table: Table) => {
    setSelectedTable(table);
    setFormData({
      name: table.name,
      category: table.category || "STAND",
      capacity: table.capacity || 10,
      description: table.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    tableMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 font-serif">Gestion des Tables</h1>
              <p className="text-slate-500 text-sm">{tables.length} tables configurées</p>
            </div>
          </div>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-primary">
            <Plus className="mr-2 h-4 w-4" /> Créer une table
          </Button>
        </div>

        {/* GRILLE DES TABLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => (
            <Card key={table.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all">
              <CardHeader className="pb-2 flex flex-row items-center justify-between bg-white">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold text-primary">{table.name}</CardTitle>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                    {table.category === 'STAND' ? 'Standard' : table.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-slate-600 font-bold">
                    <Users className="h-4 w-4 mr-1 text-slate-400" />
                    <span>{table.occupancy || 0}/{table.capacity}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase">Occupation</p>
                </div>
              </CardHeader>
              <CardContent className="pt-4 bg-white">
                <p className="text-sm text-slate-500 line-clamp-2 h-10 mb-4">
                  {table.description || "Aucune description fournie."}
                </p>
                
                {/* BARRE DE REMPLISSAGE VISUELLE */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full mb-4 overflow-hidden">
                  <div 
                    className={`h-full transition-all ${ (table.occupancy || 0) >= table.capacity ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${((table.occupancy || 0) / table.capacity) * 100}%` }}
                  ></div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(table)}>
                    <Edit className="h-4 w-4 mr-2" /> Modifier
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => { if(confirm("Supprimer cette table ?")) deleteMutation.mutate(table.id) }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* DIALOG FORMULAIRE */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-primary" />
                {selectedTable ? "Modifier la table" : "Nouvelle Table"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la table</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Table VIP 1 ou Table Famille Minko"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIP">💎 VIP</SelectItem>
                      <SelectItem value="FAM">👨‍👩‍👧‍👦 Famille</SelectItem>
                      <SelectItem value="AMI">🎉 Amis</SelectItem>
                      <SelectItem value="STAND">🍷 Standard</SelectItem>
                      <SelectItem value="AUTRE">✨ Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacité max.</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 10 })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description ou Emplacement</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Près de l'estrade, côté jardin..."
                  className="h-24"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={tableMutation.isPending} className="bg-primary px-8">
                  {tableMutation.isPending ? "Enregistrement..." : "Valider"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Tables;