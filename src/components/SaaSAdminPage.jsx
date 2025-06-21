import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { PlusCircle, Edit3, Trash2, Building, Users, Save, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SAAS_CLIENTS_STORAGE_KEY = 'mq_saas_clients';

export function SaaSAdminPage() {
  const [clients, setClients] = useState([]);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null); 
  const [clientFormData, setClientFormData] = useState({
    id: '',
    name: '',
    adminEmail: '',
    plan: 'basic', 
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedClients = JSON.parse(localStorage.getItem(SAAS_CLIENTS_STORAGE_KEY)) || [];
    setClients(storedClients);
  }, []);

  const saveClientsToStorage = (updatedClients) => {
    localStorage.setItem(SAAS_CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientFormData(prev => ({ ...prev, [name]: value }));
  };

  const openNewClientModal = () => {
    setCurrentClient(null);
    setClientFormData({ id: `client_${Date.now()}`, name: '', adminEmail: '', plan: 'basic' });
    setIsClientModalOpen(true);
  };

  const openEditClientModal = (client) => {
    setCurrentClient(client);
    setClientFormData({ ...client });
    setIsClientModalOpen(true);
  };

  const handleSaveClient = () => {
    if (!clientFormData.name || !clientFormData.adminEmail) {
      toast({ title: "Missing Fields", description: "Client Name and Admin Email are required.", variant: "destructive" });
      return;
    }

    let updatedClients;
    if (currentClient) {
      updatedClients = clients.map(c => c.id === currentClient.id ? clientFormData : c);
      toast({ title: "Client Updated", description: `${clientFormData.name} details updated successfully.` });
    } else {
      updatedClients = [...clients, clientFormData];
      toast({ title: "Client Added", description: `${clientFormData.name} added successfully.` });
    }
    setClients(updatedClients);
    saveClientsToStorage(updatedClients);
    setIsClientModalOpen(false);
  };

  const handleDeleteClient = (clientId) => {
    const updatedClients = clients.filter(c => c.id !== clientId);
    setClients(updatedClients);
    saveClientsToStorage(updatedClients);
    toast({ title: "Client Deleted", description: "Client removed successfully.", variant: "destructive" });
  };
  
  const handleViewClientDashboard = (client) => {
     toast({
      title: "🚧 Feature In Progress",
      description: `Simulating navigation to ${client.name}'s dashboard. In a real app, this would load their specific configuration.`,
    });
    // In a real multi-tenant app, you'd set the current client context here
    // and navigate to the main app, which would then load this client's data.
    // For now, we can just show a toast.
    // navigate('/'); // This would take them to the regular app, not specific to client.
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-purple-800 to-slate-800 text-foreground p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            SaaS Admin Dashboard
          </h1>
          <Button onClick={openNewClientModal} className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" /> Add New Client
          </Button>
        </div>

        <Card className="glass-effect shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building className="h-6 w-6 text-primary" /> Manage Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence>
              {clients.length === 0 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-muted-foreground text-center py-8 text-lg">
                  No clients configured yet. Add your first client to get started!
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-4">
              <AnimatePresence>
                {clients.map(client => (
                  <motion.div
                    key={client.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border bg-card/60 hover:shadow-md transition-shadow"
                  >
                    <div className="mb-3 sm:mb-0">
                      <p className="text-xl font-semibold text-primary">{client.name}</p>
                      <p className="text-sm text-muted-foreground">Admin: {client.adminEmail}</p>
                      <p className="text-xs text-muted-foreground uppercase">Plan: {client.plan}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                       <Button variant="outline" size="sm" onClick={() => handleViewClientDashboard(client)} className="flex items-center gap-1">
                        <Eye className="h-4 w-4" /> View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditClientModal(client)} className="flex items-center gap-1">
                        <Edit3 className="h-4 w-4" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteClient(client.id)} className="flex items-center gap-1">
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
          <DialogContent className="sm:max-w-lg glass-effect">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {currentClient ? 'Edit Client' : 'Add New Client'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div>
                <Label htmlFor="clientName" className="text-base">Client/Business Name</Label>
                <Input id="clientName" name="name" value={clientFormData.name} onChange={handleInputChange} placeholder="e.g., City General Hospital, The Corner Store" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="adminEmail" className="text-base">Admin Email</Label>
                <Input id="adminEmail" name="adminEmail" type="email" value={clientFormData.adminEmail} onChange={handleInputChange} placeholder="admin@clientdomain.com" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="plan" className="text-base">Subscription Plan</Label>
                <select 
                  id="plan" 
                  name="plan" 
                  value={clientFormData.plan} 
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSaveClient} className="flex items-center gap-2">
                <Save className="h-4 w-4" /> {currentClient ? 'Save Changes' : 'Add Client'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}