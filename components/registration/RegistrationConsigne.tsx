"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function RegistrationConsigne() {
  return (
    <div className="flex flex-col items-center gap-6 max-w-xl mx-auto text-white">
      
      {/* Première Card */}
      <Card className="bg-transparent text-center" style={{ border: 'none', boxShadow: 'none' }}>
        <CardContent className="p-6 flex flex-col items-center gap-4">
          <p className="text-sm font-medium ">Du <span style={{ fontWeight: 700 }}>07 août au 15 septembre 2025</span></p>
          <h2 className="text-lg font-bold  leading-snug ">
          Scanne ton ticket, cumule des points et tente de gagner d'incroyables lots!
          </h2>
         
          <a href="#form">
            <Button className="bg-[#01C9E7]  font-bold text-sm px-6 py-2  transition" style={{ border: '1px solid white', boxShadow: '2px 2px 0px 0px #015D6B' }}>
              TENTER MA CHANCE
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* Deuxième Card */}
      <Card className=" bg-transparent text-left mb-[45px]" style={{ border: 'none', boxShadow: 'none'}}>
        <CardHeader className="flex flex-row items-center justify-center">
        <h3 className="text-lg font-bold  text-center text-[#01C9E7]" style={{ fontWeight: 700, fontSize: 25 }}>Comment ça marche ?</h3>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-4">
          
          <p>
          1. Scanne ton ticket de caisse après ton passage en restaurant.
          </p>
          <p className="text-sm font-bold">Chaque ticket scanné te rapporte automatiquement 100 points.</p>
          <p>
          2. Accumule tes points et augmente tes chances de gagner !
          </p>
          <p className="text-sm font-bold">Plus tu scannes de tickets, plus tu accumules de points et plus tu as de chances de remporter d'incroyables lots !</p>
          <p>
          3. Tente ta chance à chaque participation !
          </p>
          <p className="text-sm font-bold">À chaque scan de ticket, tu as une chance de gagner instantanément un lot selon les disponibilités du jour.</p>

        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center gap-4">
        <p className="text-sm font-bold  text-center" style={{ fontWeight: 700, fontSize: 25 }}>Attention :</p>
        <p className="text-sm text-center">
            Un ticket = une seule participation. Il ne peut être utilisé qu'une fois. <br />
            Tu peux retenter ta chance à chaque nouvel achat.
          </p>

        </CardFooter>
      </Card>
    </div>
  );
}
