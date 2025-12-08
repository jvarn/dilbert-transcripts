// Article registry - exports metadata for all articles
// We import metadata statically for the blog listing, but load full content dynamically
import { metadata as sentimentAnalysis } from './sentiment-analysis.jsx'
import { metadata as sarcasmEmotions } from './sarcasm-emotions.jsx'
import { metadata as buzzwords } from './buzzwords.jsx'

export const articles = [
  sentimentAnalysis,
  sarcasmEmotions,
  buzzwords
]

// Export individual article loaders
// Uses dynamic imports to code-split articles
export async function loadArticle(articleId) {
  switch (articleId) {
    case 'sentiment-analysis':
      const sentimentModule = await import('./sentiment-analysis.jsx')
      return sentimentModule
    case 'sarcasm-emotions':
      const sarcasmModule = await import('./sarcasm-emotions.jsx')
      return sarcasmModule
    case 'buzzwords':
      const buzzwordsModule = await import('./buzzwords.jsx')
      return buzzwordsModule
    default:
      return null
  }
}

