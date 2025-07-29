export const filterNotes = (notes, searchInput) => {
  if (!searchInput) {
    return notes;
  }
  const filteredNotes = notes.reduce((acc, current) => {
    if (current.title.toLowerCase().includes(searchInput)) {
      acc.push(current);
    }
    return acc;
  }, []);
  return filteredNotes;
};

export const sortNotesByDate = (notes) =>
  notes.sort((a, b) => a.created_at < b.created_at);
