/**
 * ToolContext provides CRUD operations and state management for tools within the application.
 * @module ToolContext
 */

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo
} from 'react';
import toolsService from '../services/toolsService';
import { useNotify } from './NotificationContext';
import { retry, sortToolsByLocalSerial } from '../utils';

// Create the context to hold tool state and operations
const ToolContext = createContext();

/**
 * Provider component that supplies tool data and operations to its children.
 *
 * @param {object} props - React props
 * @param {React.ReactNode} props.children - Child components that consume the context
 */
export function ToolProvider({ children }) {
    const notify = useNotify();
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetch all tools from the API and update state.
     * Retries on failure according to retry utility policy.
     *
     * @async
     * @function fetchTools
     * @returns {Promise<void>}
     */
    const fetchTools = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await retry(() => toolsService.getAll());
            setTools(data);
        } catch (err) {
            setError(err);
            notify.error('Failed to load tools');
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Create a new tool via the API and add it to state.
     *
     * @async
     * @function createTool
     * @param {object} toolData - Data for the new tool
     * @returns {Promise<void>}
     */
    const createTool = useCallback(async (toolData) => {
        try {
            const newTool = await retry(() => toolsService.create(toolData));
            setTools(prev => [...prev, newTool]);
        } catch (err) {
            setError(err);
            notify.error('Failed to create tool');
        }
    }, [notify]);

    /**
     * Update an existing tool via the API and update state.
     *
     * @async
     * @function updateTool
     * @param {string} id - ID of the tool to update
     * @param {object} updates - Partial updates for the tool
     * @returns {Promise<void>}
     */
    const updateTool = useCallback(async (id, updates) => {
        try {
            const updated = await retry(() => toolsService.update(id, updates));
            setTools(prev => prev.map(t => (t._id === id ? updated : t)));
        } catch (err) {
            setError(err);
            notify.error('Failed to update tool');
        }
    }, [notify]);

    /**
     * Delete a tool via the API and remove it from state.
     *
     * @async
     * @function deleteTool
     * @param {string} id - ID of the tool to delete
     * @returns {Promise<void>}
     */
    const deleteTool = useCallback(async (id) => {
        try {
            await retry(() => toolsService.delete(id));
            setTools(prev => prev.filter(t => t._id !== id));
        } catch (err) {
            setError(err);
            notify.error('Failed to delete tool');
        }
    }, [notify]);

    // On mount, automatically fetch tools
    useEffect(() => {
        fetchTools();
    }, [fetchTools]);

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        tools,
        loading,
        error,
        fetchTools,
        createTool,
        updateTool,
        deleteTool
    }), [tools, loading, error, fetchTools, createTool, updateTool, deleteTool]);

    return (
        <ToolContext.Provider value={value}>
            {children}
        </ToolContext.Provider>
    );
}

/**
 * Custom hook to consume ToolContext.
 * Ensures that tools are sorted by their local serial before returning.
 *
 * @function useTool
 * @returns {object} - Context value with sorted tools and CRUD operations
 */
export function useTool() {
    const context = useContext(ToolContext);
    if (!context) {
        throw new Error('useTool must be used within a ToolProvider');
    }

    // Destructure tools and apply sorting utility
    const { tools, ...rest } = context;
    const sortedTools = sortToolsByLocalSerial(tools);

    return { tools: sortedTools, ...rest };
}