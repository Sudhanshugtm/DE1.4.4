function isTopLevelH2(node) {
  return node.type.name === 'heading' && node.attrs.level === 2
}

export function getOutlineSectionKeys(doc) {
  const keys = new Set()

  doc.forEach((node) => {
    if (isTopLevelH2(node) && node.attrs.outlineItemKey) {
      keys.add(node.attrs.outlineItemKey)
    }
  })

  return keys
}

export function findSectionRange(doc, key) {
  let from = null
  let to = null
  let foundEnd = false

  doc.forEach((node, offset) => {
    if (foundEnd || !isTopLevelH2(node)) return

    if (from === null) {
      if (node.attrs.outlineItemKey === key) from = offset
      return
    }

    to = offset
    foundEnd = true
  })

  if (from === null) return null

  return { from, to: to ?? doc.content.size }
}
