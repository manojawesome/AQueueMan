
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Clock, Play, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

export function DepartmentOverview({ departments, getDepartmentQueue, onCallNext }) {
  const handleCallNext = (departmentId, departmentName) => {
    const token = onCallNext(departmentId);
    if (token) {
      toast({
        title: "Token Called! 📢",
        description: `Now serving: ${token.id} in ${departmentName}`,
      });
    } else {
      toast({
        title: "No tokens waiting",
        description: `No tokens in queue for ${departmentName}`,
        variant: "destructive"
      });
    }
  };

  const handleSettings = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {departments.map((department, index) => {
        const departmentQueue = getDepartmentQueue(department.id);
        const waitingCount = departmentQueue.filter(t => t.status === 'waiting').length;
        const servingCount = departmentQueue.filter(t => t.status === 'serving').length;

        return (
          <motion.div
            key={department.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="fade-in"
          >
            <Card className="department-card h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: department.color }}
                    />
                    {department.name}
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSettings}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Users className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{waitingCount}</p>
                    <p className="text-sm text-muted-foreground">Waiting</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <Play className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{servingCount}</p>
                    <p className="text-sm text-muted-foreground">Serving</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Avg wait: {department.avgWaitTime} minutes</span>
                </div>

                {department.currentServing && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-sm font-medium text-green-400">
                      Currently Serving
                    </p>
                    <p className="text-lg font-bold">{department.currentServing}</p>
                  </div>
                )}

                <Button 
                  className="w-full"
                  onClick={() => handleCallNext(department.id, department.name)}
                  disabled={waitingCount === 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Call Next Token
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
