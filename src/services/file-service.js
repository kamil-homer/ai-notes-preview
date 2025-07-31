import { supabase } from './supabase-client'

export const fileService = {
  // Upload pliku
  async uploadFile(file, userId, noteId = null) {
    try {
      // Generuj unikalną nazwę pliku
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      console.log('Uploading file:', { fileName, filePath, size: file.size })

      // Upload do storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('notes-files')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw uploadError
      }

      console.log('File uploaded successfully:', uploadData)

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
    try {
      const { data, error } = await supabase.storage
        .from('notes-files')
        .createSignedUrl(filePath, 60) // URL ważny przez 60 sekund
      
      if (error) throw error
      return data.signedUrl
    } catch (error) {
      console.error('Error getting file URL:', error)
      throw error
    }
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
