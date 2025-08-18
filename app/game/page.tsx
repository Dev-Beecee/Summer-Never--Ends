'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { Loader2, Trophy, Medal } from 'lucide-react'
import ShareButton from '@/components/ShareButton'
import { RegistrationHeader } from '@/components/registration/RegistrationHeader'
import Link from 'next/link'

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
  const [participationsCount, setParticipationsCount] = useState<number | null>(null)


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

        // Récupérer le nombre de participations valides pour cet utilisateur (pour les chances de gagner)
        try {
          const countResponse = await fetch(
            'https://kgdpgxvhqipihpgyhyux.supabase.co/functions/v1/get-user-participations',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ inscription_id: participationData.inscription_id })
            }
          )
          const countJson = await countResponse.json()
          const count = countJson?.user?.participationsCount
          if (typeof count === 'number') {
            setParticipationsCount(count)
          }
        } catch (e) {
          // en cas d'erreur, on n'empêche pas l'affichage de la page
        }

        // Calculer les points gagnés
        const montant = parseFloat(participationData.ocr_montant)
        const montantArrondi = Math.ceil(montant)
        const points =  100 
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
          {/* Ligne d'information utilisateur */}
          {user && (
            <p className="text-white text-sm font-medium bg-[#01C9E7] rounded-md py-2 px-4 inline-block mb-4" style={{ boxShadow: '2px 2px 0 0 #015D6B' }}>
              {user.prenom}, tu as {participationsCount ?? 1} participation{(participationsCount ?? 1) > 1 ? 's' : ''} valides donc :
            </p>
          )}

          {/* Titre principal */}
          <h1 className="text-2xl font-bold text-black mb-6">
            Ton ticket a bien été enregistré et te rapporte
          </h1>

          {/* Ruban '1 chance de gagner !' */}
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
                <p className="text-3xl font-bold">{(participationsCount ?? 1)} chance{(participationsCount ?? 1) > 1 ? 's' : ''} de gagner !</p>
              </div>
            </div>
          </div>

          {/* Sous-texte explicatif */}
          <p className="text-sm text-gray-700 mb-6"><span className="uppercase font-bold">1 billet d’avion</span> au tirage au sort qui aura lieu le 16 septembre</p>

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
            {/* Bouton vers la liste des participations */}
            {participation?.inscription_id && (
              <Link
                href={`/user-list-participation?inscriptionId=${participation.inscription_id}`}
                className="inline-flex items-center justify-center font-bold py-2 px-4 bg-white text-[#01C9E7] rounded-md"
                style={{ border: '1px solid #01C9E7', boxShadow: '2px 2px 0 0 #015D6B' }}
              >
                Voir mes participations
                <span className="ml-2" aria-hidden>→</span>
              </Link>
            )}

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
              Augmente tes chances avec un nouveau ticket
            </button>
            <div className="mt-[20px]">
              <ShareButton inscriptionId={participation.inscription_id || "demo"} canal="whatsapp" shareUrl={typeof window !== 'undefined' ? window.location.origin + '/' : ''} />
            </div>
          </div>

          
        </div>
      </div>
    </div>
  )
}
