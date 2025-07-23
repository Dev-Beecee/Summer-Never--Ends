'use client';

import { useState, useEffect } from 'react';
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
  inscriptionId, 
  className = '' 
}: ClassementComponentProps) {
  const [data, setData] = useState<ClassementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    fetchClassement();
  }, [mode, inscriptionId]);

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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="gap-2 text-center text-[#01C9E7]">
         
          {mode === 'accueil' ? 'Le classement actuel' : 'Classement Général'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.classement.map((entry) => (
            <div
              key={entry.rang}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                data.utilisateur && 
                entry.nom_affiche === data.utilisateur.nom_affiche && 
                entry.score === data.utilisateur.score
                  ? 'bg-primary/10 border border-primary/20'
                  : 'bg-muted/50 hover:bg-muted/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Badge variant={getRankBadgeVariant(entry.rang)} className="flex items-center gap-1">
                  {getRankIcon(entry.rang)}
                </Badge>
                <span className="font-medium">{entry.nom_affiche}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  {entry.score}
                </span>
                <span className="text-sm text-muted-foreground">pts</span>
              </div>
            </div>
          ))}
        </div>

        {mode === 'classement' && data.utilisateur && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Votre position</h4>
            <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="flex items-center gap-1">
                  <span className="w-5 h-5 text-center text-sm font-bold">Vous</span>
                </Badge>
                <span className="font-medium">{data.utilisateur.nom_affiche}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  {data.utilisateur.score}
                </span>
                <span className="text-sm text-muted-foreground">pts</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 