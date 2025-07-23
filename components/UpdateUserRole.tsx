import React, { useState } from 'react';
import { supabase } from '../lib/supabase-client';

const UpdateUserRole = () => {
    const [email, setEmail] = useState('dev@beecee.fr');
    const [userId, setUserId] = useState('11c3654a-d25d-4617-8ded-e4766b4c3878');
    const [role, setRole] = useState('admin');
    const [message, setMessage] = useState('');

    const handleUpdateRole = async () => {
        const { data, error } = await supabase.auth.updateUser({
            email: email,
            data: {
                role: role
            }
        });

        if (error) {
            setMessage(`Erreur: ${error.message}`);
        } else {
            setMessage('Rôle mis à jour avec succès!');
        }
    };

    return (
        <div>
            <h2>Mettre à jour le rôle de l'utilisateur</h2>
            <button onClick={handleUpdateRole}>Mettre à jour le rôle</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default UpdateUserRole; 