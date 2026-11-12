import { Book, Loan, Member } from '../models/models';
import { addDays, daysAgo } from '../utils/date.util';

/**
 * Données fictives de démonstration (pas de serveur).
 * Les dates sont calculées par rapport à AUJOURD'HUI : il y a toujours
 * des emprunts en cours, des retards et des demandes à traiter.
 */

/** r(5 étoiles, 4 étoiles, 3, 2, 1) → liste de notes [5,5,…,4,…] */
function r(n5: number, n4: number, n3: number, n2: number, n1: number): number[] {
  const out: number[] = [];
  [[5, n5], [4, n4], [3, n3], [2, n2], [1, n1]].forEach(([note, n]) => {
    for (let i = 0; i < n; i++) out.push(note);
  });
  return out;
}

export const SEED_MEMBERS: Member[] = [
  // ── Administrateurs (comptes créés par le système, pas d'inscription possible)
  { id: 1, firstName: 'Sarra', lastName: 'Khachira', email: 'sarrakhachira@gmail.com', phone: '563092026', password: 'sarra1236', role: 'admin', joinedAt: daysAgo(400) },
  { id: 10, firstName: 'Malek', lastName: 'ghilen', email: 'malekghilen@gmail.com', phone: '51 653 311', password: 'malek1237', role: 'admin', joinedAt: daysAgo(400) },
  // ── Adhérents
  { id: 2, firstName: 'Yasmine', lastName: 'Trabelsi', email: 'yasmineTrabelsi@gmail.com', phone: '22 345 678', password: '1034t56', role: 'adherent', joinedAt: daysAgo(210) },
  { id: 3, firstName: 'Amine', lastName: 'Ben Salah', email: 'amineBenSalah@gmail.com', phone: '98 112 334', password: '1534k56', role: 'adherent', joinedAt: daysAgo(190) },
  { id: 4, firstName: 'Ons', lastName: 'Gharbi', email: 'onsGharbi@gmail.com', phone: '55 667 889', password: '19345u6', role: 'adherent', joinedAt: daysAgo(150) },
  { id: 5, firstName: 'Mohamed', lastName: 'Karray', email: 'mohamedKarray@gmail.com', phone: '20 556 771', password: '143g456', role: 'adherent', joinedAt: daysAgo(120) },
  { id: 6, firstName: 'Rim', lastName: 'Mansouri', email: 'rimMansouri@gmail.com', phone: '50 223 904', password: '194563f456', role: 'adherent', joinedAt: daysAgo(95) },
  { id: 7, firstName: 'Skander', lastName: 'Jlassi', email: 'skanderJlassi@gmail.com', phone: '27 801 450', password: '1456d13456', role: 'adherent', joinedAt: daysAgo(70) },
  { id: 8, firstName: 'Nour', lastName: 'Hammami', email: 'nourHammami@gmail.com', phone: '29 330 718', password: '1200003k456', role: 'adherent', joinedAt: daysAgo(20) },
  { id: 9, firstName: 'Wassim', lastName: 'Ayari', email: 'wassimAyari@gmail.com', phone: '29 330 718', password: '1700ab56', role: 'adherent', joinedAt: daysAgo(20) }
];

// titre, auteur, année, éditeur, catégorie, exemplaires, ajouté il y a X jours, notes, popularité (nb d'emprunts passés)
type Row = [string, string, number, string, string, number, number, number[], number];

const ROWS: Row[] = [
  /* 1 */ ['Clean Code', 'Robert C. Martin', 2008, 'Prentice Hall', 'Développement', 3, 320, r(21, 9, 3, 1, 0), 14],
  /* 2 */ ['The Pragmatic Programmer', 'Andrew Hunt, David Thomas', 2019, 'Addison-Wesley', 'Développement', 2, 260, r(14, 10, 4, 1, 0), 9],
  /* 3 */ ['Introduction to Algorithms', 'Thomas H. Cormen', 2022, 'MIT Press', 'Informatique', 2, 400, r(11, 8, 5, 3, 1), 10],
  /* 4 */ ['Design Patterns', 'Erich Gamma et al.', 1994, 'Addison-Wesley', 'Développement', 1, 380, r(8, 7, 5, 3, 2), 8],
  /* 5 */ ['Eloquent JavaScript', 'Marijn Haverbeke', 2024, 'No Starch Press', 'Web', 2, 6, r(7, 4, 1, 0, 0), 2],
  /* 6 */ ["You Don't Know JS Yet", 'Kyle Simpson', 2020, 'Independently published', 'Web', 1, 150, r(9, 6, 3, 1, 0), 5],
  /* 7 */ ['Learning SQL', 'Alan Beaulieu', 2020, "O'Reilly Media", 'Bases de données', 3, 230, r(16, 11, 3, 1, 0), 13],
  /* 8 */ ['Database System Concepts', 'Abraham Silberschatz', 2019, 'McGraw-Hill', 'Bases de données', 2, 340, r(6, 7, 6, 3, 1), 7],
  /* 9 */ ['Computer Networking: A Top-Down Approach', 'James Kurose, Keith Ross', 2021, 'Pearson', 'Réseaux', 2, 18, r(9, 7, 2, 1, 0), 3],
  /* 10 */ ['Computer Networks', 'Andrew S. Tanenbaum', 2021, 'Pearson', 'Réseaux', 1, 360, r(5, 7, 6, 2, 1), 6],
  /* 11 */ ['Calculus', 'James Stewart', 2015, 'Cengage Learning', 'Mathématiques', 2, 410, r(7, 9, 7, 4, 2), 7],
  /* 12 */ ['Linear Algebra Done Right', 'Sheldon Axler', 2023, 'Springer', 'Mathématiques', 2, 11, r(6, 3, 2, 1, 0), 2],
  /* 13 */ ['A Brief History of Time', 'Stephen Hawking', 1988, 'Bantam Books', 'Sciences', 2, 300, r(18, 10, 4, 1, 0), 9],
  /* 14 */ ['Cosmos', 'Carl Sagan', 1980, 'Random House', 'Sciences', 1, 280, r(12, 6, 2, 0, 0), 6],
  /* 15 */ ['Le Petit Prince', 'Antoine de Saint-Exupéry', 1943, 'Gallimard', 'Littérature', 3, 420, r(30, 12, 3, 0, 0), 15],
  /* 16 */ ["L'Étranger", 'Albert Camus', 1942, 'Gallimard', 'Littérature', 2, 390, r(10, 9, 6, 3, 1), 8],
  /* 17 */ ['Thinking, Fast and Slow', 'Daniel Kahneman', 2011, 'Farrar, Straus and Giroux', 'Gestion', 2, 25, r(8, 6, 3, 1, 0), 3],
  /* 18 */ ['The Lean Startup', 'Eric Ries', 2011, 'Crown Business', 'Gestion', 2, 310, r(7, 8, 6, 2, 1), 5]
];

