
// src/contexts/FaultContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import faultService from '../services/faultsService';
import { useNotify } from './NotificationContext';
import { retry, sortFaultsByOpenAndCreateDate } from '../utils';

const FaultContext = createContext();

export function FaultProvider({ children }) {
    const notify = useNotify();
    const [faults, setFaults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all faults once
    const fetchFaults = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await retry(() => faultService.getAll());
            setFaults(data);
        } catch (err) {
            setError(err);
            notify.error('Failed to load faults');
        } finally {
            setLoading(false);
        }
    }, [notify]);

    useEffect(() => {
        fetchFaults();
    }, [fetchFaults]);

    const createFault = useCallback(async (faultData) => {
        try {
            const newFault = await retry(() => faultService.create(faultData));
            setFaults(prev => [...prev, newFault]);
        } catch (err) {
            setError(err);
            notify.error('Failed to create fault');
        }
    }, [notify]);

    const updateFault = useCallback(async (id, updates) => {
        try {
            const updated = await retry(() => faultService.update(id, updates));
            setFaults(prev => prev.map(f => f._id === id ? updated : f));
        } catch (err) {
            setError(err);
            notify.error('Failed to update fault');
        }
    }, [notify]);

    const deleteFault = useCallback(async (id) => {
        try {
            await retry(() => faultService.delete(id));
            setFaults(prev => prev.filter(f => f._id !== id));
        } catch (err) {
            setError(err);
            notify.error('Failed to delete fault');
        }
    }, [notify]);

    // const closeFault = useCallback((id) => updateFault(id, { status: 'closed' }), [updateFault]);
    const closeFault = useCallback(async (id, updates) => {
        try {
            const updated = await retry(() => faultService.close(id));
            setFaults(prev => prev.map(f => f._id === id ? updated : f));
        } catch (err) {
            setError(err);
            notify.error('Failed to close fault');
        }
    }, [notify]);

    const value = useMemo(() => ({
        faults,
        loading,
        error,
        fetchFaults,
        createFault,
        updateFault,
        deleteFault,
        closeFault,
    }), [faults, loading, error, fetchFaults, createFault, updateFault, deleteFault, closeFault]);

    return <FaultContext.Provider value={value}>{children}</FaultContext.Provider>;
}

export function useFault(toolId) {
    const context = useContext(FaultContext);
    if (!context) throw new Error('useFault must be used within FaultProvider');
    const { faults, ...rest } = context;
    if (faults == null || faults === undefined) {
        console.warn('Faults not available in context');
        return { faults: [], ...rest };
    }
    if (faults.length === 0) {
        console.warn('No faults available in context');
        return { faults: [], ...rest };
    }
    const filteredFaults = toolId ?
        faults.filter(f => {
            const t = f.tool;
            if (!t) {
                console.warn(`Fault ${f._id} has no associated tool`);
                return false;
            }
            return (
                (typeof t === 'string' ? t : t._id)
                === toolId
            );
        })
        : faults;
    const sortedFaults = sortFaultsByOpenAndCreateDate(filteredFaults);
    return { faults: sortedFaults, ...rest };
}