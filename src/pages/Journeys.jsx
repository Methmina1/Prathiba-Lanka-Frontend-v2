import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { fallbackPackages } from '../data/fallback'
import { useApi } from '../hooks/useApi'
import PageHero from '../components/layout/PageHero'
import PackageCard from '../components/ui/PackageCard'
import Reveal from '../components/ui/Reveal'
import { Search } from '../components/ui/Icons'

export default function Journeys() {
  const { data: packages, status } = useApi(() => api.getPackages(), fallbackPackages)
  const [params, setParams] = useSearchParams()
  const urlTerm = params.get('destination') ?? ''

  const [term, setTerm] = useState(urlTerm)
  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [searchNote, setSearchNote] = useState('')

  const runSearch = useCallback(
    async (value) => {
      const trimmed = value.trim()
      if (!trimmed) {
        setResults(null)
        setSearchNote('')
        return
      }

      setSearching(true)
      setSearchNote('')
      try {
        const found = await api.searchPackages(trimmed)
        setResults(Array.isArray(found) ? found : [])
      } catch {
        // the page still works without the backend: filter what we already have
        const needle = trimmed.toLowerCase()
        setResults(
          packages.filter((pkg) =>
            `${pkg.title ?? ''} ${pkg.destination ?? ''}`.toLowerCase().includes(needle)
          )
        )
        setSearchNote('The search endpoint is unavailable, so this is filtered locally.')
      } finally {
        setSearching(false)
      }
    },
    [packages]
  )

  // Deep links such as /journeys?destination=yala (used by the nav and footer) run a search
  useEffect(() => {
    setTerm(urlTerm)
    runSearch(urlTerm)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlTerm])

  function submitSearch(event) {
    event.preventDefault()
    const value = term.trim()
    // keep the term in the URL so the result is shareable and survives a refresh
    setParams(value ? { destination: value } : {}, { replace: true })
    runSearch(value)
  }

  function clearSearch() {
    setTerm('')
    setResults(null)
    setSearchNote('')
    setParams({}, { replace: true })
  }

  const shown = results ?? packages

  return (
    <main className="page-enter">
      <PageHero
        eyebrow="Curated journeys"
        title="Signature journeys"
        lede="Starting points, not fixed departures. Every itinerary below can be stretched, shortened or rebuilt around your dates and your pace."
        crumbs={[{ label: 'Journeys' }]}
        scenery="tea"
      />

      <section className="section">
        <div className="container">
          <form className="searchbar" onSubmit={submitSearch} role="search">
            <Search width={18} height={18} />
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search by destination - try Yala, Ella or Galle"
              aria-label="Search journeys by destination"
            />
            <button className="btn btn--cta btn--sm" type="submit" disabled={searching}>
              {searching ? '…' : 'Search'}
            </button>
            {results && (
              <button type="button" className="searchbar__clear" onClick={clearSearch}>
                Clear
              </button>
            )}
          </form>

          {searchNote && <p className="notice">{searchNote}</p>}

          {status === 'fallback' && (
            <p className="notice">
              Showing sample journeys. Start the backend on port 8080 and these load from
              <code> /api/packages</code>.
            </p>
          )}

          {results && (
            <p className="results-line">
              {shown.length} {shown.length === 1 ? 'journey' : 'journeys'} for “{term.trim()}”
            </p>
          )}

          {shown.length === 0 ? (
            <div className="empty-state">
              <h3>Nothing matches that yet</h3>
              <p>
                We build custom itineraries too - tell us where you would like to go and we will
                draft something.
              </p>
              <a className="btn btn--cta btn--sweep" href="/plan">
                Plan a custom trip
              </a>
            </div>
          ) : (
            <div className="grid grid--3">
              {shown.map((pkg, index) => (
                <Reveal key={pkg.packageId} delay={index * 90} variant="reveal--zoom">
                  <PackageCard pkg={pkg} index={index} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
