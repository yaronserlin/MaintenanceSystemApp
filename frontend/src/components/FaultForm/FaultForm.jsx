// src/components/FaultForm.jsx
import React, { useState } from 'react';
import faultService from '../../services/faultsService';


export default function FaultForm({ onCreated }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const newFault = await faultService.create({ title, description });
            onCreated(newFault);  // lift state up to parent
            setTitle('');
            setDescription('');
        } catch (err) {
            console.error(err);
            alert('Could not report fault.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Report a New Fault</h3>
            <label>
                Title
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />
            </label>
            <label>
                Description
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                />
            </label>
            <button type="submit" disabled={submitting}>
                {submitting ? 'Reporting…' : 'Report Fault'}
            </button>
        </form>
    );
}
