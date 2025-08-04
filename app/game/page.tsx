'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { Loader2, Trophy, Medal } from 'lucide-react'
import ShareButton from '@/components/ShareButton'
import { RegistrationHeader } from '@/components/registration/RegistrationHeader'

interface ParticipationData {
  id: string
  inscription_id: string
  ocr_montant: string
  created_at: string
}

interface UserData {
  id: string
  nom: string
  prenom: string
  score: number
  rank?: number
}

interface LotData {
  titre: string
  image: string
  instructions: string
}

interface GameResult {
  result: string
  gain: boolean
  lot?: LotData
  reason?: string
}

export default function GamePage() {
  const searchParams = useSearchParams()
  const [participation, setParticipation] = useState<ParticipationData | null>(null)
  const [user, setUser] = useState<UserData | null>(null)
  const [pointsGagnes, setPointsGagnes] = useState<number>(0)
  const [classement, setClassement] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [checkingLot, setCheckingLot] = useState(false)



  const handleRetry = () => {
    window.location.href = '/'
  }

  const checkLotAttribution = async (participationId: string) => {
    setCheckingLot(true)
    try {
      const response = await fetch('https://kgdpgxvhqipihpgyhyux.supabase.co/functions/v1/attribuer-lot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participation_id: participationId
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la vérification du lot')
      }

      const result = await response.json()
      setGameResult(result)
    } catch (err) {
      console.error('Erreur lors de la vérification du lot:', err)
      // On ne bloque pas l'affichage si la vérification échoue
    } finally {
      setCheckingLot(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const participationId = searchParams.get('id')
        
        if (!participationId) {
          setError('ID de participation manquant')
          setLoading(false)
          return
        }

        // Récupérer les données de participation
        const { data: participationData, error: participationError } = await supabase
          .from('participation')
          .select('*')
          .eq('id', participationId)
          .single()

        if (participationError) {
          throw new Error('Erreur lors de la récupération de la participation')
        }

        setParticipation(participationData)

        // Récupérer les données utilisateur
        const { data: userData, error: userError } = await supabase
          .from('inscription')
          .select('*')
          .eq('id', participationData.inscription_id)
          .single()

        if (userError) {
          throw new Error('Erreur lors de la récupération des données utilisateur')
        }

        setUser(userData)

        // Calculer les points gagnés
        const montant = parseFloat(participationData.ocr_montant)
        const montantArrondi = Math.ceil(montant)
        const points =  100 * 3 
        setPointsGagnes(points)

        // Récupérer le classement
        const { data: rankingData, error: rankingError } = await supabase
          .from('inscription')
          .select('id, score')
          .order('score', { ascending: false })

        if (rankingError) {
          throw new Error('Erreur lors de la récupération du classement')
        }

        // Trouver la position de l'utilisateur
        const userRank = rankingData.findIndex(user => user.id === participationData.inscription_id) + 1
        setClassement(userRank)

        // Vérifier si l'utilisateur a gagné un lot
        await checkLotAttribution(participationId)

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement de votre participation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">Erreur</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!participation || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Aucune donnée trouvée</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <RegistrationHeader />
      
      <div className=" flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 text-center">
          {/* Titre principal */}
          <h1 className="text-2xl font-bold text-black mb-6">
            Ton ticket a bien été enregistré et te rapporte
          </h1>

          {/* Points gagnés */}
          <div className="mb-8">
            <div className="relative text-white px-6 py-4 transform rotate-1 " style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='274' height='73' viewBox='0 0 274 73' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0.000167611 0.691636L270.281 7.0776L273.426 54.8444L4.73061 72.5361L0.000167611 0.691636Z' fill='%2301C9E7'/%3E%3C/svg%3E")`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              minHeight: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div className="transform -rotate-1">
                <p className="text-3xl font-bold">{pointsGagnes} points !</p>
              </div>
            </div>
          </div>

          {/* Classement */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              {classement <= 3 ? (
                <Trophy className="h-6 w-6 text-yellow-500" />
              ) : (
                <Medal className="h-6 w-6 text-gray-400" />
              )}
              <p className="text-lg font-semibold text-black-700">
                {classement === 1 ? '1er' : 
                 classement === 2 ? '2e' : 
                 classement === 3 ? '3e' : 
                 `${classement}e`} du classement
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Score total : {user.score} points
            </p>
          </div>

          {/* Section Surprise - Lot gagné */}
          {checkingLot && (
            <div className="mb-6 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600">Vérification de ton lot...</p>
            </div>
          )}

          {gameResult && gameResult.gain && gameResult.lot && (
            <div className="mb-6 p-4  ">
              <h2 className="text-xl font-bold text-black mb-3 text-center">Et une surprise !</h2>
              <p className="text-black mb-4 text-center">
                En plus de tes points, tu gagnes <span className="font-semibold">{gameResult.lot.titre}</span>
              </p>
              
              {/* Image du lot */}
              {gameResult.lot.image && (
                <div className="flex justify-center mb-4">
                  <img 
                    src={gameResult.lot.image} 
                    alt={gameResult.lot.titre}
                    className="max-w-full h-auto max-h-48 object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
              
              <p className="text-sm text-black leading-relaxed text-center">
                Un e-mail vient de t'être envoyé avec toutes les instructions pour récupérer ton lot. 
                Pense à vérifier tes spams si tu ne le vois pas dans ta boîte de réception !
              </p>
            </div>
          )}

          <div className="flex flex-col items-center gap-4 mt-6">
            <button
              className="font-bold py-2 px-4"
              style={{ 
                color: '#FFFF', 
                border: '1px solid white', 
                background: '#01C9E7',
                borderRadius: '4px',
                boxShadow: '2px 2px 0 0 #015D6B',
                textTransform: 'uppercase'
              }}
              onClick={handleRetry}
            >
              Retente ma chance
            </button>
            <div className="mt-[20px]">
              <ShareButton inscriptionId={participation.inscription_id || "demo"} canal="whatsapp" shareUrl={typeof window !== 'undefined' ? window.location.origin + '/' : ''}>
                <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                  <path d="M9.52831 2.46777C5.82321 2.46777 2.80792 5.37202 2.80661 8.94124C2.80574 10.0826 3.11581 11.1966 3.70371 12.1778L2.75 15.5323L6.31356 14.6321C7.30482 15.1507 8.40701 15.4211 9.52569 15.4204H9.52831C13.2334 15.4204 16.2487 12.5157 16.25 8.94647C16.2509 7.2176 15.5524 5.59019 14.2829 4.36692C13.0139 3.14321 11.3264 2.46821 9.52831 2.46777ZM9.52831 14.3269H9.52613C8.52364 14.3269 7.54032 14.0673 6.68242 13.577L6.47774 13.4603L4.3639 13.9942L4.92829 12.0084L4.79547 11.805C4.23757 10.9541 3.94058 9.9587 3.94105 8.94124C3.94235 5.97429 6.449 3.56127 9.53048 3.56127C11.0225 3.56171 12.4251 4.12218 13.4803 5.13903C14.5355 6.15589 15.116 7.50806 15.1151 8.94603C15.1138 11.913 12.6076 14.3269 9.52787 14.3269H9.52831ZM12.5928 10.2965C12.4247 10.2159 11.599 9.8244 11.4449 9.76997C11.2911 9.7164 11.1792 9.68853 11.0673 9.85053C10.9558 10.0125 10.6336 10.377 10.536 10.4846C10.4376 10.5926 10.3396 10.6057 10.1715 10.5251C10.0034 10.4441 9.46211 10.2734 8.82108 9.72206C8.32158 9.29355 7.98452 8.764 7.88653 8.60156C7.78855 8.44 7.87608 8.35247 7.96013 8.2719C8.03547 8.20005 8.12823 8.08334 8.21184 7.98884C8.29545 7.89434 8.32332 7.82684 8.37994 7.71884C8.43568 7.61127 8.40781 7.51634 8.36556 7.43577C8.32332 7.35434 7.988 6.55827 7.84734 6.23471C7.71147 5.91942 7.57298 5.96166 7.46977 5.95643C7.37179 5.95208 7.26031 5.95077 7.14752 5.95077C7.03647 5.95077 6.854 5.99127 6.69984 6.15327C6.54611 6.31527 6.11194 6.70634 6.11194 7.5024C6.11194 8.2989 6.71377 9.06797 6.79782 9.17597C6.88187 9.28353 7.98234 10.9179 9.66723 11.619C10.0679 11.785 10.3805 11.8847 10.6249 11.9596C11.0272 12.0828 11.3935 12.065 11.6826 12.0236C12.0049 11.977 12.6764 11.6325 12.8158 11.255C12.956 10.8774 12.956 10.5534 12.9142 10.4859C12.8733 10.4184 12.7609 10.3779 12.5928 10.2965Z" fill="white"/>
                </svg> Partager ce jeu À mes amis !
              </ShareButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
