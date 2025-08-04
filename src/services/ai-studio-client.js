import { GoogleGenAI } from '@google/genai'

export const ai = new GoogleGenAI({
  apiKey: `${import.meta.env.VITE_GEMINI_API}`,
})

// Reużywalna funkcja do generowania zawartości AI
export const generateAIContent = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking
        },
      },
    })
    return response.text.trim()
  } catch (error) {
    console.error('Error generating AI content:', error)
    throw error
  }
}
