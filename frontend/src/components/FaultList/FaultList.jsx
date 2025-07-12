// src/components/FaultList.jsx
import React, { useState, useEffect } from 'react';
import faultService from '../../services/faultsService';

export default function FaultList() {
    const [faults, setFaults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        faultService.getAll()
            .then(data => setFaults(data))
            .catch(err => {
                console.error(err);
                setError('Failed to load faults.');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading faults…</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div>
            <h2>Open Faults</h2>
            {faults.length === 0
                ? <p>No faults reported.</p>
                : <ul>
                    {faults.map(f => (
                        <li key={f._id}>
                            <strong>{f.code}</strong> &mdash; {f.status}
                        </li>
                    ))}
                </ul>
            }
        </div>
    );
}
