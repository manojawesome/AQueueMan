
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'queue_system_data';

const initialBusinessConfig = {
  name: 'MQ System',
  logoUrl: '',
  themeColor: '#14B8A6',
  businessType: 'hospital', 
  typeSpecificSettings: {}, 
};

const initialDepartmentsData = [
  { id: 'general', name: 'General Medicine', color: '#3b82f6', currentServing: null, avgWaitTime: 15, tokenPrefix: 'GEN' },
  { id: 'emergency', name: 'Emergency', color: '#ef4444', currentServing: null, avgWaitTime: 5, tokenPrefix: 'EMG' },
  { id: 'cardiology', name: 'Cardiology', color: '#8b5cf6', currentServing: null, avgWaitTime: 25, tokenPrefix: 'CAR' },
  { id: 'orthopedics', name: 'Orthopedics', color: '#06b6d4', currentServing: null, avgWaitTime: 20, tokenPrefix: 'ORT' },
  { id: 'pediatrics', name: 'Pediatrics', color: '#10b981', currentServing: null, avgWaitTime: 18, tokenPrefix: 'PED' },
  { id: 'pharmacy', name: 'Pharmacy', color: '#f59e0b', currentServing: null, avgWaitTime: 10, tokenPrefix: 'PHA' }
];

export function useQueueSystem() {
  const [businessConfig, setBusinessConfig] = useState(initialBusinessConfig);
  const [departments, setDepartments] = useState(initialDepartmentsData);
  const [queue, setQueue] = useState([]);
  const [completedTokens, setCompletedTokens] = useState([]);
  const [tokenCounter, setTokenCounter] = useState(1);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setBusinessConfig(data.businessConfig || initialBusinessConfig);
        setDepartments(data.departments || initialDepartmentsData);
        setQueue(data.queue || []);
        setCompletedTokens(data.completedTokens || []);
        setTokenCounter(data.tokenCounter || 1);
      } catch (error) {
        console.error('Error loading queue data:', error);
      }
    }
  }, []);

  useEffect(() => {
    const dataToSave = {
      businessConfig,
      departments,
      queue,
      completedTokens,
      tokenCounter
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [businessConfig, departments, queue, completedTokens, tokenCounter]);

  const updateBusinessConfig = useCallback((newConfig) => {
    setBusinessConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const addDepartment = useCallback((newDepartment) => {
    setDepartments(prev => [...prev, { ...newDepartment, id: Date.now().toString(), currentServing: null }]);
  }, []);

  const updateDepartment = useCallback((departmentId, updatedData) => {
    setDepartments(prev => prev.map(dept => dept.id === departmentId ? { ...dept, ...updatedData } : dept));
  }, []);

  const removeDepartment = useCallback((departmentId) => {
    setDepartments(prev => prev.filter(dept => dept.id !== departmentId));
    setQueue(prev => prev.filter(token => token.department !== departmentId));
  }, []);


  const generateToken = useCallback((customerName, departmentId, priority = 'medium', appointmentTime = null, serviceType = null) => {
    const departmentInfo = departments.find(d => d.id === departmentId);
    if (!departmentInfo) return null;

    const tokenPrefix = departmentInfo.tokenPrefix || departmentId.substring(0,3).toUpperCase();

    const token = {
      id: `${tokenPrefix}-${String(tokenCounter).padStart(3, '0')}`,
      number: tokenCounter,
      customerName,
      department: departmentId,
      departmentName: departmentInfo.name,
      priority,
      status: 'waiting',
      createdAt: new Date().toISOString(),
      appointmentTime,
      estimatedWaitTime: departmentInfo.avgWaitTime,
      serviceType 
    };

    setQueue(prev => {
      const newQueue = [...prev, token];
      return newQueue.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
    });

    setTokenCounter(prev => prev + 1);
    return token;
  }, [departments, tokenCounter]);

  const callNextToken = useCallback((departmentId) => {
    const departmentQueue = queue.filter(token => 
      token.department === departmentId && token.status === 'waiting'
    );

    if (departmentQueue.length === 0) return null;

    const nextToken = departmentQueue[0];
    
    setQueue(prev => prev.map(token => 
      token.id === nextToken.id 
        ? { ...token, status: 'serving', servedAt: new Date().toISOString() }
        : token
    ));

    setDepartments(prev => prev.map(dept => 
      dept.id === departmentId 
        ? { ...dept, currentServing: nextToken.id }
        : dept
    ));

    return nextToken;
  }, [queue]);

  const completeToken = useCallback((tokenId) => {
    const token = queue.find(t => t.id === tokenId);
    if (!token) return;

    const completedToken = {
      ...token,
      status: 'completed',
      completedAt: new Date().toISOString()
    };

    setQueue(prev => prev.filter(t => t.id !== tokenId));
    setCompletedTokens(prev => [completedToken, ...prev]);
    
    setDepartments(prev => prev.map(dept => 
      dept.currentServing === tokenId 
        ? { ...dept, currentServing: null }
        : dept
    ));
  }, [queue]);

  const cancelToken = useCallback((tokenId) => {
    setQueue(prev => prev.filter(t => t.id !== tokenId));
  }, []);

  const getQueueStats = useCallback(() => {
    const totalWaiting = queue.filter(t => t.status === 'waiting').length;
    const totalServing = queue.filter(t => t.status === 'serving').length;
    const totalCompleted = completedTokens.length;
    const avgWaitTime = departments.length > 0 ? departments.reduce((acc, dept) => acc + dept.avgWaitTime, 0) / departments.length : 0;

    return {
      totalWaiting,
      totalServing,
      totalCompleted,
      avgWaitTime: Math.round(avgWaitTime)
    };
  }, [queue, completedTokens, departments]);

  const getDepartmentQueue = useCallback((departmentId) => {
    return queue.filter(token => token.department === departmentId);
  }, [queue]);

  const getTokenPosition = useCallback((tokenId) => {
    const token = queue.find(t => t.id === tokenId);
    if (!token || token.status !== 'waiting') return 0;

    const departmentQueue = queue.filter(t => 
      t.department === token.department && 
      t.status === 'waiting'
    );

    return departmentQueue.findIndex(t => t.id === tokenId) + 1;
  }, [queue]);

  return {
    businessConfig,
    departments,
    queue,
    completedTokens,
    generateToken,
    callNextToken,
    completeToken,
    cancelToken,
    getQueueStats,
    getDepartmentQueue,
    getTokenPosition,
    updateBusinessConfig,
    addDepartment,
    updateDepartment,
    removeDepartment
  };
}