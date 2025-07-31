import { supabase } from './supabase-client'

export const fileService = {
  // Upload pliku
  async uploadFile(file, userId, noteId = null) {
    try {
      // Generuj unikalną nazwę pliku
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      // Upload do storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('notes-files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Zapisz metadata w bazie (używamy camelCase)
      const { data: fileData, error: dbError } = await supabase
        .from('files')
        .insert({
          userId: userId,
          noteId: noteId,
          fileName: file.name,
          filePath: filePath,
          fileSize: file.size,
          contentType: file.type
        })
        .select()
        .single()

      if (dbError) throw dbError

      return fileData
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  },

  // Pobierz pliki dla notatki
  async getFilesForNote(noteId) {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('noteId', noteId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Pobierz URL do pobrania pliku
  async getFileUrl(filePath) {
    const { data } = supabase.storage
      .from('notes-files')
      .getPublicUrl(filePath)
    
    return data.publicUrl
  },

  // Usuń plik
  async deleteFile(fileId, filePath) {
    try {
      // Usuń z storage
      const { error: storageError } = await supabase.storage
        .from('notes-files')
        .remove([ filePath ])

      if (storageError) throw storageError

      // Usuń z bazy
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId)

      if (dbError) throw dbError
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }
}
