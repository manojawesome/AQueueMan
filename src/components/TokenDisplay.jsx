
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export function TokenDisplay({ token, position, department }) {
  if (!token) return null;

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'text-blue-400';
      case 'serving': return 'text-green-400';
      case 'completed': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fade-in"
    >
      <Card className="token-display max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-6"
          >
            <div className="text-6xl font-bold text-primary mb-2">
              {token.id}
            </div>
            <Badge 
              className={`${getPriorityColor(token.priority)} text-white text-sm px-3 py-1`}
            >
              {token.priority.toUpperCase()} PRIORITY
            </Badge>
          </motion.div>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-medium">{token.customerName}</span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg">{token.departmentName}</span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>Created: {formatTime(token.createdAt)}</span>
            </div>

            {token.appointmentTime && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-400">
                  Appointment: {formatTime(token.appointmentTime)}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <p className={`text-xl font-bold ${getStatusColor(token.status)}`}>
                {token.status === 'waiting' && `Position: #${position}`}
                {token.status === 'serving' && 'NOW SERVING'}
                {token.status === 'completed' && 'COMPLETED'}
              </p>
              
              {token.status === 'waiting' && (
                <p className="text-sm text-muted-foreground mt-2">
                  Estimated wait: {token.estimatedWaitTime * position} minutes
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
