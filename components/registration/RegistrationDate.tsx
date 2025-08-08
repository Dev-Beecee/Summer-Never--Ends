"use client";

import { Card, CardContent } from "@/components/ui/card";

export function RegistrationDate() {
  return (
    <div className="flex flex-col items-center gap-6 max-w-xl mx-auto text-white">
      {/* Première Card */}
      <Card className="bg-transparent text-center" style={{ border: 'none', boxShadow: 'none' }}>
        <CardContent className="p-6 flex flex-col items-center gap-4">
          <p className="text-2xl font-medium ">Du 7 août au 15 septembre</p>
          <h2 className="text-3xl font-bold leading-snug ">
            Scanne ton ticket et tente de gagner 1 billet d'avion FDF-Paris !
          </h2>
          <p className="text-xl font-medium">
            ainsi que pleins d'autre lots surprises
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
