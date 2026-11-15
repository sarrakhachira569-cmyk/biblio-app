/** Où chercher : dans le titre ET l'auteur, seulement le titre, ou seulement l'auteur */
export type SearchField = 'all' | 'title' | 'author';

/** minuscules + sans accents : « etranger » trouve « L'Étranger » */
export function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/** découpe un texte en mots (« The Pragmatic Programmer » → the, pragmatic, programmer) */
function wordsOf(text: string): string[] {
  return normalizeText(text).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

/**
 * Un livre correspond si CHAQUE mot tapé est le DÉBUT d'un mot du titre / de l'auteur.
 * Exemple : « th » trouve « The… » et « Thomas », mais pas « Algorithms ».
 * La MÊME fonction sert au catalogue et à la gestion des livres de l'administrateur.
 */
export function matchesSearch(book: { title: string; author: string }, query: string, field: SearchField): boolean {
  const typed = wordsOf(query);
  if (!typed.length) return true;
  const source = field === 'title' ? book.title : field === 'author' ? book.author : `${book.title} ${book.author}`;
  const words = wordsOf(source);
  return typed.every((t) => words.some((w) => w.startsWith(t)));
}