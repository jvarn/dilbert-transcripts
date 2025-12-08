import React from 'react'
import { Link } from 'react-router-dom'

const baseUrl = import.meta.env.BASE_URL

export const metadata = {
  id: 'sarcasm-emotions',
  title: 'Beyond Sentiment: Sarcasm and Emotions',
  date: '2025-12-08',
  excerpt: 'Exploring emotional classification and sarcasm detection in Dilbert comics using advanced NLP techniques.'
}

export function Content() {
  return (
    <div className="space-y-8">
      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
        While <Link to="/articles/sentiment-analysis" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium">sentiment analysis</Link> reveals the overall emotional tone of <em className="italic text-gray-900 dark:text-gray-100">Dilbert</em>, 
        it only scratches the surface of the strip's emotional complexity. The next step is to dive deeper into 
        the specific emotions and rhetorical devices that make Dilbert's humour distinctive—particularly 
        <strong className="font-semibold text-gray-900 dark:text-gray-100"> sarcasm</strong>.
      </p>

      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-6 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
          1. When a Standard Emotion Model Calls Dilbert &quot;Neutral&quot;
        </h2>

        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          The first experiment used the <strong className="font-semibold text-gray-900 dark:text-gray-100"><a href="https://huggingface.co/SamLowe/roberta-base-go_emotions" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium">GoEmotions</a></strong> model, which tries to classify text into
          a fixed set of emotions such as <em className="italic text-gray-900 dark:text-gray-100">joy</em>, <em className="italic text-gray-900 dark:text-gray-100">sadness</em>, <em className="italic text-gray-900 dark:text-gray-100">anger</em>, and so on, plus a catch-all
          label of <em className="italic text-gray-900 dark:text-gray-100">neutral</em>. For each comic transcript, the model picked the single most likely label,
          and I then looked at how those labels shifted from 1989 to 2023.
        </p>

        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          The result was almost comically blunt: according to GoEmotions, the vast majority of Dilbert
          comics are simply <strong className="font-semibold text-gray-900 dark:text-gray-100">neutral</strong>. A handful of strips in each year get tagged with more
          colourful emotions such as <em className="italic text-gray-900 dark:text-gray-100">amusement</em> or <em className="italic text-gray-900 dark:text-gray-100">anger</em>, but they are thin slivers next to the
          broad band of neutrality that dominates the timeline.
        </p>

        <div className="my-8 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <img
            src={`${baseUrl}articles-images/emotions_goemotions_heatmap.png`}
            alt="Heatmap showing GoEmotions top-label proportions by year for Dilbert transcripts"
            className="w-full h-auto rounded-lg"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            Heatmap of GoEmotions top labels by year. The prominent band of yellow in the middle is
            the <em className="italic text-gray-700 dark:text-gray-300">neutral</em> label dominating every year.
          </p>
        </div>

        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          This looks wrong at first glance. Surely a strip so full of corporate misery, humiliation,
          and despair can&apos;t be emotionally neutral. But what the model is really telling us is this:
          <strong className="font-semibold text-gray-900 dark:text-gray-100"> Dilbert almost never uses explicit emotion words.</strong> Characters rarely say they are
          happy, sad, angry, or anxious. Instead, the strip relies on context, understatement, and
          reader inference. To a model trained to look for sentences like &quot;I&apos;m so angry&quot; or &quot;This is
          disgusting&quot;, Dilbert&apos;s clipped workplace dialogue looks factual rather than emotional.
        </p>

        <div className="my-8 p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Why Does GoEmotions Call Dilbert &quot;Neutral&quot;?
          </h3>
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
            When GoEmotions labels a comic as &quot;neutral,&quot; it doesn&apos;t mean the strip lacks emotional content. 
            Instead, it means the text doesn&apos;t contain explicit emotion words like &quot;angry,&quot; &quot;happy,&quot; or &quot;disgusted.&quot;
          </p>
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            Dilbert&apos;s humour works through <strong className="font-semibold text-gray-900 dark:text-gray-100">implication and context</strong> rather than direct emotional statements. 
            A character saying &quot;Of course I&apos;m excited about the mandatory team-building exercise&quot; doesn&apos;t use emotion words, 
            but the sarcasm is clear to readers. This makes GoEmotions a useful baseline—it shows us what happens 
            when you only look for obvious emotional language, which is exactly what Dilbert avoids.
          </p>
        </div>

        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          That makes GoEmotions a useful baseline and also a cautionary tale: if you only look for
          emotion in obvious keywords, you will miss almost everything that makes Dilbert tick. To get
          anywhere interesting, we need to look at tone and rhetoric, not just overt feeling words.
        </p>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-6 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
          2. Measuring Sarcasm: Always On, Rarely Changing
        </h2>

        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Given that Dilbert&apos;s humour lives in deadpan contradiction, the next obvious step was to ask
          a simple question: <strong className="font-semibold text-gray-900 dark:text-gray-100">does the strip actually get more sarcastic over time?</strong> 
          To evaluate this, I used the <a href="https://huggingface.co/cardiffnlp/twitter-roberta-base-irony" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium">CardiffNLP irony model</a>, 
          a RoBERTa-based classifier trained to recognise irony in brief text passages. 
          For each transcript it outputs a probability from 0 to 1 that the text is ironic or sarcastic.
        </p>

        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          When I averaged that sarcasm score by year, the answer was surprisingly clear: the line is
          almost flat. With the exception of a noisy endpoint in 2023 (there are far fewer comics that
          year), every year sits in a narrow band of high sarcasm probability, roughly between 0.76 and
          0.81.
        </p>

        <div className="my-8 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <img
            src={`${baseUrl}articles-images/emotions_sarcasm_trend.png`}
            alt="Line and bar chart showing average sarcasm score and comic counts by year"
            className="w-full h-auto rounded-lg"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            Year-by-year sarcasm scores for Dilbert transcripts. The model sees the strip as uniformly
            sarcastic from beginning to end.
          </p>
        </div>

        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          In other words, <strong className="font-semibold text-gray-900 dark:text-gray-100">Dilbert starts sarcastic and stays sarcastic</strong>. The irony detector recognises
          the same patterns year after year: positive-sounding words in negative situations, &quot;yeah right&quot;
          or &quot;of course&quot; constructions, and characters responding with deadpan acceptance to obviously
          absurd scenarios. Sarcasm isn&apos;t something that gradually seeps into the strip – it is there
          from the very beginning and remains the default mode of humour.
        </p>

        <div className="my-8 p-6 rounded-lg bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 dark:border-amber-400">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <span className="text-2xl">🤔</span>
            What Does Sarcasm Detection Actually Measure?
          </h3>
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
            Sarcasm detection looks for linguistic patterns that signal irony: contradictions between surface meaning and intent, 
            deadpan constructions, and contextual mismatches. It&apos;s different from sentiment analysis.
          </p>
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            A sarcastic statement can have <strong className="font-semibold text-gray-900 dark:text-gray-100">any emotional valence</strong>. &quot;Great, another meeting&quot; 
            might score high for sarcasm while also being negative in sentiment. The fact that Dilbert&apos;s sarcasm 
            stays constant while sentiment becomes more negative tells us that the strip&apos;s rhetorical style hasn&apos;t changed— 
            but the underlying emotional content has shifted from amused cynicism to something darker.
          </p>
        </div>

        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          This also gives us an important negative result: the steady drift towards more negative
          sentiment over time (seen in the earlier analysis) is <strong className="font-semibold text-gray-900 dark:text-gray-100">not</strong> simply because Dilbert became
          &quot;more sarcastic&quot;. Sarcasm is basically constant. Something else is changing.
        </p>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-6 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
          3. Custom Emotions: Waves of Cynicism, Peaks of Anger, and Fading Amusement
        </h2>

        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          To dig into that &quot;something else,&quot; I turned to a <a href="https://huggingface.co/MoritzLaurer/deberta-v3-large-zeroshot-v1" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium">DeBERTa-v3 zero-shot model by Moritz Laurer</a>, 
          which can score entirely custom emotion labels without being trained on them. 
          Instead of using a fixed emotion inventory, this model lets us propose our 
          own labels and asks, for each comic, how well each label applies. For Dilbert, I chose a set 
          of emotions that felt truer to the strip&apos;s tone:
        </p>

        <ul className="list-disc list-outside space-y-2 text-lg text-gray-700 dark:text-gray-300 ml-6 my-4">
          <li><strong className="font-semibold text-gray-900 dark:text-gray-100">amusement</strong></li>
          <li><strong className="font-semibold text-gray-900 dark:text-gray-100">frustration</strong></li>
          <li><strong className="font-semibold text-gray-900 dark:text-gray-100">annoyance</strong></li>
          <li><strong className="font-semibold text-gray-900 dark:text-gray-100">cynicism</strong></li>
          <li><strong className="font-semibold text-gray-900 dark:text-gray-100">resignation</strong></li>
          <li><strong className="font-semibold text-gray-900 dark:text-gray-100">anger</strong></li>
          <li><strong className="font-semibold text-gray-900 dark:text-gray-100">optimism</strong></li>
          <li><strong className="font-semibold text-gray-900 dark:text-gray-100">neutral</strong></li>
        </ul>

        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          For each transcript, the model returns a score between 0 and 1 for each of these labels. When
          we average those scores by year (and set aside 2023, where the smaller number of comics makes
          the averages more volatile), a much more nuanced pattern appears.
        </p>

        <div className="my-8 p-6 rounded-lg bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 dark:border-purple-400">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            How to Read the Zero-Shot Emotion Scores
          </h3>
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
            Unlike GoEmotions, which picks a single top label, the zero-shot model scores <strong className="font-semibold text-gray-900 dark:text-gray-100">all eight emotions simultaneously</strong>. 
            Each comic gets a score from 0 to 1 for amusement, frustration, cynicism, and so on. These scores aren&apos;t mutually exclusive— 
            a comic can score high for both cynicism and amusement at the same time.
          </p>
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            When we average these scores by year, we&apos;re looking at the <strong className="font-semibold text-gray-900 dark:text-gray-100">prevalence</strong> of each emotion across all comics in that year. 
            A high score doesn&apos;t mean every comic is cynical—it means cynicism appears more frequently or more strongly 
            in the year&apos;s comics overall. The heatmap shows how these emotional textures shift over time, revealing 
            patterns that single-label classification would miss.
          </p>
        </div>

        <div className="my-8 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <img
            src={`${baseUrl}articles-images/emotions_zeroshot_heatmap.png`}
            alt="Heatmap showing zero-shot emotion scores by year for Dilbert transcripts"
            className="w-full h-auto rounded-lg"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            Zero-shot emotion heatmap using custom labels such as cynicism, frustration, anger,
            amusement, and optimism. Unlike the GoEmotions model, this view reveals distinct waves and
            shifts over time.
          </p>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            3.1 Cynicism in Waves, Not a Straight Line
          </h3>

          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            One of the clearest signals is <strong className="font-semibold text-gray-900 dark:text-gray-100">cynicism</strong>. Rather than simply rising in a straight line,
            it appears in multi-year waves. Ignoring 2023, the model sees major peaks in cynicism 
            around <strong className="font-semibold text-gray-900 dark:text-gray-100">1997</strong> and <strong className="font-semibold text-gray-900 dark:text-gray-100">2009</strong>, with slightly lower but still prominent peaks 
            around <strong className="font-semibold text-gray-900 dark:text-gray-100">2015</strong> and <strong className="font-semibold text-gray-900 dark:text-gray-100">2018</strong>. Each of these peaks sits on a smooth curve: cynicism gently ramps up
            for several years, crests, and then ebbs away again.
          </p>

          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            This suggests that Dilbert doesn&apos;t just gradually become more cynical; instead, it cycles
            through periods where the language leans particularly hard into world-weary commentary, before
            easing off slightly. Those waves line up intuitively with broader economic and workplace
            anxieties – the late 1990s tech boom and bust, the 2008–2009 financial crisis era, and renewed
            tensions in the mid-to-late 2010s.
          </p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            3.2 Anger and Optimism: Two Sides of the Same Peaks
          </h3>

          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            The <strong className="font-semibold text-gray-900 dark:text-gray-100">anger</strong> scores follow a different pattern. They are never the dominant emotion, but they do
            show clear high points around <strong className="font-semibold text-gray-900 dark:text-gray-100">2009</strong> and <strong className="font-semibold text-gray-900 dark:text-gray-100">2018</strong>. Both of these anger peaks coincide with
            local <strong className="font-semibold text-gray-900 dark:text-gray-100">troughs in optimism</strong>. When anger is at its brightest in the heatmap, optimism is at some
            of its lowest values.
          </p>

          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            In other words, there are two distinct periods where Dilbert&apos;s language tilts towards outright
            irritation while any sense of hopeful or positive framing recedes into the background. The
            sarcasm is still there, but it carries less of a playful wink and more of a sharp edge.
          </p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            3.3 Amusement: The Long, Slow Decline
          </h3>

          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            Perhaps the simplest and most intuitive trend is <strong className="font-semibold text-gray-900 dark:text-gray-100">amusement</strong>. Its scores show a fairly steady
            decline over the full 35-year span. There are small bumps and wiggles, but the broad direction
            is clear: the model sees early Dilbert as more amused by the absurdity of office life, and
            later Dilbert as less so.
          </p>

          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            Readers often report something similar subjectively. The early strips feel like a delighted
            skewering of corporate nonsense. Over time, the humour shifts towards a more tired recognition
            that the nonsense is not going away. The jokes are still there, but the emotional palette
            behind them has changed.
          </p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            3.4 Frustration, Annoyance, and Resignation: Background Texture
          </h3>

          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            By contrast, <strong className="font-semibold text-gray-900 dark:text-gray-100">frustration</strong> and <strong className="font-semibold text-gray-900 dark:text-gray-100">annoyance</strong> do not stand out as dramatically in the heatmap.
            They form more of a steady background texture: always present, with modest variation, but without
            the pronounced waves we see for cynicism, or the mirror-image peaks of anger and optimism.
          </p>

          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            <strong className="font-semibold text-gray-900 dark:text-gray-100">Resignation</strong> behaves similarly, sitting quietly in the mid-range. It does seem to drift upward
            over the decades, but gently rather than dramatically. Together, these three emotions look less
            like headline shifts and more like the constant emotional bedrock of Dilbert: a baseline sense
            that the situation is irritating, tiring, and unlikely to improve, no matter how many comics we
            draw about it.
          </p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            3.5 Putting It Together
          </h3>

          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            Combining all three analyses, a coherent picture emerges. GoEmotions tells us that Dilbert uses
            remarkably little explicit emotional language. The sarcasm detector tells us that the strip has
            been consistently sarcastic from its earliest days. And the zero-shot emotion model shows that
            within that stable, sarcastic shell, the balance of feelings has changed:
          </p>

          <ul className="list-disc list-outside space-y-2 text-lg text-gray-700 dark:text-gray-300 ml-6 my-4">
            <li>cynicism arrives early, then returns in distinct waves over the decades,</li>
            <li>anger peaks at moments when optimism is at its weakest,</li>
            <li>amusement slowly ebbs away, and</li>
            <li>frustration, annoyance, and resignation sit beneath it all as a kind of constant hum.</li>
          </ul>

          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            Taken together with the earlier sentiment analysis, this suggests that Dilbert doesn&apos;t just
            become &quot;more negative&quot; with time. Instead, it shifts from playful, amused cynicism towards a
            tone that is more exasperated, resigned, and occasionally angry, while remaining sarcastic all
            the way through.
          </p>
        </div>
      </div>

      <div className="my-10 p-6 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔬</span>
          Technical Details
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400 mb-4 italic">
          For those curious about how the emotion and sarcasm models were applied:
        </p>
        <ul className="list-disc list-outside space-y-2 text-base text-gray-700 dark:text-gray-300 ml-6 mb-4">
          <li>
            <strong className="font-semibold text-gray-900 dark:text-gray-100">Dataset size:</strong> 12,384 text transcripts of Dilbert comics
          </li>
          <li>
            <strong className="font-semibold text-gray-900 dark:text-gray-100">Years covered:</strong> 1989–2023
          </li>
          <li>
            <strong className="font-semibold text-gray-900 dark:text-gray-100">Pre-processing:</strong>
            <ul className="list-disc list-outside space-y-1 ml-6 mt-2">
              <li>One transcript per publication date</li>
              <li>Year extracted from the comic&apos;s date</li>
              <li>Aggregation by year (mean values or proportions, depending on the metric)</li>
            </ul>
          </li>
          <li>
            <strong className="font-semibold text-gray-900 dark:text-gray-100">Models used:</strong>
            <ul className="list-disc list-outside space-y-2 ml-6 mt-2">
              <li>
                <strong className="font-semibold text-gray-900 dark:text-gray-100">GoEmotions (emotions_goemotions*)</strong>
                <ul className="list-disc list-outside space-y-1 ml-6 mt-1">
                  <li>Model: <code className="text-xs"><a href="https://huggingface.co/SamLowe/roberta-base-go_emotions" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium">SamLowe/roberta-base-go_emotions</a></code></li>
                  <li>Task: multi-label emotion classification over 28 labels (plus neutral)</li>
                  <li>For the heatmap: used the <em className="italic text-gray-900 dark:text-gray-100">top</em> emotion per comic and computed yearly proportions</li>
                </ul>
              </li>
              <li>
                <strong className="font-semibold text-gray-900 dark:text-gray-100">Sarcasm detection (emotions_sarcasm*)</strong>
                <ul className="list-disc list-outside space-y-1 ml-6 mt-1">
                  <li>Model: <code className="text-xs"><a href="https://huggingface.co/cardiffnlp/twitter-roberta-base-irony" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium">cardiffnlp/twitter-roberta-base-irony</a></code></li>
                  <li>Task: binary irony vs non-irony classification</li>
                  <li>For the trend: interpreted the model&apos;s probability as a &quot;sarcasm score&quot; and averaged by year</li>
                </ul>
              </li>
              <li>
                <strong className="font-semibold text-gray-900 dark:text-gray-100">Zero-shot emotions (emotions_zeroshot*)</strong>
                <ul className="list-disc list-outside space-y-1 ml-6 mt-1">
                  <li>Model: <code className="text-xs"><a href="https://huggingface.co/MoritzLaurer/deberta-v3-large-zeroshot-v1" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium">MoritzLaurer/deberta-v3-large-zeroshot-v1</a></code></li>
                  <li>Task: zero-shot classification over custom labels</li>
                  <li>
                    Candidate labels:{' '}
                    <span className="italic text-gray-700 dark:text-gray-300">
                      amusement, frustration, annoyance, cynicism, resignation, anger, optimism, neutral
                    </span>
                  </li>
                  <li>For the heatmap: averaged each label&apos;s score across all comics in the same year</li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
          All of these analyses were run locally in Python using the Hugging Face{' '}
          <code className="text-xs">transformers</code> library, with <code className="text-xs">pandas</code> for data
          handling and <code className="text-xs">matplotlib</code> for plotting. If you&apos;re interested in the code,
          you can browse the analysis scripts at{' '}
          <a
            href="https://github.com/jvarn/dilbert-transcripts/tree/main/analysis/yearly_emotions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium"
          >
            github.com/jvarn/dilbert-transcripts/tree/main/analysis/yearly_emotions
          </a>
          .
        </p>
      </div>
    </div>
  )
}

