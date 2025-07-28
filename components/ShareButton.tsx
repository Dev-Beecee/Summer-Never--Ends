'use client'

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

interface ShareButtonProps {
  inscriptionId: string; // id de l'utilisateur
  canal: string; // ex: 'whatsapp', 'facebook', 'email', etc.
  shareUrl: string; // lien à partager
  meta?: any; // infos optionnelles (description, image, etc.)
  children?: React.ReactNode; // pour customiser le bouton
}

const CONFIG_ID = '00000000-0000-0000-0000-000000000001';

const ShareButton: React.FC<ShareButtonProps> = ({ inscriptionId, canal, shareUrl, meta, children }) => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from('partage_config')
        .select('*')
        .eq('id', CONFIG_ID)
        .single();
      if (data) setConfig(data);
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleShare = async () => {
    const supabase = createClientComponentClient<Database>();
    await supabase.from('partage').insert([
      {
        inscription_id: inscriptionId,
        canal,
        meta: meta ? meta : config ? {
          description: config.meta_description,
          image: config.image_url,
          message: config.message_defaut,
        } : null,
      },
    ]);

    // 2. Partage (Web Share API ou fallback)
    if (navigator.share) {
      try {
        await navigator.share({
          title: config?.meta_description,
          text: config?.message_defaut,
          url: shareUrl,
        });
      } catch (error) {
        alert("Le partage a échoué ou a été annulé.");
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert("Lien copié dans le presse-papier !");
    }
  };

  if (loading) return <button disabled>Chargement...</button>;

  const getButtonContent = () => {
    if (children) return children;
    
    if (canal === 'whatsapp') {
      return (
        <>
          <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
            <path d="M9.52831 2.46777C5.82321 2.46777 2.80792 5.37202 2.80661 8.94124C2.80574 10.0826 3.11581 11.1966 3.70371 12.1778L2.75 15.5323L6.31356 14.6321C7.30482 15.1507 8.40701 15.4211 9.52569 15.4204H9.52831C13.2334 15.4204 16.2487 12.5157 16.25 8.94647C16.2509 7.2176 15.5524 5.59019 14.2829 4.36692C13.0139 3.14321 11.3264 2.46821 9.52831 2.46777ZM9.52831 14.3269H9.52613C8.52364 14.3269 7.54032 14.0673 6.68242 13.577L6.47774 13.4603L4.3639 13.9942L4.92829 12.0084L4.79547 11.805C4.23757 10.9541 3.94058 9.9587 3.94105 8.94124C3.94235 5.97429 6.449 3.56127 9.53048 3.56127C11.0225 3.56171 12.4251 4.12218 13.4803 5.13903C14.5355 6.15589 15.116 7.50806 15.1151 8.94603C15.1138 11.913 12.6076 14.3269 9.52787 14.3269H9.52831ZM12.5928 10.2965C12.4247 10.2159 11.599 9.8244 11.4449 9.76997C11.2911 9.7164 11.1792 9.68853 11.0673 9.85053C10.9558 10.0125 10.6336 10.377 10.536 10.4846C10.4376 10.5926 10.3396 10.6057 10.1715 10.5251C10.0034 10.4441 9.46211 10.2734 8.82108 9.72206C8.32158 9.29355 7.98452 8.764 7.88653 8.60156C7.78855 8.44 7.87608 8.35247 7.96013 8.2719C8.03547 8.20005 8.12823 8.08334 8.21184 7.98884C8.29545 7.89434 8.32332 7.82684 8.37994 7.71884C8.43568 7.61127 8.40781 7.51634 8.36556 7.43577C8.32332 7.35434 7.988 6.55827 7.84734 6.23471C7.71147 5.91942 7.57298 5.96166 7.46977 5.95643C7.37179 5.95208 7.26031 5.95077 7.14752 5.95077C7.03647 5.95077 6.854 5.99127 6.69984 6.15327C6.54611 6.31527 6.11194 6.70634 6.11194 7.5024C6.11194 8.2989 6.71377 9.06797 6.79782 9.17597C6.88187 9.28353 7.98234 10.9179 9.66723 11.619C10.0679 11.785 10.3805 11.8847 10.6249 11.9596C11.0272 12.0828 11.3935 12.065 11.6826 12.0236C12.0049 11.977 12.6764 11.6325 12.8158 11.255C12.956 10.8774 12.956 10.5534 12.9142 10.4859C12.8733 10.4184 12.7609 10.3779 12.5928 10.2965Z" fill="white"/>
          </svg>
          Partager sur WhatsApp
        </>
      );
    }
    
    return 'Partager ce jeu À mes amis !';
  };

  return (
    <button type="button" onClick={handleShare} style={{ padding: 8, borderRadius: 4, background: '#000', color: '#FFFF', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {getButtonContent()}
    </button>
  );
};

export default ShareButton; 