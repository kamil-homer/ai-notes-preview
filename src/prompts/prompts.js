export const generateTitlePrompt = (
  noteContent
) => `Napisz mi tytuł dla następującej notatki: ${noteContent}.
        Maksymalnie 3 wyrazy.
        Przykłady dobrych tematów: "Notatki ze spotkania", "Lista zakupów", "Ksiązki i blogi"`

export const generateTagPrompt = (
  noteContent
) => `Wygeneruj tag dla notatki: ${noteContent}.
        Tylko 1 wyraz.
        Przykłady dobrych tagów: "Osoby", "Notatki", "Życiowe", "Nauka"`