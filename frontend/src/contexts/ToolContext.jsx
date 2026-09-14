// src/contexts/ToolContext.jsx
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from 'react';
import toolsService from '../services/toolsService';
import { useNotify } from './NotificationContext';
import { useAuth } from './AuthContext';
import { retry, sortToolsByLocalSerial } from '../utils';

const ToolContext = createContext();

export function ToolProvider({ children }) {
    const notify = useNotify();
    const { user } = useAuth();
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTools = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const data = await retry(() => toolsService.getAll());
            setTools(Array.isArray(data) ? data : (data.tools || []));
        } catch (err) {
            setError(err);
            notify.error('Failed to load tools');
        } finally {
            setLoading(false);
        }
    }, [user, notify]);

    const createTool = useCallback(async (toolData) => {
        try {
            const newTool = await retry(() => toolsService.create(toolData));
            setTools(prev => [newTool, ...prev]);
            notify.success('Tool created successfully');
            return newTool;
        } catch (err) {
            setError(err);
            notify.error('Failed to create tool');
            throw err;
        }
    }, [notify]);

    const updateTool = useCallback(async (id, updates) => {
        try {
            const updated = await retry(() => toolsService.update(id, updates));
            setTools(prev => prev.map(t => (t._id === id ? updated : t)));
            notify.success('Tool updated successfully');
            return updated;
        } catch (err) {
            setError(err);
            notify.error('Failed to update tool');
            throw err;
        }
    }, [notify]);

    const deleteTool = useCallback(async (id) => {
        try {
            await retry(() => toolsService.delete(id));
            setTools(prev => prev.filter(t => t._id !== id));
            notify.success('Tool deleted');
        } catch (err) {
            setError(err);
            notify.error('Failed to delete tool');
            throw err;
        }
    }, [notify]);

    useEffect(() => {
        if (user) {
            fetchTools();
        } else {
            setTools([]);
            setError(null);
            setLoading(false);
        }
    }, [user, fetchTools]);

    const value = useMemo(() => ({
        tools,
        loading,
        error,
        fetchTools,
        createTool,
        updateTool,
        deleteTool,
    }), [tools, loading, error, fetchTools, createTool, updateTool, deleteTool]);

    return (
        <ToolContext.Provider value={value}>
            {children}
        </ToolContext.Provider>
    );
}

export function useTool() {
    const context = useContext(ToolContext);
    if (!context) {
        throw new Error('useTool must be used within a ToolProvider');
    }

    const { tools, ...rest } = context;
    const sortedTools = useMemo(() => sortToolsByLocalSerial(tools || []), [tools]);

    return { tools: sortedTools, ...rest };
}

export default ToolContext;