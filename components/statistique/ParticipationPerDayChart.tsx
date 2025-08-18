"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParticipationPerDayChart() {
  const [data, setData] = useState<{ date: string; participations: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<any>(null); // Pour debug

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("https://kgdpgxvhqipihpgyhyux.supabase.co/functions/v1/statistiques", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
      });
      const json = await res.json();
      
      // Debug: affichage des données brutes
      console.log("🔍 Données brutes reçues:", json);
      setRawData(json);
      
      if (res.ok && json.stats && json.stats.participationsParJour) {
        console.log("📊 participationsParJour:", json.stats.participationsParJour);
        
        // Transforme l'objet en tableau trié par date
        const arr = Object.entries(json.stats.participationsParJour)
          .map(([date, participations]) => ({ date, participations: Number(participations) }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        console.log("📈 Données transformées:", arr);
        setData(arr);
      } else {
        console.error("❌ Erreur ou données manquantes:", json);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <Card className="py-0">
      <CardHeader>
        <CardTitle>Participations par jour</CardTitle>
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && rawData && (
          <div className="text-xs text-gray-500 mt-2">
            <details>
              <summary>🔍 Debug - Données reçues</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(rawData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        {loading ? (
          <div>Chargement...</div>
        ) : data.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Aucune donnée de participation disponible
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={data} 
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={true}
                tickMargin={8}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("fr-FR", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis 
                allowDecimals={false}
                axisLine={true}
                tickLine={false}
              />
              <Tooltip
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  });
                }}
                formatter={(value) => [value, "Participations"]}
                contentStyle={{
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #dee2e6",
                  borderRadius: "8px",
                }}
              />
              <Bar 
                dataKey="participations" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                stroke="#2563eb"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
} 