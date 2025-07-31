'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { supabase } from '@/lib/supabase-client'
import { useToast } from '@/hooks/use-toast'

const fetcher = (url: string, inscriptionId: string) =>
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inscription_id: inscriptionId })
    }).then(res => res.json())

export function UserProfileCard({ inscriptionId }: { inscriptionId: string }) {
    const router = useRouter()
    const { toast } = useToast()

    const { data, error } = useSWR(
        ['https://kgdpgxvhqipihpgyhyux.supabase.co/functions/v1/get-user-participations', inscriptionId],
        ([url, id]) => fetcher(url, id),
        { refreshInterval: 5000 }
    )

    useEffect(() => {
        if (error) {
            toast({
                title: 'Erreur',
                description: error.message,
                variant: 'destructive'
            })
        }
    }, [error, toast])

    if (!data?.user || data.user.participationsCount === 0) return null

    const formattedName = `${data.user.prenom} ${data.user.nom.charAt(0)}.`
    const participationCount = data.user.participationsCount
    const participationText =
        participationCount === 1
            ? '1 participation enregistrée'
            : `${participationCount} participations enregistrées`

    const handleClick = () => {
        router.push(`/user-list-participation?inscriptionId=${inscriptionId}`)
    }

    return (
        <div className="w-full flex flex-col items-center px-2">
            <div
                onClick={handleClick}
                className="flex items-center justify-between rounded-2xl px-6 py-4 cursor-pointer hover:shadow-md transition-shadow max-w-md w-full bg-[#01C9E7] text-white"
                style={{ boxShadow: '2px 2px 0px 0px #015D6B' }}
            >
                <div className="basis-[90%]">
                    <h3 className="font-bold ">{formattedName}</h3>
                    <p className="text-sm ">{participationText}</p>
                    <div className=" justify-center items-center gap-4 mt-2">
                        <div className="flex text-center justify-between items-center">
                            <p className="text-xs ">Points</p>
                            <p className="font-semibold text-lg">{data.user.score}</p>
                        </div>
                        <div className="flex text-center justify-between items-center">
                            <p className="text-xs ">Position</p>
                            <p className="font-semibold text-lg">
                                {data.user.classement}/{data.user.totalInscrits}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="ml-4 text-black basis-[10%]">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="#FFFF"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
            
            <div className="w-full flex justify-center mt-4">
                <button
                    onClick={() => router.push('/classement')}
                    className="px-6 py-3 rounded-2xl font-semibold bg-[#01C9E7] text-white hover:shadow-md transition-shadow"
                    style={{ boxShadow: '2px 2px 0px 0px #015D6B' }}
                >
                    Classement
                </button>
            </div>
        </div>
    )
}