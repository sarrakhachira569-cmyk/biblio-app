// ─────────────────────────────────────────────────────────────
//  Modèles de données (les "formes" des objets de l'application)
// ─────────────────────────────────────────────────────────────

export type Role = 'adherent' | 'admin';

export interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string; // démo uniquement : pas de vrai backend
  role: Role;
  joinedAt: string; // AAAA-MM-JJ
}

export interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  publisher: string;
  category: string;
  copies: number; // nombre total d'exemplaires
  ratings: number[]; // une note (1 à 5) par lecteur
  cover: string; // URL facultative, sinon couverture générée
  addedAt: string; // date d'ajout (sert pour les « nouveautés »)
}

/** Etat d'une DEMANDE d'emprunt */
export type RequestStatus = 'En attente' | 'Acceptée' | 'Refusée';

/** Etat d'un EMPRUNT (une demande acceptée) */
export type LoanStatus = 'En cours' | 'En retard' | 'Rendu';

/** Une demande qui devient un emprunt quand elle est acceptée */
export interface Loan {
  id: number;
  bookId: number;
  memberId: number;
  requestDate: string;
  requestStatus: RequestStatus;
  borrowDate?: string; // renseignée quand la demande est acceptée
  dueDate?: string; // date de retour prévue
  returnedDate?: string; // renseignée quand le livre est rendu
  rating?: number; // note (1 à 5) donnée par l'adhérent après le retour
}

export interface Result {
  ok: boolean;
  message: string;
}
