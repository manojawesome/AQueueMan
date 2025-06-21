
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, AlertCircle, Play, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

export function QueueDisplay({ 
  queue, 
  departments, 
  onCallNext, 
  onCompleteToken, 
  onCancelToken,
  getTokenPosition 
}) {
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <User className="h-4 w-4 text-green-500" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'queue-card';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'waiting': return 'status-waiting';
      case 'serving': return 'status-serving';
      default: return 'queue-card';
    }
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCallNext = (departmentId) => {
    const token = onCallNext(departmentId);
    if (token) {
      toast({
        title: "Token Called! 📢",
        description: `Now serving: ${token.id} - ${token.customerName}`,
      });
    } else {
      toast({
        title: "No tokens waiting",
        description: "There are no tokens in the queue for this department",
        variant: "destructive"
      });
    }
  };

  const handleCompleteToken = (tokenId, customerName) => {
    onCompleteToken(tokenId);
    toast({
      title: "Token Completed! ✅",
      description: `Service completed for ${customerName}`,
    });
  };

  const handleCancelToken = (tokenId, customerName) => {
    onCancelToken(tokenId);
    toast({
      title: "Token Cancelled",
      description: `Token cancelled for ${customerName}`,
      variant: "destructive"
    });
  };

  const groupedQueue = departments.map(dept => ({
    ...dept,
    tokens: queue.filter(token => token.department === dept.id)
  }));

  return (
    <div className="space-y-6">
      {groupedQueue.map((department) => (
        <motion.div
          key={department.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fade-in"
        >
          <Card className="department-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: department.color }}
                  />
                  {department.name}
                  <Badge variant="secondary">
                    {department.tokens.filter(t => t.status === 'waiting').length} waiting
                  </Badge>
                </CardTitle>
                <Button 
                  onClick={() => handleCallNext(department.id)}
                  className="flex items-center gap-2"
                  disabled={department.tokens.filter(t => t.status === 'waiting').length === 0}
                >
                  <Play className="h-4 w-4" />
                  Call Next
                </Button>
              </div>
              {department.currentServing && (
                <div className="mt-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-sm font-medium text-green-400">
                    Currently Serving: {department.currentServing}
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                {department.tokens.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No tokens in queue
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {department.tokens.map((token, index) => (
                      <motion.div
                        key={token.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border ${getPriorityClass(token.priority)} ${getStatusClass(token.status)} slide-in`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-bold text-primary">
                              {token.id}
                            </div>
                            <div>
                              <p className="font-medium">{token.customerName}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {getPriorityIcon(token.priority)}
                                <span className="capitalize">{token.priority} Priority</span>
                                <span>•</span>
                                <span>Created: {formatTime(token.createdAt)}</span>
                                {token.status === 'waiting' && (
                                  <>
                                    <span>•</span>
                                    <span>Position: #{getTokenPosition(token.id)}</span>
                                  </>
                                )}
                              </div>
                              {token.appointmentTime && (
                                <p className="text-sm text-blue-400">
                                  Appointment: {formatTime(token.appointmentTime)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={token.status === 'serving' ? 'default' : 'secondary'}
                              className={token.status === 'serving' ? 'bg-green-500' : ''}
                            >
                              {token.status === 'serving' ? 'Serving' : 'Waiting'}
                            </Badge>
                            {token.status === 'serving' && (
                              <Button
                                size="sm"
                                onClick={() => handleCompleteToken(token.id, token.customerName)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancelToken(token.id, token.customerName)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
