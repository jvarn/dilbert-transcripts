import { articles } from '../articles/index.js'

function Blog({ onArticleSelect }) {
  // Sort articles by date (newest first)
  const sortedArticles = [...articles].sort((a, b) => {
    return new Date(b.date) - new Date(a.date)
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Analysis & Articles
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Research and analysis based on the Dilbert transcript dataset
        </p>
      </header>

      <div className="space-y-6">
        {sortedArticles.map((article) => (
          <article
            key={article.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onArticleSelect(article.id)}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {article.title}
            </h2>
            <time className="text-sm text-gray-500 dark:text-gray-400 mb-3 block">
              {new Date(article.date).toLocaleDateString('en-UK', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </time>
            <p className="text-gray-600 dark:text-gray-300">
              {article.excerpt}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}

export default Blog

