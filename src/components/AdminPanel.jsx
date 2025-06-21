
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/components/ui/use-toast';
import { PlusCircle, Trash2, Edit3, Save, Palette, Building, Tag, Briefcase, Store, Landmark, ShieldPlus, Stethoscope, ShoppingBag, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';

const businessTypeSpecifics = {
  hospital: {
    departmentLabel: "Departments",
    departmentIcon: Stethoscope,
    serviceTypesLabel: "Appointment Types",
    defaultServiceTypes: ["Consultation", "Check-up", "Procedure", "Vaccination"],
  },
  store: {
    departmentLabel: "Sections / Aisles",
    departmentIcon: ShoppingBag,
    serviceTypesLabel: "Service Points",
    defaultServiceTypes: ["Checkout", "Customer Service", "Returns", "Click & Collect"],
  },
  bank: {
    departmentLabel: "Counters / Services",
    departmentIcon: Coins,
    serviceTypesLabel: "Transaction Types",
    defaultServiceTypes: ["Deposit", "Withdrawal", "Enquiries", "Loan Application"],
  }
};

export function AdminPanel({ businessConfig, departments, onUpdateBusinessConfig, onAddDepartment, onUpdateDepartment, onRemoveDepartment }) {
  const [config, setConfig] = useState(businessConfig);
  const [newDepartment, setNewDepartment] = useState({ name: '', color: '#3b82f6', avgWaitTime: 15, tokenPrefix: '' });
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [typeSpecificServices, setTypeSpecificServices] = useState(businessConfig.typeSpecificSettings?.serviceTypes || []);
  const [newServiceType, setNewServiceType] = useState('');

  useEffect(() => {
    setConfig(businessConfig);
    const currentSpecifics = businessTypeSpecifics[businessConfig.businessType] || businessTypeSpecifics.hospital;
    setTypeSpecificServices(businessConfig.typeSpecificSettings?.serviceTypes || currentSpecifics.defaultServiceTypes || []);
  }, [businessConfig]);

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleBusinessTypeChange = (value) => {
    const currentSpecifics = businessTypeSpecifics[value] || businessTypeSpecifics.hospital;
    setConfig(prev => ({
      ...prev,
      businessType: value,
      typeSpecificSettings: {
        ...prev.typeSpecificSettings,
        serviceTypes: currentSpecifics.defaultServiceTypes || []
      }
    }));
    setTypeSpecificServices(currentSpecifics.defaultServiceTypes || []);
  };
  
  const handleSaveConfig = () => {
    onUpdateBusinessConfig({ ...config, typeSpecificSettings: { ...config.typeSpecificSettings, serviceTypes: typeSpecificServices } });
    toast({ title: "Configuration Saved!", description: "Business settings updated successfully." });
  };

  const handleNewDepartmentChange = (e) => {
    const { name, value } = e.target;
    setNewDepartment(prev => ({ ...prev, [name]: name === 'avgWaitTime' ? parseInt(value) || 0 : value }));
  };

  const handleAddOrUpdateDepartment = () => {
    if (!newDepartment.name.trim() || !newDepartment.tokenPrefix.trim()) {
      toast({ title: "Error", description: "Department name and token prefix are required.", variant: "destructive" });
      return;
    }
    if (editingDepartment) {
      onUpdateDepartment(editingDepartment.id, newDepartment);
      toast({ title: "Department Updated!", description: `${newDepartment.name} updated successfully.` });
    } else {
      onAddDepartment(newDepartment);
      toast({ title: "Department Added!", description: `${newDepartment.name} added successfully.` });
    }
    setNewDepartment({ name: '', color: '#3b82f6', avgWaitTime: 15, tokenPrefix: '' });
    setEditingDepartment(null);
    setIsDeptModalOpen(false);
  };

  const openEditDepartmentModal = (dept) => {
    setEditingDepartment(dept);
    setNewDepartment({ name: dept.name, color: dept.color, avgWaitTime: dept.avgWaitTime, tokenPrefix: dept.tokenPrefix });
    setIsDeptModalOpen(true);
  };

  const openAddDepartmentModal = () => {
    setEditingDepartment(null);
    setNewDepartment({ name: '', color: '#3b82f6', avgWaitTime: 15, tokenPrefix: '' });
    setIsDeptModalOpen(true);
  };

  const handleAddServiceType = () => {
    if (newServiceType.trim() && !typeSpecificServices.includes(newServiceType.trim())) {
      setTypeSpecificServices(prev => [...prev, newServiceType.trim()]);
      setNewServiceType('');
    }
  };

  const handleRemoveServiceType = (serviceToRemove) => {
    setTypeSpecificServices(prev => prev.filter(service => service !== serviceToRemove));
  };

  const currentBusinessTypeSpecifics = businessTypeSpecifics[config.businessType] || businessTypeSpecifics.hospital;
  const DepartmentIcon = currentBusinessTypeSpecifics.departmentIcon;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 fade-in">
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="h-6 w-6 text-primary" /> Business Customization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="name">Business Name</Label>
            <Input id="name" name="name" value={config.name} onChange={handleConfigChange} placeholder="Your Hospital/Shop Name" />
          </div>
          <div>
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input id="logoUrl" name="logoUrl" value={config.logoUrl} onChange={handleConfigChange} placeholder="https://example.com/logo.png" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="themeColor">Theme Color</Label>
              <Input id="themeColor" name="themeColor" type="color" value={config.themeColor} onChange={handleConfigChange} className="w-full h-10 p-1" />
            </div>
            <div>
              <Label htmlFor="businessType">Business Type</Label>
              <Select value={config.businessType} onValueChange={handleBusinessTypeChange}>
                <SelectTrigger id="businessType">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hospital"><div className="flex items-center gap-2"><Stethoscope className="h-4 w-4" /> Hospital</div></SelectItem>
                  <SelectItem value="store"><div className="flex items-center gap-2"><Store className="h-4 w-4" /> Store</div></SelectItem>
                  <SelectItem value="bank"><div className="flex items-center gap-2"><Landmark className="h-4 w-4" /> Bank</div></SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveConfig} className="flex items-center gap-2"><Save className="h-4 w-4" /> Save Configuration</Button>
        </CardFooter>
      </Card>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldPlus className="h-6 w-6 text-primary" /> {currentBusinessTypeSpecifics.serviceTypesLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder={`Add new ${currentBusinessTypeSpecifics.serviceTypesLabel.slice(0,-1).toLowerCase()}`} 
              value={newServiceType}
              onChange={(e) => setNewServiceType(e.target.value)}
            />
            <Button onClick={handleAddServiceType} variant="outline"><PlusCircle className="h-4 w-4 mr-2" />Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {typeSpecificServices.map(service => (
                <motion.div key={service} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                  <Badge variant="secondary" className="text-sm py-1 px-3">
                    {service}
                    <Button variant="ghost" size="icon" className="ml-1 h-5 w-5" onClick={() => handleRemoveServiceType(service)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
            {typeSpecificServices.length === 0 && <p className="text-sm text-muted-foreground">No service types configured yet.</p>}
          </div>
        </CardContent>
         <CardFooter>
          <Button onClick={handleSaveConfig} className="flex items-center gap-2"><Save className="h-4 w-4" /> Save Service Types</Button>
        </CardFooter>
      </Card>

      <Card className="glass-effect">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><DepartmentIcon className="h-6 w-6 text-primary" /> {currentBusinessTypeSpecifics.departmentLabel} Management</CardTitle>
          <Button onClick={openAddDepartmentModal} variant="outline" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> Add {currentBusinessTypeSpecifics.departmentLabel.slice(0,-1)}
          </Button>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {departments.length === 0 && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-muted-foreground text-center py-4">
                No {currentBusinessTypeSpecifics.departmentLabel.toLowerCase()} configured yet. Add one to get started!
              </motion.p>
            )}
          </AnimatePresence>
          <div className="space-y-3">
            <AnimatePresence>
              {departments.map(dept => (
                <motion.div
                  key={dept.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center justify-between p-3 rounded-md border bg-card/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }}></div>
                    <div>
                      <p className="font-medium">{dept.name} <Badge variant="secondary" className="ml-1">{dept.tokenPrefix}</Badge></p>
                      <p className="text-xs text-muted-foreground">Avg. Wait: {dept.avgWaitTime} min</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDepartmentModal(dept)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onRemoveDepartment(dept.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDeptModalOpen} onOpenChange={setIsDeptModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingDepartment ? 'Edit' : 'Add New'} {currentBusinessTypeSpecifics.departmentLabel.slice(0,-1)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="deptName">{currentBusinessTypeSpecifics.departmentLabel.slice(0,-1)} Name</Label>
              <Input id="deptName" name="name" value={newDepartment.name} onChange={handleNewDepartmentChange} placeholder={`e.g., Cardiology / Aisle 5 / Counter 2`} />
            </div>
            <div>
              <Label htmlFor="tokenPrefix">Token Prefix (3 chars)</Label>
              <Input id="tokenPrefix" name="tokenPrefix" value={newDepartment.tokenPrefix} onChange={handleNewDepartmentChange} placeholder="e.g., CAR / A05 / C02" maxLength={3} />
            </div>
            <div>
              <Label htmlFor="deptColor">Color</Label>
              <Input id="deptColor" name="color" type="color" value={newDepartment.color} onChange={handleNewDepartmentChange} className="w-full h-10 p-1" />
            </div>
            <div>
              <Label htmlFor="avgWaitTime">Average Wait Time (minutes)</Label>
              <Input id="avgWaitTime" name="avgWaitTime" type="number" value={newDepartment.avgWaitTime} onChange={handleNewDepartmentChange} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddOrUpdateDepartment} className="flex items-center gap-2">
              <Save className="h-4 w-4" /> {editingDepartment ? 'Save Changes' : `Add ${currentBusinessTypeSpecifics.departmentLabel.slice(0,-1)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
