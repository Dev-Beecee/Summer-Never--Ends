// Script pour corriger les scores des participations passées
// À exécuter dans la console du navigateur (F12)

async function fixScores() {
  try {
    console.log('🔍 Recherche des participations avec statut "validéia"...');

    // Utiliser le client Supabase existant de la page
    const supabase =
      window.supabase ||
      createClient(
        "https://kgdpgxvhqipihpgyhyux.supabase.co",
        "VOTRE_CLE_ANON_SUPABASE" // Remplacez par votre vraie clé
      );

    // Récupérer toutes les participations avec statut "validéia"
    const { data: participations, error: fetchError } = await supabase
      .from("participation")
      .select("id, inscription_id, ocr_montant, statut_validation")
      .eq("statut_validation", "validéia");

    if (fetchError) {
      console.error(
        "❌ Erreur lors de la récupération des participations:",
        fetchError
      );
      return;
    }

    console.log(`📊 ${participations.length} participations trouvées`);

    // Grouper par inscription_id pour calculer le score total
    const scoresByInscription = {};

    participations.forEach((participation) => {
      const montant = parseFloat(participation.ocr_montant);
      if (montant && typeof montant === "number") {
        const montantArrondi = Math.ceil(montant);
        const score = montantArrondi * 100 * 3;

        if (!scoresByInscription[participation.inscription_id]) {
          scoresByInscription[participation.inscription_id] = 0;
        }
        scoresByInscription[participation.inscription_id] += score;
      }
    });

    console.log(
      `🎯 Calcul des scores pour ${
        Object.keys(scoresByInscription).length
      } inscriptions`
    );

    // Mettre à jour les scores
    for (const [inscriptionId, totalScore] of Object.entries(
      scoresByInscription
    )) {
      console.log(
        `💰 Mise à jour du score pour l'inscription ${inscriptionId}: +${totalScore} points`
      );

      const { error: updateError } = await supabase
        .from("inscription")
        .update({ score: totalScore })
        .eq("id", inscriptionId);

      if (updateError) {
        console.error(
          `❌ Erreur lors de la mise à jour du score pour ${inscriptionId}:`,
          updateError
        );
      } else {
        console.log(`✅ Score mis à jour avec succès pour ${inscriptionId}`);
      }
    }

    console.log("🎉 Correction des scores terminée !");
  } catch (error) {
    console.error("❌ Erreur générale:", error);
  }
}

// Exécuter le script
fixScores();
