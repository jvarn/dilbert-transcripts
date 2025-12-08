import React from 'react'
import { Link } from 'react-router-dom'

const baseUrl = import.meta.env.BASE_URL

export const metadata = {
  id: 'sentiment-analysis',
  title: 'Quantifying 35 Years of Workplace Cynicism: A Basic Sentiment Analysis of Dilbert (1989–2023)',
  date: '2025-12-07',
  excerpt: 'An analysis of sentiment trends in Dilbert comics over 35 years using natural language processing techniques.'
}

export function Content() {
  return (
    <div className="space-y-8">
      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
        One of the goals of this archive is to make <em className="italic text-gray-900 dark:text-gray-100">Dilbert</em> accessible for research,
        exploration, and study—whether you're curious about comics, workplace culture, humour,
        or linguistic patterns. To that end, I recently analysed <strong className="font-semibold text-gray-900 dark:text-gray-100">12,384 Dilbert comic transcripts</strong>
        spanning the entire run from <strong className="font-semibold text-gray-900 dark:text-gray-100">1989 to 2023</strong> to understand how the emotional tone of the strip
        has changed over time.
      </p>

      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
        Using a pre‑trained natural language processing model, each comic was assigned a sentiment
        score based solely on its text—not on how funny it is, but on the emotional valence the
        language conveys. In a comic built on frustration, incompetence, and corporate absurdity,
        negative sentiment is expected—but the trend over 35 years turned out to be surprisingly rich.
      </p>

      <div className="my-8 p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          What Does This Chart Actually Show?
        </h3>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
          Sentiment analysis looks at the probability that text expresses a positive or negative emotion.
        </p>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
          In the case of <em className="italic">Dilbert</em>, nearly all comics skew negative—no surprise for a strip built on workplace frustration, managerial incompetence, and corporate absurdity. However, what's interesting is <strong className="font-semibold">how this negativity changes over time</strong>.
        </p>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-6 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
        Year‑by‑Year Sentiment Trend
      </h2>

      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
        This chart shows the average sentiment score for each year. Negative values indicate
        negative emotional tone, while values closer to zero indicate milder language.
      </p>

      <div className="my-8 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <img
          src={`${baseUrl}articles-images/Sentiment_Analysis_Figure_1.png`}
          alt="Year-by-Year Sentiment Trend in Dilbert Transcripts (1989-2023)"
          className="w-full h-auto rounded-lg"
        />
      </div>

      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-6 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
        What the Results Reveal
      </h2>

      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Early Years (1989–1994): Milder Negativity
          </h3>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
            The first few years display the least severe negativity in the entire series.
          </p>
          <ul className="list-disc list-outside space-y-2 text-lg text-gray-700 dark:text-gray-300 ml-6 my-4">
            <li>Workplace humour is more observational than bitter.</li>
            <li>Dilbert is portrayed as naïve rather than hopeless.</li>
            <li>Corporate dysfunction is present, but the tone is gentler.</li>
          </ul>
          <p className="text-base text-gray-600 dark:text-gray-400 italic">
            Average sentiment in these years ranges from −0.40 to −0.52, which is still negative, but relatively soft compared to what comes later.
          </p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Classic Era Stability (mid‑1990s to mid‑2000s)
          </h3>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
            From 1995 through roughly 2005, the strip settles into a remarkably consistent tone.
          </p>
          <ul className="list-disc list-outside space-y-2 text-lg text-gray-700 dark:text-gray-300 ml-6 my-4">
            <li>Themes solidify: the Pointy-Haired Boss, Wally's sloth, Dogbert's evil consulting.</li>
            <li>The humour becomes drier and more cynical, but stays within a narrow band.</li>
          </ul>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            This "plateau of cynicism" forms what many fans consider <strong className="font-semibold">peak Dilbert</strong>.
          </p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            The Downward Slide (2015–2021)
          </h3>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
            This is the most striking finding. The analysis shows a sharp decline in sentiment, reaching a low point in <strong className="font-semibold">2019 with the most negative language in the entire 35-year run</strong>.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
            Why does this happen?
          </p>
          <ul className="list-disc list-outside space-y-2 text-lg text-gray-700 dark:text-gray-300 ml-6 my-4">
            <li>Jokes lean heavily into corporate despair rather than light satire.</li>
            <li>Characters suffer more frequent humiliation or defeat.</li>
            <li>Sarcasm intensifies.</li>
            <li>Workplace commentary grows darker and more biting.</li>
          </ul>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            This aligns with many readers' subjective experience of the later strip: more bitterness, less innocence.
          </p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            COVID‑Era Softening (2020–2023)
          </h3>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
            Surprisingly, negativity decreases slightly after the 2019 trough.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
            Possible explanations:
          </p>
          <ul className="list-disc list-outside space-y-2 text-lg text-gray-700 dark:text-gray-300 ml-6 my-4">
            <li>Some story arcs shift toward absurdity rather than pure cynicism.</li>
            <li>The pandemic reshaped humour around remote work, technical chaos, and new frustrations.</li>
            <li>The final year (2023) contains fewer comics, increasing statistical noise.</li>
          </ul>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            Even so, the late-era tone remains significantly more negative than the early years or the classic 1990s era.
          </p>
        </div>
      </div>

      <div className="my-10 p-6 rounded-lg bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 dark:border-amber-400">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <span className="text-2xl">🤔</span>
          What Does "Negative" Mean in a Humour Context?
        </h2>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          It's important to note:
        </p>
        <ul className="list-disc list-outside space-y-2 text-base text-gray-700 dark:text-gray-300 ml-6 mb-4">
          <li>Sentiment analysis isn't a measure of <em className="italic">funny</em>.</li>
          <li>It doesn't understand punchlines or irony.</li>
          <li>It simply detects emotional valence in the language itself.</li>
        </ul>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
          So when Dilbert complains, or Wally slacks off, or the PHB humiliates someone, the model sees:
        </p>
        <ul className="list-disc list-outside space-y-2 text-base text-gray-700 dark:text-gray-300 ml-6 mb-4">
          <li>frustration</li>
          <li>anger</li>
          <li>disappointment</li>
          <li>failure</li>
          <li>conflict</li>
        </ul>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
          These are exactly the ingredients of Dilbert's humour. The negativity you see isn't a flaw in the analysis—it's a quantitative reflection of <strong className="font-semibold">the strip's comedic DNA</strong>. Over time, that DNA clearly shifted.
        </p>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-6 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
        What This Tells Us About Dilbert as Cultural Commentary
      </h2>
      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
        This dataset offers a rare, measurable window into how workplace culture—and satire of that culture—evolved from the late 1980s to the early 2020s.
      </p>
      <ul className="list-disc list-outside space-y-3 text-lg text-gray-700 dark:text-gray-300 ml-6 my-6">
        <li>The early optimism of the tech boom</li>
        <li>The stable absurdity of corporate life in the 1990s</li>
        <li>Outsourcing, layoffs, and office malaise of the 2000s</li>
        <li>Workplace burnout and organisational dysfunction of the 2010s</li>
        <li>Remote-work chaos and existential humour of the early 2020s</li>
      </ul>
      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
        <em className="italic">Dilbert</em> reacted to all of it, and the language reflects those shifts.
      </p>

      <div className="my-10 p-6 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔬</span>
          Technical Details
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400 mb-4 italic">For those curious about the methodology:</p>
        <ul className="list-disc list-outside space-y-2 text-base text-gray-700 dark:text-gray-300 ml-6 mb-4">
          <li><strong className="font-semibold">Dataset size:</strong> 12,384 comic transcripts</li>
          <li><strong className="font-semibold">Years covered:</strong> 1989–2023</li>
          <li><strong className="font-semibold">Method:</strong> Hugging Face DistilBERT sentiment pipeline</li>
          <li><strong className="font-semibold">Approach:</strong>
            <ul className="list-disc list-outside space-y-1 ml-6 mt-2">
              <li>Compute sentiment for each transcript</li>
              <li>Convert positive/negative to a numeric score</li>
              <li>Average by year</li>
            </ul>
          </li>
        </ul>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
          If you're interested in the code used to run this analysis, you can find it at{' '}
          <a 
            href="https://github.com/jvarn/dilbert-archive/tree/main/analysis/yearly_sentiment" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium"
          >
            github.com/jvarn/dilbert-archive/tree/main/analysis/yearly_sentiment
          </a>
          .
        </p>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-6 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
        What Comes Next?
      </h2>
      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
        This analysis is only the beginning. The dataset makes it possible to explore:
      </p>
      <ul className="list-disc list-outside space-y-2 text-lg text-gray-700 dark:text-gray-300 ml-6 my-4">
        <li>
          <Link to="/articles/sarcasm-emotions" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium">Emotion classification</Link>
        </li>
        <li>Topic evolution over time (meetings, management, technology)</li>
        <li>Corporate buzzwords by decade</li>
        <li>Humour structure analysis</li>
      </ul>
      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
        Additional visualisations and insights will be added to the archive over time.
      </p>
    </div>
  )
}

