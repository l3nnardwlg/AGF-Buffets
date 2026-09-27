const clone = (value) => JSON.parse(JSON.stringify(value))

export function createTemplateId() {
  return `tpl_${Date.now()}_${Math.floor(Math.random() * 100000)}`
}

export function createVersionId() {
  return `ver_${Date.now()}_${Math.floor(Math.random() * 100000)}`
}

export function createTemplateFromBuffet(buffet, options = {}) {
  const now = new Date().toISOString()
  return {
    id: options.id || createTemplateId(),
    name: options.name || buffet.title || 'Neue Vorlage',
    description: options.description || '',
    category: options.category || 'Eigene Vorlagen',
    tags: [...(options.tags || buffet.tags || [])],
    status: options.status || 'draft',
    createdAt: options.createdAt || now,
    updatedAt: now,
    publishedAt: null,
    currentVersion: 1,
    versions: [
      createTemplateVersion(buffet, 1, options.author || null, options.note || 'Initiale Version'),
    ],
  }
}

export function createTemplateVersion(buffet, version, author = null, note = '') {
  return {
    id: createVersionId(),
    version,
    createdAt: new Date().toISOString(),
    author,
    note,
    buffet: clone(buffet),
  }
}

export function latestVersion(template) {
  if (!template?.versions?.length) {
    return null
  }
  return [...template.versions].sort((a, b) => b.version - a.version)[0]
}

export function templateBuffet(template) {
  const version = latestVersion(template)
  return version ? clone(version.buffet) : null
}

export function addTemplateVersion(template, buffet, options = {}) {
  const next = clone(template)
  const current = latestVersion(next)
  const versionNumber = (current?.version || 0) + 1
  const version = createTemplateVersion(
    buffet,
    versionNumber,
    options.author || null,
    options.note || '',
  )
  next.versions = [...(next.versions || []), version]
  next.currentVersion = versionNumber
  next.updatedAt = version.createdAt
  return next
}

export function restoreTemplateVersion(template, versionId, options = {}) {
  const source = template.versions?.find((version) => version.id === versionId)
  if (!source) {
    throw new Error('Vorlagenversion nicht gefunden')
  }
  return addTemplateVersion(
    template,
    source.buffet,
    {
      author: options.author || null,
      note: options.note || `Version ${source.version} wiederhergestellt`,
    },
  )
}

export function publishTemplate(template) {
  const next = clone(template)
  next.status = 'published'
  next.publishedAt = new Date().toISOString()
  next.updatedAt = next.publishedAt
  return next
}

export function archiveTemplate(template) {
  const next = clone(template)
  next.status = 'archived'
  next.updatedAt = new Date().toISOString()
  return next
}

export function draftTemplate(template) {
  const next = clone(template)
  next.status = 'draft'
  next.updatedAt = new Date().toISOString()
  return next
}

export function renameTemplate(template, name) {
  const next = clone(template)
  next.name = String(name || '').trim() || next.name
  next.updatedAt = new Date().toISOString()
  return next
}

export function retagTemplate(template, tags) {
  const next = clone(template)
  next.tags = [...new Set((tags || []).map((tag) => String(tag).trim()).filter(Boolean))]
  next.updatedAt = new Date().toISOString()
  return next
}

export function categorizeTemplate(template, category) {
  const next = clone(template)
  next.category = String(category || '').trim() || 'Ohne Kategorie'
  next.updatedAt = new Date().toISOString()
  return next
}

export function duplicateTemplate(template, options = {}) {
  const buffet = templateBuffet(template)
  if (!buffet) {
    throw new Error('Vorlage enthält keine Buffet-Version')
  }
  return createTemplateFromBuffet(
    buffet,
    {
      name: options.name || `${template.name} – Kopie`,
      description: template.description,
      category: template.category,
      tags: template.tags,
      author: options.author || null,
      note: 'Aus bestehender Vorlage dupliziert',
    },
  )
}

export function instantiateTemplate(template, options = {}) {
  const buffet = templateBuffet(template)
  if (!buffet) {
    throw new Error('Vorlage enthält keine Buffet-Version')
  }
  buffet.id = options.buffetId || `buffet_${Date.now()}`
  buffet.templateId = template.id
  buffet.templateVersion = latestVersion(template)?.version || null
  buffet.title = options.title || template.name
  if (options.totalPersons != null) {
    buffet.totalPersons = Math.max(1, Number(options.totalPersons) || 1)
  }
  buffet.createdAt = new Date().toISOString()
  buffet.updatedAt = buffet.createdAt
  return buffet
}

export function searchTemplates(templates, query) {
  const needle = String(query || '').trim().toLowerCase()
  if (!needle) {
    return [...templates]
  }
  return templates.filter((template) => {
    const fields = [
      template.name,
      template.description,
      template.category,
      ...(template.tags || []),
    ]
    return fields.some((field) => String(field || '').toLowerCase().includes(needle))
  })
}

export function filterTemplatesByStatus(templates, status) {
  if (!status || status === 'all') {
    return [...templates]
  }
  return templates.filter((template) => template.status === status)
}

export function filterTemplatesByCategory(templates, category) {
  if (!category || category === 'all') {
    return [...templates]
  }
  return templates.filter((template) => template.category === category)
}

export function sortTemplates(templates, mode = 'updated-desc') {
  const result = [...templates]
  if (mode === 'name-asc') {
    return result.sort((a, b) => a.name.localeCompare(b.name, 'de'))
  }
  if (mode === 'name-desc') {
    return result.sort((a, b) => b.name.localeCompare(a.name, 'de'))
  }
  if (mode === 'created-desc') {
    return result.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  }
  return result.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
}

export function templateCategories(templates) {
  return [...new Set(templates.map((template) => template.category).filter(Boolean))].sort()
}

export function templateTags(templates) {
  return [...new Set(templates.flatMap((template) => template.tags || []))].sort()
}

export function templateStats(templates) {
  return {
    total: templates.length,
    drafts: templates.filter((template) => template.status === 'draft').length,
    published: templates.filter((template) => template.status === 'published').length,
    archived: templates.filter((template) => template.status === 'archived').length,
    versions: templates.reduce((sum, template) => sum + (template.versions?.length || 0), 0),
  }
}
