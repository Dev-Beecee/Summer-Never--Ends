'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { RegistrationSuccess } from './RegistrationSuccess'

const formSchema = z.object({
  nom: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  prenom: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Veuillez saisir une adresse email valide." }),
  telephone: z.string().regex(/^(0|\+33)[1-9]([-. ]?[0-9]{2}){4}$/, {
    message: "Veuillez saisir un numéro de téléphone valide.",
  }),
  accepte_reglement: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter le règlement pour participer.",
  }),
  accepte_marketing: z.boolean().default(false),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function RegistrationForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [registrationId, setRegistrationId] = useState<string | null>(null)
  const [hasParticipated, setHasParticipated] = useState<boolean>(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      accepte_reglement: false,
      accepte_marketing: false,
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      utm_term: '',
      utm_content: '',
    },
  })

  const isLoading = form.formState.isSubmitting

  // Auto-remplissage depuis localStorage
  useEffect(() => {
    const storedId = localStorage.getItem('inscription_id')
    const storedData = localStorage.getItem('inscription_data')

    if (storedId) {
      setRegistrationId(storedId)

      // Vérifier si l'utilisateur existe et rediriger immédiatement
      fetch('https://kgdpgxvhqipihpgyhyux.supabase.co/functions/v1/inscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ inscription_id: storedId }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.exists) {
            // Redirection immédiate si l'utilisateur existe déjà
            router.push(`/participation?id=${storedId}`)
            return
          }

          if (res.participations && res.participations.length > 0) {
            setHasParticipated(true)
          }
        })
        .catch(() => { })
    }

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData)
        form.reset(parsed)
      } catch { }
    }

    // Récupération automatique des UTM depuis l'URL
    const utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    utmFields.forEach(field => {
      const value = searchParams.get(field) || '';
      form.setValue(field as keyof FormValues, value);
    });
  }, [form, searchParams, router])

  // Dans la fonction onSubmit du composant RegistrationForm
  async function onSubmit(data: FormValues) {
    try {
      data.telephone = data.telephone.replace(/[\s.-]/g, '');
      const res = await fetch('https://kgdpgxvhqipihpgyhyux.supabase.co/functions/v1/inscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`)
      }

      const result = await res.json()

      if (result?.data) {
        const userData = result.data[0] || result.data; // Handle both array and single object
        const id = userData.id;
        setRegistrationId(id)
        localStorage.setItem('inscription_id', id)
        localStorage.setItem('inscription_data', JSON.stringify(userData))

        if (result.exists) {
          // User already exists, redirect immediately
          router.push(`/participation?id=${id}`)
        } else {
          // New user, redirect to participation page
          router.push(`/participation?id=${id}`)
        }
      } else {
        throw new Error("Réponse inattendue du serveur")
      }
    } catch (err) {
      console.error('Submission error:', err)
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Une erreur est survenue",
        variant: "destructive",
      })
    }
  }

  // Ajouter une fonction pour gérer les erreurs de validation
  const handleSubmit = async (data: FormValues) => {
    try {
      // Vérifier si le formulaire est valide
      const isValid = await form.trigger();
      if (!isValid) {
        toast({
          title: "Erreur de validation",
          description: "Veuillez corriger les erreurs dans le formulaire",
          variant: "destructive",
        });
        return;
      }
      
      await onSubmit(data);
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  if (isSubmitted && registrationId) {
    return <RegistrationSuccess registrationId={registrationId} />
  }

  return (
    <Form {...form}>
      <div className='mb-10 mt-10'>
        <h3 className="text-2xl text-center text-[#01C9E7] uppercase" style={{ fontWeight: 700, fontSize: 20 }}>Enregistre tes infos</h3>
        <p className="text-sm text-center mb-[45px] mt-5" style={{ fontWeight: 700, color: 'black' }}>En t'inscrivant ci-dessous, tes coordonnées seront utilisées pour te contacter en cas de gain.</p>
      </div>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-4" id="form">
        {/* Nom & Prénom */}
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">Nom*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nom"
                    {...field}
                    className="border-0 border-b border-b-black text-black placeholder:text-black/70 rounded-none"
                    autoComplete="family-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prenom"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">Prénom*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Prénom"
                    {...field}
                    className="border-0 border-b border-b-black text-black placeholder:text-black/70 rounded-none"
                    autoComplete="given-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Adresse mail*</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  {...field}
                  className="border-0 border-b border-b-black text-black placeholder:text-black/70 rounded-none"
                  autoComplete="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Téléphone */}
        <FormField
          control={form.control}
          name="telephone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Numéro de téléphone*</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="06 12 34 56 78"
                  {...field}
                  className="border-0 border-b border-b-black text-black placeholder:text-black/70 rounded-none"
                  autoComplete="tel"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Checkboxes */}
        <div className="space-y-4">
          {/* Accepte règlement */}
          <FormField
            control={form.control}
            name="accepte_reglement"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-normal">
                    J'accepte le règlement du jeu et j'accepte que mes données personnelles saisies dans le formulaire soient utilisées pour être recontacté(e) par l'entreprise dans le cadre du jeu.*
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {/* Accepte marketing */}
          <FormField
            control={form.control}
            name="accepte_marketing"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-normal">
                    J'accepte que mes données personnelles saisies dans le formulaire soient utilisées à des fins commerciales.
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Bouton */}
        <div className="flex justify-center">
          <Button
            type="submit"
            className={cn(
              "transition-all duration-300 btn",
              isLoading ? "bg-primary/80" : "bg-primary hover:bg-primary/90"
            )}
            style={{ fontWeight: 700, boxShadow: "2px 2px 0 0 #015D6B" }}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            ENREGISTRER
          </Button>
        </div>

        {/* Mention bas de page */}
        <p className="text-center text-xs text-black mt-4">
          *Ces champs sont obligatoires
        </p>
      </form>
    </Form>
  )
}
