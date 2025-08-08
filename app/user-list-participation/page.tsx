'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog'
import { RegistrationHeader } from '@/components/registration/RegistrationHeader'

interface User {
    prenom: string
    nom: string
    initiale: string
    participationsCount: number
    score: number
    classement: number
    totalInscrits: number
}

interface Lot {
    titre: string
    photo_url?: string
    instructions?: string
}

interface Participation {
    id: string
    image_url: string
    ocr_date_achat: string
    ocr_heure_achat: string
    ocr_montant: number
    ocr_restaurant: string
    contient_menu_mxbo?: string | null
    created_at: string
    statut_validation: string
    raison_invalide?: string | null
    restaurant?: { nom: string } | null
    has_won: boolean
    lot?: Lot | null
    date_attribution?: string | null
    score_ajoute: number
}

interface UserParticipationData {
    user: User
    participations: Participation[]
}

const API_URL = 'https://kgdpgxvhqipihpgyhyux.supabase.co/functions/v1/get-user-participations'

const fetcher = (url: string, inscriptionId: string): Promise<UserParticipationData> =>
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inscription_id: inscriptionId })
    }).then(res => {
        if (!res.ok) {
            throw new Error('Erreur lors de la récupération des données')
        }
        return res.json()
    })

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

const ParticipationCard = ({ participation }: { participation: Participation }) => {

    
    return (
        <div className="bg-[#01C9E7] text-white rounded-lg overflow-hidden">
            <div className="p-4">
                <div className="mb-4">
                    <p className="text-sm mb-1">Restaurant détecté:</p>
                    <h3 className="font-bold text-base">
                        {participation.restaurant?.nom || participation.ocr_restaurant}
                    </h3>
                </div>

                <div className="mb-4">
                    <p className="text-sm mb-1">Date d'achat:</p>
                    <p className="font-bold">
                        {formatDate(participation.ocr_date_achat)} à {participation.ocr_heure_achat}
                    </p>
                </div>

                <div className="mb-4">
                    <p className="text-sm mb-1">Montant:</p>
                    <p className="font-bold">
                        {participation.ocr_montant}€
                    </p>
                </div>

                <div className="bg-white text-[#01C9E7] rounded-md py-2 px-4 text-center font-bold mb-4">
                    + 1 chance de gagner
                </div>

                {participation.has_won && (
                    <>
                        <div className="bg-white text-[#01C9E7] rounded-md py-2 px-4 text-center font-bold mb-4">
                            + {participation.lot?.titre} !
                        </div>
                        
                        {participation.lot?.photo_url && (
                            <div className="flex justify-center mb-4">
                                <div className="w-32 h-32 bg-black rounded-md flex items-center justify-center">
                                    <Image
                                        src={participation.lot.photo_url}
                                        alt={participation.lot.titre}
                                        width={120}
                                        height={120}
                                        className="rounded-md object-cover"
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {participation.has_won && (
                <div className="bg-white mx-4 mb-4 rounded-md">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button 
                                className="w-full bg-[#01C9E7] hover:bg-[#00b8d4] text-white font-bold py-3 rounded-md"
                                style={{ textTransform: 'uppercase' }}
                            >
                                JE SOUHAITE RÉCUPÉRER MON GAIN
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Récupération de votre gain</DialogTitle>
                                <DialogDescription asChild>
                                    <div>
                                        {participation.lot?.instructions
                                            ? <span dangerouslySetInnerHTML={{ __html: participation.lot.instructions }} />
                                            : (
                                                <>
                                                    Félicitations pour votre gain ! Pour récupérer votre lot, veuillez suivre les instructions envoyées à votre adresse e-mail enregistrée.<br />
                                                    Si vous n'avez pas reçu d'e-mail, veuillez contacter notre support client.
                                                </>
                                            )
                                        }
                                    </div>
                                </DialogDescription>
                            </DialogHeader>
                            <Button onClick={() => document.activeElement && (document.activeElement as HTMLElement).blur()}>
                                Fermer
                            </Button>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </div>
    )
}

const LoadingState = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01C9E7] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
        </div>
    </div>
)

const ErrorState = ({ message }: { message: string }) => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p className="font-semibold">Erreur</p>
                <p>{message}</p>
            </div>
        </div>
    </div>
)

export default function UserListParticipation() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const inscriptionId = searchParams.get('inscriptionId')
    const { toast } = useToast()
    const [data, setData] = useState<UserParticipationData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        if (!inscriptionId) {
            setError('ID d\'inscription manquant')
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)
            const response = await fetcher(API_URL, inscriptionId)
            setData(response)
        } catch (error: any) {
            const errorMessage = error.message || 'Une erreur est survenue'
            setError(errorMessage)
            toast({
                title: 'Erreur',
                description: errorMessage,
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }, [inscriptionId, toast])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleBack = useCallback(() => {
        router.back()
    }, [router])

    if (loading) return <LoadingState />
    if (error) return <ErrorState message={error} />
    if (!data) return <ErrorState message="Aucune donnée disponible" />

    const { user, participations } = data
    const formattedName = `${user.prenom} ${user.nom.charAt(0)}.`
    const participationText = user.participationsCount === 1
        ? '1 participation enregistrée'
        : `${user.participationsCount} participations enregistrées`

    return (
        <>
            <RegistrationHeader />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {formattedName}
                            </h1>
                            <p className="text-lg">{participationText}</p>
                        </div>
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 px-4 py-2 bg-[#01C9E7] text-white transition-colors rounded-md hover:bg-[#00b8d4]"
                            style={{ boxShadow: '2px 2px 0px 0px #015D6B' }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Retour
                        </button>
                    </div>

                    {participations?.length > 0 ? (
                        <div className="space-y-6">
                            {participations.map((participation) => (
                                <ParticipationCard key={participation.id} participation={participation} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">Aucune participation enregistrée</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}