/** nom du fichier image de chaque livre : public/images/covers/<nom>.jpg */
const COVER_FILES = [
  'clean-code', 'the-pragmatic-programmer', 'introduction-to-algorithms', 'design-patterns', 'eloquent-javascript',
  'you-dont-know-js-yet', 'learning-sql', 'database-system-concepts', 'computer-networking-top-down-approach',
  'computer-networks', 'calculus', 'linear-algebra-done-right', 'a-brief-history-of-time', 'cosmos',
  'le-petit-prince', 'l-etranger', 'thinking-fast-and-slow', 'the-lean-startup'
];

export const SEED_BOOKS: Book[] = ROWS.map((row, i) => ({
  id: i + 1,
  title: row[0],
  author: row[1],
  year: row[2],
  publisher: row[3],
  category: row[4],
  copies: row[5],
  addedAt: daysAgo(row[6]),
  ratings: row[7],
  cover: `images/covers/${COVER_FILES[i]}.jpg`
}));

export function buildSeedLoans(): Loan[] {
  const loans: Loan[] = [];
  let id = 1;

  // 1) Historique : emprunts déjà rendus (générés de façon déterministe)
  let seed = 7;
  const rnd = (n: number) => {
    seed = (seed * 9301 + 49297) % 233280;
    return Math.floor((seed / 233280) * n);
  };
  ROWS.forEach((row, i) => {
    for (let k = 0; k < row[8]; k++) {
      const memberId = 3 + rnd(7); // les emprunts de Yasmine (id 2) sont écrits à la main plus bas
      const ago = 25 + rnd(155);
      const borrow = daysAgo(ago);
      loans.push({
        id: id++,
        bookId: i + 1,
        memberId,
        requestDate: addDays(borrow, -1),
        requestStatus: 'Acceptée',
        borrowDate: borrow,
        dueDate: addDays(borrow, 14),
        returnedDate: addDays(borrow, 6 + rnd(10))
      });
    }
  });

  // 2) Emprunts en cours / en retard (bookId, memberId, emprunté il y a X jours)
  const active: [number, number, number][] = [
    [1, 2, 5], // Yasmine : Clean Code → en cours
    [7, 2, 22], // Yasmine : Learning SQL → en retard
    [4, 3, 9], // Design Patterns (1 seul exemplaire → indisponible)
    [10, 4, 6], // Computer Networks (1 exemplaire → indisponible)
    [14, 5, 25], // Cosmos (1 exemplaire → indisponible, en retard)
    [3, 6, 4],
    [15, 7, 8],
    [9, 8, 12],
    [2, 9, 3]
  ];
  active.forEach(([bookId, memberId, ago]) => {
    const borrow = daysAgo(ago);
    loans.push({ id: id++, bookId, memberId, requestDate: addDays(borrow, -1), requestStatus: 'Acceptée', borrowDate: borrow, dueDate: addDays(borrow, 14) });
  });

  // 3) Quelques emprunts rendus de Yasmine (pour son historique)
  [[12, 60, 12], [17, 95, 10]].forEach(([bookId, ago, days]) => {
    const borrow = daysAgo(ago);
    loans.push({ id: id++, bookId, memberId: 2, requestDate: addDays(borrow, -2), requestStatus: 'Acceptée', borrowDate: borrow, dueDate: addDays(borrow, 14), returnedDate: addDays(borrow, days) });
  });

  // 4) Demandes en attente (à traiter par l'administrateur)
  [[13, 2, 1], [11, 3, 1], [5, 6, 0], [16, 8, 2]].forEach(([bookId, memberId, ago]) => {
    loans.push({ id: id++, bookId, memberId, requestDate: daysAgo(ago), requestStatus: 'En attente' });
  });

  // 5) Demandes refusées
  [[18, 2, 12], [8, 5, 15]].forEach(([bookId, memberId, ago]) => {
    loans.push({ id: id++, bookId, memberId, requestDate: daysAgo(ago), requestStatus: 'Refusée' });
  });

  return loans;
}
