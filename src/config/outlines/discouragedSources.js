// ABOUTME: Domains the community discourages as sources, checked at add time.
// ABOUTME: Prototype stand-in for the per-outline discouraged lists in real outlines.

// Shared across outlines: user-generated and promotional platforms that the
// Simple English outlines discourage almost everywhere. Entries are domains
// (subdomains match) or domain/path prefixes.
const SHARED_DISCOURAGED = [
  'facebook.com',
  'x.com',
  'twitter.com',
  'instagram.com',
  'tiktok.com',
  'youtube.com',
  'reddit.com',
  'pinterest.com',
  'linkedin.com',
  'fandom.com',
  'medium.com',
  'blogspot.com',
]

// Per-outline additions, mirroring how real outlines carry their own lists.
const EXTRA_BY_OUTLINE = {
  person: ['imdb.com'],
  actor: ['imdb.com'],
  celebrity: ['imdb.com'],
  musician: ['imdb.com'],
  sportsperson: ['imdb.com'],
  politician: ['imdb.com'],
}

function hostMatches(host, entryHost) {
  return host === entryHost || host.endsWith(`.${entryHost}`)
}

/**
 * The discouraged entry a URL falls under for this outline, or null.
 *
 * @param {string} url
 * @param {string} outlineId
 * @return {{ domain: string } | null}
 */
export function findDiscouragedSource(url, outlineId) {
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return null
  }

  const host = parsed.hostname.replace(/^www\./, '')
  const path = parsed.pathname

  const entries = [...SHARED_DISCOURAGED, ...(EXTRA_BY_OUTLINE[outlineId] ?? [])]
  for (const entry of entries) {
    const [entryHost, ...entryPath] = entry.split('/')
    if (!hostMatches(host, entryHost)) continue
    if (entryPath.length && !path.startsWith(`/${entryPath.join('/')}`)) continue
    return { domain: entryHost }
  }

  return null
}
