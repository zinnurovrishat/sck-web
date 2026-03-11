import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_URL = 'https://sck-stroy.ru'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`

function setMeta(selector: string, attrName: string, attrValue: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attrName, attrValue)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function useSEO(
  title: string,
  description?: string,
  options?: { image?: string; type?: string },
) {
  const location = useLocation()

  useEffect(() => {
    const fullTitle = `${title} — СЦК`
    const canonicalUrl = `${SITE_URL}${location.pathname}`
    const ogImage = options?.image ?? DEFAULT_OG_IMAGE
    const ogType = options?.type ?? 'website'

    // <title>
    document.title = fullTitle

    // description
    if (description) {
      setMeta('meta[name="description"]', 'name', 'description', description)
    }

    // canonical
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl

    // Open Graph
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle)
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl)
    setMeta('meta[property="og:type"]', 'property', 'og:type', ogType)
    setMeta('meta[property="og:image"]', 'property', 'og:image', ogImage)
    if (description) {
      setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    }

    // Twitter Card
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle)
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage)
    if (description) {
      setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    }
  }, [title, description, location.pathname, options?.image, options?.type])
}
