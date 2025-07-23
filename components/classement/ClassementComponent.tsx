'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';

interface ClassementEntry {
  rang: number;
  nom_affiche: string;
  score: number;
}

interface UserScore {
  nom_affiche: string;
  score: number;
}

interface ClassementData {
  classement: ClassementEntry[];
  utilisateur: UserScore | null;
}

interface ClassementComponentProps {
  mode: 'accueil' | 'classement';
  inscriptionId?: string;
  className?: string;
}

const EDGE_FUNCTION_URL = 'https://kgdpgxvhqipihpgyhyux.supabase.co/functions/v1/get-classement';

export default function ClassementComponent({ 
  mode, 
  inscriptionId: propInscriptionId, 
  className = '' 
}: ClassementComponentProps) {
  const [data, setData] = useState<ClassementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inscriptionId, setInscriptionId] = useState<string | null>(propInscriptionId || null);

  // Récupération automatique de l'ID d'inscription depuis localStorage
  useEffect(() => {
    if (!propInscriptionId && typeof window !== 'undefined') {
      const storedId = localStorage.getItem('inscription_id');
      if (storedId) {
        setInscriptionId(storedId);
      }
    }
  }, [propInscriptionId]);

  useEffect(() => {
    const fetchClassement = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(EDGE_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mode,
            inscription_id: inscriptionId
          }),
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    if (inscriptionId) {
      fetchClassement();
    } else {
      setLoading(false);
    }
  }, [mode, inscriptionId]);

  // Scroll automatique vers la position de l'utilisateur
  useEffect(() => {
    if (data?.utilisateur && mode === 'classement') {
      // Attendre que le DOM soit mis à jour
      setTimeout(() => {
        const userElement = document.querySelector('[data-user-position="true"]');
        if (userElement) {
          userElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    }
  }, [data, mode]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 text-center text-sm font-bold">{rank}</span>;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return 'default' as const;
      case 2:
        return 'secondary' as const;
      case 3:
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            
            {mode === 'accueil' ? 'Le classement actuel' : 'Classement Général'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(mode === 'accueil' ? 5 : 10)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-muted rounded"></div>
                  <div className="w-32 h-4 bg-muted rounded"></div>
                </div>
                <div className="w-16 h-4 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Classement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive">
            <p>Erreur lors du chargement du classement</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Card className={`${className} border-none shadow-none`}>
      <CardHeader>
        <CardTitle className="gap-2 text-center text-[#01C9E7]">
         
          {mode === 'accueil' ? 'Le classement actuel' : ''}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.classement.map((entry) => {
            const isCurrentUser = data.utilisateur && 
              entry.nom_affiche === data.utilisateur.nom_affiche && 
              entry.score === data.utilisateur.score;
            
            return (
              <div
                key={entry.rang}
                data-user-position={isCurrentUser ? "true" : "false"}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isCurrentUser
                    ? 'border-2 border-[#01C9E7]'
                    : ''
                }`}
                style={isCurrentUser ? { backgroundColor: '#01C9E7' } : {}}
              >
                <div className="flex items-center gap-3">
                  <Badge variant={getRankBadgeVariant(entry.rang)} className="flex items-center gap-1">
                    {getRankIcon(entry.rang)}
                  </Badge>
                  <span className={`font-medium ${isCurrentUser ? 'text-white' : ''}`}>
                    {entry.nom_affiche}
                    {isCurrentUser && ' (Vous)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${isCurrentUser ? 'text-white' : 'text-primary'}`}>
                    {entry.score}
                  </span>
                  <span className={`text-sm ${isCurrentUser ? 'text-white/80' : 'text-muted-foreground'}`}>
                    pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {mode === 'accueil' && (
          <div className="mt-6 pt-4 ">
            <div className="flex justify-center">
              <Link 
                href="/classement" 
                className="bg-[#01C9E7] text-white px-6 py-2 rounded-md hover:bg-[#01C9E7]/90 transition-colors font-bold uppercase"
                style={{ boxShadow: '2px 2px 0 0 #015D6B', borderRadius: '4px' }}
              >
                Voir le classement 
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 