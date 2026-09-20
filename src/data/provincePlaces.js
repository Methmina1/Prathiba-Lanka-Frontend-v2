/**
 * Which journeys go through which province.
 *
 * A journey is matched on the places it names - its title, its region, its summary and every line of
 * its day-by-day itinerary - so the map answers "what goes through here?" from the itinerary the
 * agency already wrote, and keeps answering it as packages are added or edited in the console. There
 * is no extra field to fill in and nothing to keep in step by hand.
 *
 * Each place belongs to the province that administers it: Sigiriya and Dambulla are in Matale
 * district, so they are Central rather than "the Cultural Triangle"; Polonnaruwa and Anuradhapura
 * are North Central. Where a park genuinely straddles two provinces (Udawalawe, Wilpattu) it is
 * listed under both rather than forced into one.
 *
 * The patterns have to be specific, and the near-misses are worth naming:
 *
 *   - "Galle" is Southern, "Galle Face" is in Colombo, so Southern looks ahead and excludes it;
 *   - "Little Adam's Peak" is in Ella (Uva), not Adam's Peak (Sri Pada, Sabaragamuwa), so that
 *     pattern carries an `unless` - the two are 100 km apart and one keyword would merge them.
 */
export const PROVINCE_PLACES = {
  western: [
    /Colombo/i, /Negombo/i, /Gampaha/i, /Kalutara/i, /Pettah/i, /Galle Face/i, /Mount Lavinia/i,
    /Gangaramaya/i, /Lellama/i, /Dutch Canal/i, /Angurukaramulla/i, /Viharamahadevi/i,
    /Independence Square/i, /Barefoot/i, /Kotte/i,
  ],
  central: [
    /Kandy/i, /Matale/i, /Nuwara Eliya/i, /Peradeniya/i, /Horton Plains/i, /World'?s End/i,
    /Ambuluwawa/i, /Hakgala/i, /Gregory Lake/i, /Moon Plains/i, /Sigiriya/i, /Dambulla/i,
    /Pidurangala/i, /Knuckles/i, /Hill Country/i,
  ],
  southern: [
    /\bGalle(?! Face)/i, /Mirissa/i, /Weligama/i, /Matara/i, /Tangalle/i, /Hambantota/i,
    /Unawatuna/i, /Hikkaduwa/i, /Koggala/i, /Rekawa/i, /Yala/i, /Dondra/i, /Polhena/i, /Dickwella/i,
  ],
  northern: [
    /Jaffna/i, /Delft/i, /Nainativu/i, /Point Pedro/i, /Mannar/i, /Adam'?s Bridge/i, /Vavuniya/i,
    /Kilinochchi/i, /Mullaitivu/i, /Casuarina/i, /Nagapooshani/i, /Nallur/i, /Elephant Pass/i,
  ],
  eastern: [
    /Trincomalee/i, /Trinco\b/i, /Batticaloa/i, /Ampara/i, /Arugam Bay/i, /Pottuvil/i, /Kumana/i,
    /Pigeon Island/i, /Koneswaram/i, /Nilaveli/i, /Pasikuda/i, /Passikudah/i, /Marble Beach/i,
    /Uppuveli/i, /Kanniya/i, /Panama/i, /Swami Rock/i,
  ],
  'north-western': [
    /Kurunegala/i, /Puttalam/i, /Wilpattu/i, /Kalpitiya/i, /Chilaw/i, /Yapahuwa/i, /Anawilundawa/i,
    /Coconut Triangle/i,
  ],
  'north-central': [
    /Anuradhapura/i, /Polonnaruwa/i, /Mihintale/i, /Minneriya/i, /Kaudulla/i, /Hurulu/i,
    /Habarana/i, /Ritigala/i, /Gal Vihara/i, /Parakrama Samudra/i, /Cultural Triangle/i,
  ],
  uva: [
    /Badulla/i, /Ella\b/i, /Nine Arch/i, /Bandarawela/i, /Haputale/i, /Lipton/i, /Monaragala/i,
    /Diyaluma/i, /Ravana/i, /Demodara/i, /Udawalawe/i, /Dunhinda/i,
  ],
  sabaragamuwa: [
    /Ratnapura/i, /Kegalle/i, /Pinnawala/i, /Kitulgala/i, /Sinharaja/i, /Sri Pada/i, /Udawalawe/i,
    /Belihuloya/i,
    { match: /Adam'?s Peak/i, unless: /Little Adam'?s Peak/i },
  ],
}

/** Everything a journey says, as one string. */
export function journeyText(pkg) {
  return [pkg?.title, pkg?.destination, pkg?.description, pkg?.itinerary].filter(Boolean).join(' \n ')
}

/** True when a place pattern matches some text, honouring its `unless` escape hatch. */
function mentions(pattern, text) {
  if (pattern instanceof RegExp) return pattern.test(text)
  return pattern.match.test(text) && !pattern.unless?.test(text)
}

/**
 * The journeys that go through a province, best first.
 *
 * Each one comes back as `{ pkg, days, share }`, where `days` is how many of the itinerary's days are
 * spent in that province and `share` is that as a fraction of the trip - so the map can put the tour
 * that is mostly about a province above the one that merely passes through it.
 */
export function journeysInProvince(packages, provinceId) {
  const patterns = PROVINCE_PLACES[provinceId]
  if (!patterns || !packages) return []

  const lines = (pkg) =>
    String(pkg?.itinerary ?? '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)

  return packages
    .map((pkg) => {
      const text = journeyText(pkg)
      if (!patterns.some((pattern) => mentions(pattern, text))) return null

      const days = lines(pkg)
      const here = days.filter((line) => patterns.some((pattern) => mentions(pattern, line))).length
      return { pkg, days: here, share: days.length > 0 ? here / days.length : 0 }
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        b.share - a.share ||
        b.days - a.days ||
        String(a.pkg.title ?? '').localeCompare(String(b.pkg.title ?? '')),
    )
}

export default PROVINCE_PLACES
