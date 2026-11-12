/**
 * Informations de contact affichées dans le pied de page.
 * ➜ Pour mettre les VRAIS liens, il suffit de modifier ce fichier (rien d'autre).
 */
export const SITE = {
  email: 'aymen.chaoua1@gmail.com', // devient un lien mailto: (ouvre le programme de messagerie)
  phoneDisplay: '96 392 940', // texte affiché
  phoneDial: '+21696392940', // numéro pour le lien tel: (sans espaces)
  whatsapp: '21626471543', // numéro WhatsApp au format international, sans + ni espaces
  facebook: 'https://www.facebook.com/share/1FK1TiYNGs/',
  tiktok: 'https://www.tiktok.com/@imprimerie.aymen', // ← remplacer par le lien de la vraie page Facebook (laisser '' pour masquer)
  address: 'Campus universitaire, Iset Médenine', // devient un lien Google Maps
  partner: 'Imprimerie Aymen',  
  partnerAddress: 'Route Béni Khédache km 2, Médenine',
  partnerMapsLink: 'https://maps.app.goo.gl/WHwDdS14c43RrgwL9',
  mapsLink: 'https://maps.app.goo.gl/TVfY9H83WecoxxZ39?g_st=aw', // map exact de l'ISET (même principe) — vide = recherche par adresse
 hours: [
    { icon: 'bi-clock', text: 'Lun – Jeu : 8h30 – 15h30' },
    { icon: 'bi-calendar-week', text: 'Ven – Sam : 8h30 – 12h00' },
    { icon: 'bi-door-closed', text: 'Dimanche : fermé' }
  ]
};
