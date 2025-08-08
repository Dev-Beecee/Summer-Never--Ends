'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { supabase } from '@/lib/supabase-client'
import { useToast } from '@/hooks/use-toast'

const fetcher = (url: string, inscriptionId: string) =>
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inscription_id: inscriptionId })
    }).then(res => res.json())

export function UserProfileCard({ inscriptionId }: { inscriptionId: string }) {
    const router = useRouter()
    const { toast } = useToast()

    const { data, error } = useSWR(
        ['https://kgdpgxvhqipihpgyhyux.supabase.co/functions/v1/get-user-participations', inscriptionId],
        ([url, id]) => fetcher(url, id),
        { refreshInterval: 5000 }
    )

    useEffect(() => {
        if (error) {
            toast({
                title: 'Erreur',
                description: error.message,
                variant: 'destructive'
            })
        }
    }, [error, toast])

    if (!data?.user) return null

    const participationCount = data.user.participationsCount || 0
    const prenom = data.user.prenom || 'Participant'

    const handleClick = () => {
        router.push(`/user-list-participation?inscriptionId=${inscriptionId}`)
    }

    // Si pas de participations, ne pas afficher la carte
    if (participationCount === 0) return null

    return (
        <div className="w-full max-w-md mx-auto h-full">
            {/* Encadré bleu avec informations utilisateur */}
            <div className="bg-[#01C9E7] text-white rounded-lg p-6 mb-4 text-center" style={{ boxShadow: '2px 2px 0 0 #015D6B' }}>
                {/* Message personnalisé */}
                <p className="text-white text-sm font-medium mb-4">
                    {prenom}, tu as {participationCount} participation{participationCount > 1 ? 's' : ''} valides donc :
                </p>

                {/* Chances de gagner - Style ruban similaire à l'image */}
                <div className="mb-4">
                    <div className="relative text-white px-6 py-4 transform rotate-1" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='274' height='73' viewBox='0 0 274 73' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0.000167611 0.691636L270.281 7.0776L273.426 54.8444L4.73061 72.5361L0.000167611 0.691636Z' fill='%23FFFFFF'/%3E%3C/svg%3E")`,
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        minHeight: '70px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div className="transform -rotate-1">
                            <h2 className="text-2xl font-bold text-[#01C9E7]">
                                {participationCount} chance{participationCount > 1 ? 's' : ''} de gagner !
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Description du lot */}
                <div className="mb-6">
                    <p className="text-sm">
                        <span className="font-bold uppercase">1 BILLET D'AVION</span> au tirage au sort<br />
                        qui aura lieu le 16 septembre
                    </p>
                </div>

                {/* Bouton Voir mes participations */}
                <button
                    onClick={handleClick}
                    className="inline-flex items-center justify-center font-bold py-2 px-6 bg-white text-[#01C9E7] rounded-md border border-[#01C9E7] hover:shadow-md transition-shadow"
                    style={{ boxShadow: '2px 2px 0 0 #015D6B' }}
                >
                    VOIR MES PARTICIPATIONS
                    <span className="ml-2" aria-hidden>→</span>
                </button>
            </div>

            {/* Bouton Augmente tes chances */}
            <div className="text-center">
                <button
                    onClick={() => router.push('/')}
                    className="font-bold py-2 px-4 bg-[#01C9E7] text-white rounded-md border border-white hover:shadow-md transition-shadow"
                    style={{ boxShadow: '2px 2px 0 0 #015D6B' }}
                >
                    AUGMENTE TES CHANCES<br />AVEC UN NOUVEAU TICKET
                </button>
            </div>
        </div>
    )
}