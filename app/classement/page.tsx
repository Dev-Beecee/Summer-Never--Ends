"use client";

import ClassementComponent from '@/components/classement/ClassementComponent';
import { RegistrationHeader } from '@/components/registration/RegistrationHeader';
import { useRouter } from 'next/navigation';

export default function ClassementPage() {
  const router = useRouter();
  return (
    <div className="container mx-auto px-4 py-8">
        <RegistrationHeader />
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold  text-black mb-2">
            Classement Général
          </h1>
          <p className=" text-muted-foreground">
            Découvrez qui sont les meilleurs joueurs du jeu
          </p>
       
        </div>
        
        <ClassementComponent 
          mode="classement" 
          className="w-full"
        />
        <div className="flex justify-center mt-8">
           <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-4 py-2  bg-[#01C9E7] text-white transition-colors uppercase font-bold border-lg"
                            style={{ boxShadow: '2px 2px 0px 0px #015D6B' }}
                        >
                           
                            Retour à l'accueil
                        </button>
        </div>
      </div>
    </div>
  );
}
