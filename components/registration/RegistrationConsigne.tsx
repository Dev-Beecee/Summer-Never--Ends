"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function RegistrationConsigne() {
  return (
    <div className="flex flex-col items-center gap-6 max-w-xl mx-auto text-white">
      {/* Deuxième Card */}
      <Card className="bg-transparent text-left mb-[45px]" style={{ border: 'none', boxShadow: 'none'}}>
        <CardHeader className="flex flex-row items-center justify-center">
          <h3 className="text-lg font-bold text-center text-[#01C9E7]" style={{ fontWeight: 700, fontSize: 25 }}>Comment ça marche ?</h3>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-4">
          <div>
            <p className="font-bold">1. Scanne ton ticket de caisse après ton passage en restaurant :</p>
            <ul className="ml-4 mt-2 space-y-1">
              <li>• Chaque ticket validé te rapporte automatiquement un chance supplémentaire de gagner 1 billet d'avion au tirage au sort du 16 septembre</li>
              <li>• Plus tu scannes de tickets, plus tu accumules de de chance de gagner</li>
            </ul>
          </div>

          <div>
            <p className="font-bold">2. Tente ta chance à chaque participation !</p>
            <ul className="ml-4 mt-2 space-y-1">
              <li>• À chaque scan de ticket, tu as en plus, une chance de gagner instantanément un lot surprise</li>
            </ul>
          </div>

          <div>
            <p className="font-bold">Attention :</p>
            <ul className="ml-4 mt-2 space-y-1">
              <li>• Un ticket = une seule participation. Il ne peut être utilisé qu'une fois.</li>
              <li>• Tu peux retenter ta chance à chaque nouvel achat.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
