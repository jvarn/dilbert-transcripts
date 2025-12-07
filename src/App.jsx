import { useState, useEffect, useCallback } from 'react'
import SearchBar from './components/SearchBar'
import DatePicker from './components/DatePicker'
import SearchResults from './components/SearchResults'
import ComicDisplay from './components/ComicDisplay'
import NavigationButtons from './components/NavigationButtons'
import TranscriptPanel from './components/TranscriptPanel'
import DarkModeToggle from './components/DarkModeToggle'
import SettingsModal from './components/SettingsModal'
import { getCachedIndex, cacheIndex, getCachedYear, cacheYear } from './utils/indexedDB'

function App() {
  const [comicsIndex, setComicsIndex] = useState(null)
  const [comicsData, setComicsData] = useState({}) // Object keyed by year: { "1989": {...}, "1990": {...} }
  const [currentDate, setCurrentDate] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchStatus, setSearchStatus] = useState('') // For ARIA live region
  const [immediateSearch, setImmediateSearch] = useState(false) // Flag for Enter key search
  const [loading, setLoading] = useState(true)
  const [loadingStage, setLoadingStage] = useState(null) // "index" | "year" | "search" | null
  const [loadingYear, setLoadingYear] = useState(null) // Track which year is being loaded
  const [error, setError] = useState(null)
  const [loadedYears, setLoadedYears] = useState(new Set())
  const [backgroundLoading, setBackgroundLoading] = useState(false)
  const [backgroundLoadingYear, setBackgroundLoadingYear] = useState(null)
  const [backgroundLoadedCount, setBackgroundLoadedCount] = useState(0)
  const [backgroundTotalYears, setBackgroundTotalYears] = useState(0)
  const [useLocalImages, setUseLocalImages] = useState(() => {
    // Load preference from localStorage, default to false (use original URLs)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('useLocalImages')
      return saved === 'true'
    }
    return false
  })
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const baseUrl = import.meta.env.BASE_URL

  // Helper function to load a year's data (with caching)
  const loadYearData = useCallback(async (year) => {
    if (loadedYears.has(year) || comicsData[year]) {
      return comicsData[year] || null
    }

    // Try cache first
    let data = await getCachedYear(year)
    
    if (!data) {
      // Not in cache, fetch from network
      try {
        const response = await fetch(`${baseUrl}comics-data/${year}.json`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        data = await response.json()
        // Cache it for next time (don't await, fire and forget)
        cacheYear(year, data).catch(err => {
          console.warn(`Failed to cache year ${year}:`, err)
        })
      } catch (error) {
        console.error(`Error loading year ${year}:`, error)
        throw error
      }
    }
    
    setComicsData(prev => ({ ...prev, [year]: data }))
    setLoadedYears(prev => new Set([...prev, year]))
    return data
  }, [baseUrl, loadedYears, comicsData])

  // Handle immediate search (Enter key or button)
  const handleImmediateSearch = useCallback(() => {
    setImmediateSearch(true)
    setDebouncedSearchTerm(searchTerm)
  }, [searchTerm])

  // Debounce search term - wait 500ms after last keystroke
  // Skip debounce if immediate search was triggered
  useEffect(() => {
    if (immediateSearch) {
      setDebouncedSearchTerm(searchTerm)
      setImmediateSearch(false)
      return
    }
    
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, immediateSearch])

  // Stage 1: Load index (cache first)
  // Stage 2: Determine target year
  // Stage 3: Load target year (cache first)
  // Stage 4: Initialize currentDate
  useEffect(() => {
    const loadData = async () => {
      try {
        // Stage 1: Try to load index from cache first
        setLoadingStage('index')
        setLoading(true)
        
        let index = await getCachedIndex()
        
        if (!index) {
          // Not in cache, fetch from network
          const response = await fetch(`${baseUrl}comics-index.json`)
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - Could not find comics-index.json`)
          }
          index = await response.json()
          // Cache it for next time (don't await, fire and forget)
          cacheIndex(index).catch(err => {
            console.warn('Failed to cache index:', err)
          })
        }
        
        setComicsIndex(index)
        
        // Stage 2: Determine target year from URL or use latest
        const urlParams = new URLSearchParams(window.location.search)
        const dateParam = urlParams.get('date')
        const targetYear = dateParam ? dateParam.split('-')[0] : index.latestYear
        
        // Stage 3: Try to load target year from cache first
        setLoadingStage('year')
        setLoadingYear(targetYear)
        
        let yearData = await getCachedYear(targetYear)
        
        if (!yearData) {
          // Not in cache, fetch from network
          const response = await fetch(`${baseUrl}comics-data/${targetYear}.json`)
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - Could not find ${targetYear}.json`)
          }
          yearData = await response.json()
          // Cache it for next time (don't await, fire and forget)
          cacheYear(targetYear, yearData).catch(err => {
            console.warn(`Failed to cache year ${targetYear}:`, err)
          })
        }
        
        setComicsData({ [targetYear]: yearData })
        setLoadedYears(new Set([targetYear]))
        
        // Stage 4: Initialize currentDate
        if (dateParam && yearData[dateParam]) {
          setCurrentDate(dateParam)
        } else {
          // Default to last comic date in the loaded year or overall latest
          const dates = Object.keys(yearData).sort()
          const defaultDate = dates.length > 0 ? dates[dates.length - 1] : 
            (index.dates.length > 0 ? index.dates[index.dates.length - 1].date : null)
          if (defaultDate) {
            setCurrentDate(defaultDate)
            window.history.replaceState({}, '', `?date=${defaultDate}`)
          }
        }
        
        setLoading(false)
        setLoadingStage(null)
        setLoadingYear(null)
      } catch (error) {
        console.error('Error loading comics data:', error)
        setError(error.message)
        setLoading(false)
        setLoadingStage(null)
        setLoadingYear(null)
      }
    }
    
    loadData()
  }, [baseUrl])

  // Background loading: Load years 2022 down to 1989 after initial load
  useEffect(() => {
    if (!comicsIndex || loading || !currentDate || backgroundLoading) return

    // Get years to load: 2022 down to 1989 (excluding 2023 which is already loaded)
    const yearsToLoad = comicsIndex.years
      .filter(year => {
        const yearNum = parseInt(year)
        return yearNum >= 1989 && yearNum <= 2022 && !loadedYears.has(year) && !comicsData[year]
      })
      .sort((a, b) => parseInt(b) - parseInt(a)) // Sort descending (2022 first)

    if (yearsToLoad.length === 0) return

    setBackgroundTotalYears(yearsToLoad.length)
    setBackgroundLoading(true)
    setBackgroundLoadedCount(0)

    // Load years sequentially to avoid overwhelming the network
    const loadNextYear = async (index) => {
      if (index >= yearsToLoad.length) {
        setBackgroundLoading(false)
        setBackgroundLoadingYear(null)
        return
      }

      const year = yearsToLoad[index]
      
      // Double-check year isn't already loaded (might have been loaded by navigation)
      if (loadedYears.has(year) || comicsData[year]) {
        setBackgroundLoadedCount(prev => prev + 1)
        setTimeout(() => {
          loadNextYear(index + 1)
        }, 50)
        return
      }

      setBackgroundLoadingYear(year)

      try {
        await loadYearData(year)
        setBackgroundLoadedCount(prev => prev + 1)
        // Small delay between loads to avoid overwhelming
        setTimeout(() => {
          loadNextYear(index + 1)
        }, 100)
      } catch (error) {
        console.warn(`Failed to load year ${year} in background:`, error)
        // Continue loading other years even if one fails
        setBackgroundLoadedCount(prev => prev + 1)
        setTimeout(() => {
          loadNextYear(index + 1)
        }, 100)
      }
    }

    loadNextYear(0)
  }, [comicsIndex, loading, currentDate, loadedYears, comicsData, loadYearData, backgroundLoading])

  // Lazy load adjacent years when navigating
  useEffect(() => {
    if (!currentDate || !comicsIndex) return

    const currentYear = currentDate.split('-')[0]
    const yearNum = parseInt(currentYear)
    
    // Preload adjacent years
    const yearsToLoad = [
      (yearNum - 1).toString(),
      (yearNum + 1).toString()
    ].filter(y => comicsIndex.years.includes(y) && !loadedYears.has(y) && !comicsData[y])

    yearsToLoad.forEach(year => {
      loadYearData(year).catch(err => {
        console.warn(`Failed to preload year ${year}:`, err)
      })
    })
  }, [currentDate, comicsIndex, loadedYears, comicsData, loadYearData])

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const dateParam = urlParams.get('date')
      
      if (!dateParam || !comicsIndex) return
      
      const year = dateParam.split('-')[0]
      
      // Load year if needed
      if (!comicsData[year]) {
        setLoadingStage('year')
        setLoadingYear(year)
        try {
          await loadYearData(year)
        } catch (error) {
          console.error('Error loading year for popstate:', error)
          setError(error.message)
        } finally {
          setLoadingStage(null)
          setLoadingYear(null)
        }
      }
      
      // Check if date exists in loaded data
      if (comicsData[year]?.[dateParam]) {
        setCurrentDate(dateParam)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [comicsIndex, comicsData, loadYearData])

  // Clear search status when search term is cleared
  useEffect(() => {
    if (!searchTerm) {
      setSearchStatus('')
    }
  }, [searchTerm])

  // Handle search (two-phase approach)
  useEffect(() => {
    if (!comicsIndex || !debouncedSearchTerm) {
      setSearchResults([])
      setSearchStatus('')
      return
    }

    // Announce search start
    setSearchStatus('Searching...')

    const term = debouncedSearchTerm.toLowerCase()
    
    // Phase 1: Search index for title matches
    const titleMatchingDates = comicsIndex.dates.filter(item => {
      return item.title.toLowerCase().includes(term)
    })

    // Phase 2: Search already-loaded years for transcript matches
    const transcriptMatches = []
    Object.keys(comicsData).forEach(year => {
      const yearData = comicsData[year]
      Object.keys(yearData).forEach(date => {
        const comic = yearData[date]
        if (!comic) return
        
        let transcript = comic.transcript ? comic.transcript.toLowerCase() : ''
        transcript = transcript.replace(/\s*\n\s*/g, ' ')
        
        // Check if already in title matches to avoid duplicates
        const alreadyMatched = titleMatchingDates.some(item => item.date === date)
        if (!alreadyMatched && transcript.includes(term)) {
          transcriptMatches.push({ date, year, comic })
        }
      })
    })

    // Phase 3: Identify unique years from title matches that need loading
    const yearsToLoad = new Set(
      titleMatchingDates
        .map(item => item.year)
        .filter(year => !comicsData[year])
    )
    
    // Phase 4: Load missing year files for title matches
    if (yearsToLoad.size > 0) {
      setLoadingStage('search')
      Promise.all(
        Array.from(yearsToLoad).map(year => loadYearData(year))
      )
        .then(loadedYearDataArray => {
          // Build a map of loaded years for easy access
          const loadedYearsMap = {}
          Array.from(yearsToLoad).forEach((year, index) => {
            loadedYearsMap[year] = loadedYearDataArray[index]
          })
          
          // Update comicsData with loaded years
          setComicsData(currentComicsData => ({
            ...currentComicsData,
            ...loadedYearsMap
          }))
          
          // Phase 5: Build results from both title and transcript matches
          // Merge loaded years with current data for building results
          const mergedData = { ...comicsData, ...loadedYearsMap }
          const results = []
          const processedDates = new Set()
          
          // Add title matches
          titleMatchingDates.forEach(item => {
            const yearData = mergedData[item.year]
            if (!yearData) return
            
            const comic = yearData[item.date]
            if (!comic) return
            
            let transcript = comic.transcript ? comic.transcript.toLowerCase() : ''
            transcript = transcript.replace(/\s*\n\s*/g, ' ')
            
            let excerpt = ''
            if (transcript.includes(term)) {
              // Transcript also matches
              const index = transcript.indexOf(term)
              const start = Math.max(0, index - 25)
              const end = Math.min(transcript.length, index + term.length + 25)
              excerpt = transcript.slice(start, end)
              if (start > 0) excerpt = '...' + excerpt
              if (end < transcript.length) excerpt += '...'
            } else {
              // Title match only
              excerpt = transcript.slice(0, 50) + (transcript.length > 50 ? '...' : '')
            }
            
            results.push({
              date: item.date,
              comic,
              excerpt
            })
            processedDates.add(item.date)
          })
          
          // Add transcript-only matches from loaded years
          transcriptMatches.forEach(({ date, comic }) => {
            if (processedDates.has(date)) return
            
            let transcript = comic.transcript ? comic.transcript.toLowerCase() : ''
            transcript = transcript.replace(/\s*\n\s*/g, ' ')
            
            let excerpt = ''
            const index = transcript.indexOf(term)
            const start = Math.max(0, index - 25)
            const end = Math.min(transcript.length, index + term.length + 25)
            excerpt = transcript.slice(start, end)
            if (start > 0) excerpt = '...' + excerpt
            if (end < transcript.length) excerpt += '...'
            
            results.push({
              date,
              comic,
              excerpt
            })
          })
          
          // Sort results by date (newest first)
          results.sort((a, b) => b.date.localeCompare(a.date))
          
          setSearchResults(results)
          setLoadingStage(null)
          // Announce results
          if (results.length === 0) {
            setSearchStatus('No results found')
          } else {
            setSearchStatus(`${results.length} ${results.length === 1 ? 'result' : 'results'} found`)
          }
        })
        .catch(error => {
          console.error('Error loading years for search:', error)
          setError(error.message)
          setLoadingStage(null)
        })
    } else {
      // No years to load, just build results from what we have
      const results = []
      const processedDates = new Set()
      
      // Add title matches
      titleMatchingDates.forEach(item => {
        const yearData = comicsData[item.year]
        if (!yearData) return
        
        const comic = yearData[item.date]
        if (!comic) return
        
        let transcript = comic.transcript ? comic.transcript.toLowerCase() : ''
        transcript = transcript.replace(/\s*\n\s*/g, ' ')
        
        let excerpt = ''
        if (transcript.includes(term)) {
          const index = transcript.indexOf(term)
          const start = Math.max(0, index - 25)
          const end = Math.min(transcript.length, index + term.length + 25)
          excerpt = transcript.slice(start, end)
          if (start > 0) excerpt = '...' + excerpt
          if (end < transcript.length) excerpt += '...'
        } else {
          excerpt = transcript.slice(0, 50) + (transcript.length > 50 ? '...' : '')
        }
        
        results.push({
          date: item.date,
          comic,
          excerpt
        })
        processedDates.add(item.date)
      })
      
      // Add transcript-only matches
      transcriptMatches.forEach(({ date, comic }) => {
        if (processedDates.has(date)) return
        
        let transcript = comic.transcript ? comic.transcript.toLowerCase() : ''
        transcript = transcript.replace(/\s*\n\s*/g, ' ')
        
        let excerpt = ''
        const index = transcript.indexOf(term)
        const start = Math.max(0, index - 25)
        const end = Math.min(transcript.length, index + term.length + 25)
        excerpt = transcript.slice(start, end)
        if (start > 0) excerpt = '...' + excerpt
        if (end < transcript.length) excerpt += '...'
        
        results.push({
          date,
          comic,
          excerpt
        })
      })
      
      // Sort results by date (newest first)
      results.sort((a, b) => b.date.localeCompare(a.date))
      
      setSearchResults(results)
      // Announce results
      if (results.length === 0) {
        setSearchStatus('No results found')
      } else {
        setSearchStatus(`${results.length} ${results.length === 1 ? 'result' : 'results'} found`)
      }
    }
  }, [debouncedSearchTerm, comicsIndex, comicsData, loadYearData])

  // Navigation function
  const navigateTo = useCallback(async (action, date) => {
    if (!comicsIndex) return

    const dates = comicsIndex.dates.map(item => item.date).sort()
    const currentIndex = dates.indexOf(date)
    let newIndex

    switch (action) {
      case 'first':
        newIndex = 0
        break
      case 'previous':
        newIndex = currentIndex > 0 ? currentIndex - 1 : 0
        break
      case 'next':
        newIndex = currentIndex < dates.length - 1 ? currentIndex + 1 : dates.length - 1
        break
      case 'last':
        newIndex = dates.length - 1
        break
      case 'random':
        do {
          newIndex = Math.floor(Math.random() * dates.length)
        } while (newIndex === currentIndex)
        break
      default:
        return
    }

    const newDate = dates[newIndex]
    const newYear = newDate.split('-')[0]
    
    // Load year if needed
    if (!comicsData[newYear]) {
      setLoadingStage('year')
      setLoadingYear(newYear)
      try {
        await loadYearData(newYear)
      } catch (error) {
        console.error('Error loading year for navigation:', error)
        setError(error.message)
        return
      } finally {
        setLoadingStage(null)
        setLoadingYear(null)
      }
    }
    
    setCurrentDate(newDate)
    window.history.pushState({}, '', `?date=${newDate}`)
  }, [comicsIndex, comicsData, loadYearData])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!comicsIndex || !currentDate) return

      if (event.key === 'ArrowLeft') {
        navigateTo('previous', currentDate)
      } else if (event.key === 'ArrowRight') {
        navigateTo('next', currentDate)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [comicsIndex, currentDate, navigateTo])

  // Handle date selection from date picker
  const handleDateSelect = async (date) => {
    if (!comicsIndex) return
    
    const year = date.split('-')[0]
    
    // Check if date exists in index
    const dateExists = comicsIndex.dates.some(item => item.date === date)
    if (!dateExists) {
      alert('No comic available for the selected date.')
      return
    }
    
    // Load year if needed
    if (!comicsData[year]) {
      setLoadingStage('year')
      setLoadingYear(year)
      try {
        await loadYearData(year)
      } catch (error) {
        console.error('Error loading year for date select:', error)
        setError(error.message)
        return
      } finally {
        setLoadingStage(null)
        setLoadingYear(null)
      }
    }
    
    setCurrentDate(date)
    window.history.pushState({}, '', `?date=${date}`)
  }

  // Handle search result click
  const handleResultClick = async (date) => {
    const year = date.split('-')[0]
    
    // Load year if needed
    if (!comicsData[year]) {
      setLoadingStage('year')
      setLoadingYear(year)
      try {
        await loadYearData(year)
      } catch (error) {
        console.error('Error loading year for result click:', error)
        setError(error.message)
        return
      } finally {
        setLoadingStage(null)
        setLoadingYear(null)
      }
    }
    
    setCurrentDate(date)
    setSearchTerm('')
    window.history.pushState({}, '', `?date=${date}`)
  }

  // Get current comic data
  const getCurrentComic = () => {
    if (!currentDate) return null
    const year = currentDate.split('-')[0]
    return comicsData[year]?.[currentDate] || null
  }

  // Get all dates for navigation (from index)
  const getAllDates = () => {
    if (!comicsIndex) return []
    return comicsIndex.dates.map(item => item.date).sort()
  }

  if (loading) {
    let loadingMessage = 'Loading comics data...'
    if (loadingStage === 'index') {
      loadingMessage = 'Loading index...'
    } else if (loadingStage === 'year' && loadingYear) {
      loadingMessage = `Loading comics data for ${loadingYear}...`
    } else if (loadingStage === 'search') {
      loadingMessage = 'Searching comics...'
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
          <p className="text-xl text-gray-700 dark:text-gray-300 font-medium">{loadingMessage}</p>
        </div>
      </div>
    )
  }

  if (!comicsIndex && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-xl text-red-600 dark:text-red-400 font-semibold mb-2">Error loading comics data</p>
          {error && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Error: {error}</p>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Make sure the dev server is running and the JSON files are in the public directory.
          </p>
        </div>
      </div>
    )
  }

  const currentComic = getCurrentComic()
  const allDates = getAllDates()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200 pb-12">
      <header role="banner" className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Dilbert Archive
              </h1>
              <p className="text-center text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base">
                Preserving accessible transcripts of Dilbert comics (1989-2023)
              </p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Open settings"
                title="Settings"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">Settings</span>
              </button>
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>
      
      <main role="main" className="w-full px-4 py-6">
        {currentDate && currentComic ? (
          <div className="flex flex-col lg:flex-row gap-6 w-full">
            {/* Left column - Comic (70%) */}
            <div className="w-full lg:flex-[7] min-w-0">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6 sticky top-6">
                <ComicDisplay 
                  date={currentDate}
                  comic={currentComic}
                  comicsData={comicsData}
                  comicsIndex={comicsIndex}
                  useLocalImages={useLocalImages}
                />
              </div>
            </div>

            {/* Right column - Search, Controls, Transcript, Navigation (30%) */}
            <div className="w-full lg:flex-[3] flex-shrink-0 space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                <div className="space-y-3">
                  <div className="relative">
                    <SearchBar 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onSearch={handleImmediateSearch}
                      searchButtonId="searchButton"
                    />
                  </div>
                  {/* ARIA live region for search status */}
                  <div 
                    role="status" 
                    aria-live="polite" 
                    aria-atomic="true"
                    className="sr-only"
                  >
                    {searchStatus}
                  </div>
                  <div className="relative">
                    <DatePicker
                      value={currentDate || ''}
                      onChange={handleDateSelect}
                      minDate="1989-04-16"
                      maxDate="2023-03-12"
                    />
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <NavigationButtons
                    currentDate={currentDate}
                    onNavigate={navigateTo}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
                  Use <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">←</kbd> <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">→</kbd> keys to navigate
                </div>
              </div>

              {searchTerm ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                  {loadingStage === 'search' ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mb-2" aria-hidden="true"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Searching...</p>
                    </div>
                  ) : (
                    <SearchResults 
                      results={searchResults}
                      onResultClick={handleResultClick}
                    />
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                  <TranscriptPanel
                    date={currentDate}
                    comic={currentComic}
                  />
                </div>
              )}
            </div>
          </div>
        ) : currentDate ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading comic data...</p>
          </div>
        ) : null}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        useLocalImages={useLocalImages}
        setUseLocalImages={setUseLocalImages}
      />

      {/* Background Loading Status */}
      {backgroundLoading && (
        <div className="fixed bottom-14 left-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[220px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Loading archive...
            </span>
          </div>
          {backgroundLoadingYear && (
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Loading {backgroundLoadingYear}...
            </div>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-500">
            {backgroundLoadedCount} / {backgroundTotalYears} years loaded
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div 
              className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(backgroundLoadedCount / backgroundTotalYears) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-2 px-4 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <a
            href="https://github.com/jvarn/dilbert-transcripts"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <span>View on GitHub</span>
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
