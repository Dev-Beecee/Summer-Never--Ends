'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { ParticipationForm } from '@/components/participation/ParticipationForm'
import { UserProfileCard } from '@/components/userprofilecard/UserProfileCard'
import { RegistrationHeader } from '@/components/registration/RegistrationHeader'

export default function ParticipationPage() {
    const searchParams = useSearchParams()
    const [inscriptionId, setInscriptionId] = useState<string | null>(null)

    useEffect(() => {
        // Récupérer l'ID depuis l'URL ou le localStorage
        const idFromUrl = searchParams.get('id')
        const idFromStorage = typeof window !== 'undefined' ? localStorage.getItem('inscription_id') : null
        const id = idFromUrl || idFromStorage

        if (id) {
            setInscriptionId(id)
            // Stocker l'ID dans le localStorage si venant de l'URL
            if (idFromUrl && !idFromStorage && typeof window !== 'undefined') {
                localStorage.setItem('inscription_id', idFromUrl)
            }
        }
    }, [searchParams])

    const unauthorizedContent = useMemo(() => (
        <main className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
            <div className="max-w-md text-center">
                <h1 className="text-2xl font-bold mb-4">Accès non autorisé</h1>
                <p className="text-gray-600">
                    Vous devez vous inscrire avant de pouvoir participer.
                </p>
            </div>
        </main>
    ), [])

    if (!inscriptionId) {
        return unauthorizedContent
    }

    return (
        <main className="min-h-screen">
            <div className="max-w-4xl mx-auto w-full h-full">
                <RegistrationHeader />
                <div className="flex justify-between items-center h-full w-full">
                    <UserProfileCard inscriptionId={inscriptionId} />
                </div>
            </div>
        </main>
    )
}