export const ValidationSeverity = Object.freeze({
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
})

export function issue(code, message, path = '', severity = ValidationSeverity.ERROR, meta = {}) {
  return {
    code,
    message,
    path,
    severity,
    meta,
  }
}

export function validateBuffet(buffet) {
  const issues = []
  if (!buffet) {
    issues.push(issue('buffet.missing', 'Buffet fehlt'))
    return issues
  }

  if (!String(buffet.title || '').trim()) {
    issues.push(issue('buffet.title.required', 'Buffet benötigt einen Namen', 'title'))
  }

  if (!Number.isFinite(Number(buffet.totalPersons)) || Number(buffet.totalPersons) < 1) {
    issues.push(issue('buffet.persons.invalid', 'Personenzahl muss mindestens 1 sein', 'totalPersons'))
  }

  if (!Array.isArray(buffet.courses)) {
    issues.push(issue('buffet.courses.invalid', 'Gänge müssen als Liste vorliegen', 'courses'))
    return issues
  }

  if (buffet.courses.length === 0) {
    issues.push(issue('buffet.courses.empty', 'Buffet enthält noch keine Gänge', 'courses', ValidationSeverity.WARNING))
  }

  const courseIds = new Set()
  const dishIds = new Set()

  buffet.courses.forEach((course, courseIndex) => {
    const coursePath = `courses.${courseIndex}`

    if (!course?.id) {
      issues.push(issue('course.id.required', 'Gang benötigt eine ID', `${coursePath}.id`))
    } else if (courseIds.has(course.id)) {
      issues.push(issue('course.id.duplicate', 'Gang-ID ist doppelt', `${coursePath}.id`, ValidationSeverity.ERROR, { id: course.id }))
    } else {
      courseIds.add(course.id)
    }

    if (!String(course?.name || '').trim()) {
      issues.push(issue('course.name.required', 'Gang benötigt einen Namen', `${coursePath}.name`))
    }

    if (!Array.isArray(course?.dishes)) {
      issues.push(issue('course.dishes.invalid', 'Gerichte müssen als Liste vorliegen', `${coursePath}.dishes`))
      return
    }

    if (course.dishes.length === 0) {
      issues.push(issue('course.dishes.empty', 'Gang enthält keine Gerichte', `${coursePath}.dishes`, ValidationSeverity.WARNING))
    }

    course.dishes.forEach((dish, dishIndex) => {
      const dishPath = `${coursePath}.dishes.${dishIndex}`

      if (!dish?.id) {
        issues.push(issue('dish.id.required', 'Gericht benötigt eine ID', `${dishPath}.id`))
      } else if (dishIds.has(dish.id)) {
        issues.push(issue('dish.id.duplicate', 'Gericht-ID ist doppelt', `${dishPath}.id`, ValidationSeverity.ERROR, { id: dish.id }))
      } else {
        dishIds.add(dish.id)
      }

      if (!String(dish?.name || '').trim()) {
        issues.push(issue('dish.name.required', 'Gericht benötigt einen Namen', `${dishPath}.name`))
      }

      if (dish.personOverride != null && Number(dish.personOverride) < 1) {
        issues.push(issue('dish.persons.invalid', 'Gericht-Personenzahl muss mindestens 1 sein', `${dishPath}.personOverride`))
      }

      if (dish.markupPct != null && Number(dish.markupPct) < 0) {
        issues.push(issue('dish.markupPct.invalid', 'Prozentaufschlag darf nicht negativ sein', `${dishPath}.markupPct`))
      }

      if (dish.markupEUR != null && Number(dish.markupEUR) < 0) {
        issues.push(issue('dish.markupEUR.invalid', 'Euro-Aufschlag darf nicht negativ sein', `${dishPath}.markupEUR`))
      }

      if (!Array.isArray(dish.items)) {
        issues.push(issue('dish.items.invalid', 'Zutaten müssen als Liste vorliegen', `${dishPath}.items`))
        return
      }

      if (dish.items.length === 0) {
        issues.push(issue('dish.items.empty', 'Gericht enthält keine Zutaten', `${dishPath}.items`, ValidationSeverity.WARNING))
      }

      const articleIds = new Set()

      dish.items.forEach((item, itemIndex) => {
        const itemPath = `${dishPath}.items.${itemIndex}`

        if (!item?.articleId) {
          issues.push(issue('item.article.required', 'Zutat benötigt eine Artikel-ID', `${itemPath}.articleId`))
        } else if (articleIds.has(item.articleId)) {
          issues.push(issue('item.article.duplicate', 'Artikel ist im Gericht doppelt enthalten', `${itemPath}.articleId`, ValidationSeverity.WARNING, { articleId: item.articleId }))
        } else {
          articleIds.add(item.articleId)
        }

        if (!Number.isFinite(Number(item?.grammPerPerson))) {
          issues.push(issue('item.amount.invalid', 'Menge pro Person ist ungültig', `${itemPath}.grammPerPerson`))
        } else if (Number(item.grammPerPerson) <= 0) {
          issues.push(issue('item.amount.nonPositive', 'Menge pro Person muss größer als 0 sein', `${itemPath}.grammPerPerson`))
        }
      })
    })
  })

  return issues
}

export function hasErrors(issues) {
  return issues.some((entry) => entry.severity === ValidationSeverity.ERROR)
}

export function warningsOnly(issues) {
  return issues.filter((entry) => entry.severity === ValidationSeverity.WARNING)
}

export function errorsOnly(issues) {
  return issues.filter((entry) => entry.severity === ValidationSeverity.ERROR)
}

export function groupIssuesByPath(issues) {
  return issues.reduce((groups, entry) => {
    const key = entry.path || 'root'
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(entry)
    return groups
  }, {})
}

export function summarizeValidation(issues) {
  const errors = errorsOnly(issues)
  const warnings = warningsOnly(issues)
  return {
    valid: errors.length === 0,
    errors: errors.length,
    warnings: warnings.length,
    total: issues.length,
  }
}

export function assertValidBuffet(buffet) {
  const issues = validateBuffet(buffet)
  const summary = summarizeValidation(issues)
  if (!summary.valid) {
    const error = new Error(`Buffet ist ungültig: ${summary.errors} Fehler`)
    error.issues = issues
    throw error
  }
  return buffet
}

export function normalizePersons(value, fallback = 1) {
  const number = Number(value)
  if (!Number.isFinite(number)) {
    return fallback
  }
  return Math.max(1, Math.round(number))
}

export function normalizeMarkup(value, fallback = 0) {
  const number = Number(value)
  if (!Number.isFinite(number)) {
    return fallback
  }
  return Math.max(0, number)
}

export function cloneBuffet(buffet) {
  return JSON.parse(JSON.stringify(buffet))
}

export function sanitizeTitle(value, fallback = 'Neues Buffet') {
  const clean = String(value || '').trim().replace(/\s+/g, ' ')
  return clean || fallback
}

export function normalizeBuffet(buffet) {
  const next = cloneBuffet(buffet)
  next.title = sanitizeTitle(next.title)
  next.totalPersons = normalizePersons(next.totalPersons)
  next.globalMarkupPct = normalizeMarkup(next.globalMarkupPct)
  next.tags = Array.isArray(next.tags) ? next.tags.filter(Boolean) : []
  next.courses = Array.isArray(next.courses) ? next.courses : []
  return next
}
