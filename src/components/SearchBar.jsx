function SearchBar({ value, onChange, onSearch, searchButtonId }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (onSearch) {
        onSearch()
      }
    }
  }

  return (
    <div className="relative">
      <label htmlFor="searchInput" className="sr-only">
        Search comics by title or transcript
      </label>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        id="searchInput"
        role="searchbox"
        aria-label="Search comics by title or transcript"
        aria-describedby="searchHelp"
        placeholder="Search titles or descriptions..."
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
      />
      <button
        type="button"
        id={searchButtonId}
        onClick={onSearch}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:text-blue-600 dark:focus:text-blue-400 transition-colors"
        aria-label="Search"
        title="Search (or press Enter)"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
      <span id="searchHelp" className="sr-only">
        Type to search automatically, or press Enter to search immediately
      </span>
    </div>
  )
}

export default SearchBar

