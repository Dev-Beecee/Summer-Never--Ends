"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function RegistrationConsigne() {
  return (
    <div className="flex flex-col items-center gap-6 max-w-xl mx-auto text-white">
      
      {/* Première Card */}
      <Card className="bg-transparent text-center">
        <CardContent className="p-6 flex flex-col items-center gap-4">
          <p className="text-sm font-medium ">Du <span style={{ fontWeight: 700 }}>04 au 31 août</span></p>
          <h2 className="text-lg font-bold  leading-snug ">
          Scanne ton ticket, cumule des points et tente de gagner d’incroyables lots!
          </h2>
         
          <a href="#form">
            <Button className="bg-[#01C9E7]  font-bold text-sm px-6 py-2  transition" style={{ border: '1px solid white', boxShadow: '2px 2px 0px 0px #015D6B' }}>
              TENTER MA CHANCE
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* Deuxième Card */}
      <Card className=" bg-transparent text-left mb-[45px]">
        <CardContent className="p-6 flex flex-col gap-4">
          <h3 className="text-lg font-bold  text-center text-[#01C9E7]" style={{ fontWeight: 700, fontSize: 25 }}>Comment ça marche ?</h3>
          <ul className="list-disc pl-5 space-y-2 text-sm ">
            <li>Inscris-toi en quelques secondes.</li>
            <li>Prend en photo ton ticket de caisse.</li>
            <li>Ton ticket sera analysé automatiquement pour t'offrir une chance de gratter le Golden Ticket !</li>
          </ul>
          <p className="text-sm font-bold  text-center" style={{ fontWeight: 700, fontSize: 25 }}>Attention :</p>
          <p className="text-sm ">
            Un ticket = une seule participation, Il ne peut être utilisé qu'une fois. <br />
            Tu peux retenter ta chance à chaque nouvel achat.
          </p>
        </CardContent>
      </Card>
      
    </div>
  );
}
