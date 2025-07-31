export const filterNotes = (notes, searchInput) => {
  if (!searchInput) {
    return notes
  }
  const filteredNotes = notes.reduce((acc, current) => {
    if (current.title.toLowerCase().includes(searchInput.toLowerCase())) {
      acc.push(current)
    }
    return acc
  }, [])
  return filteredNotes
}

export const sortNotesByDate = (notes) =>
  notes.sort((a, b) => a.updated_at < b.updated_at ? 1 : -1)
