import { ARTICLES } from '../data/dummyData.js'
import { dishPersons, neededAmount, orderedAmount } from '../utils/calc.js'

const round = (value, digits = 3) => {
  const factor = 10 ** digits
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor
}

export function collectIngredientDemand(buffet) {
  const demand = new Map()

  for (const course of buffet?.courses || []) {
    for (const dish of course.dishes || []) {
      const persons = dishPersons(dish, buffet.totalPersons)
      for (const item of dish.items || []) {
        const article = ARTICLES[item.articleId]
        if (!article) {
          continue
        }

        const needed = neededAmount(item, persons)
        const existing = demand.get(item.articleId) || {
          articleId: item.articleId,
          name: article.name,
          unit: article.unit,
          packageSize: article.gebinde,
          purchasePrice: article.purchasePrice,
          needed: 0,
          sources: [],
        }

        existing.needed += needed
        existing.sources.push({
          courseId: course.id,
          courseName: course.name,
          dishId: dish.id,
          dishName: dish.name,
          persons,
          amountPerPerson: item.grammPerPerson,
          needed,
        })

        demand.set(item.articleId, existing)
      }
    }
  }

  return [...demand.values()].map((entry) => ({
    ...entry,
    needed: round(entry.needed),
  }))
}

export function applyStock(demand, stockMap = {}) {
  return demand.map((entry) => {
    const stock = Math.max(0, Number(stockMap[entry.articleId]) || 0)
    const fromStock = Math.min(stock, entry.needed)
    const remaining = Math.max(0, entry.needed - fromStock)
    return {
      ...entry,
      stock,
      fromStock: round(fromStock),
      remaining: round(remaining),
    }
  })
}

export function calculatePackages(demandWithStock) {
  return demandWithStock.map((entry) => {
    const packageSize = Math.max(0.000001, Number(entry.packageSize) || 1)
    const packages = entry.remaining <= 0 ? 0 : Math.ceil(entry.remaining / packageSize)
    const ordered = packages * packageSize
    const overhang = Math.max(0, ordered - entry.remaining)
    const pricePerPackage = packageSize * Number(entry.purchasePrice || 0)
    const cost = packages * pricePerPackage

    return {
      ...entry,
      packages,
      ordered: round(ordered),
      overhang: round(overhang),
      pricePerPackage: round(pricePerPackage, 2),
      cost: round(cost, 2),
    }
  })
}

export function buildProcurementPlan(buffet, stockMap = {}) {
  const demand = collectIngredientDemand(buffet)
  const stocked = applyStock(demand, stockMap)
  const lines = calculatePackages(stocked)

  return {
    buffetId: buffet?.id || null,
    buffetTitle: buffet?.title || '',
    persons: buffet?.totalPersons || 0,
    generatedAt: new Date().toISOString(),
    lines,
    totals: procurementTotals(lines),
  }
}

export function procurementTotals(lines) {
  return lines.reduce(
    (totals, line) => {
      totals.articles += 1
      totals.packages += line.packages
      totals.cost += line.cost
      totals.overhang += line.overhang
      totals.fromStock += line.fromStock
      return totals
    },
    {
      articles: 0,
      packages: 0,
      cost: 0,
      overhang: 0,
      fromStock: 0,
    },
  )
}

export function orderableLines(plan) {
  return (plan?.lines || []).filter((line) => line.packages > 0)
}

export function fullyCoveredByStock(plan) {
  return (plan?.lines || []).filter((line) => line.remaining <= 0)
}

export function linesWithOverhang(plan) {
  return (plan?.lines || []).filter((line) => line.overhang > 0)
}

export function sortProcurementLines(lines, mode = 'name') {
  const result = [...lines]
  if (mode === 'cost-desc') {
    return result.sort((a, b) => b.cost - a.cost)
  }
  if (mode === 'overhang-desc') {
    return result.sort((a, b) => b.overhang - a.overhang)
  }
  if (mode === 'packages-desc') {
    return result.sort((a, b) => b.packages - a.packages)
  }
  return result.sort((a, b) => a.name.localeCompare(b.name, 'de'))
}

export function groupBySupplier(lines, supplierMap = {}) {
  return lines.reduce((groups, line) => {
    const supplier = supplierMap[line.articleId] || 'Nicht zugeordnet'
    if (!groups[supplier]) {
      groups[supplier] = []
    }
    groups[supplier].push(line)
    return groups
  }, {})
}

export function createSupplierOrders(plan, supplierMap = {}) {
  const grouped = groupBySupplier(orderableLines(plan), supplierMap)

  return Object.entries(grouped).map(([supplier, lines]) => ({
    id: `supplier_order_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    supplier,
    status: 'draft',
    buffetId: plan.buffetId,
    buffetTitle: plan.buffetTitle,
    createdAt: new Date().toISOString(),
    lines: lines.map((line) => ({
      articleId: line.articleId,
      name: line.name,
      unit: line.unit,
      packageSize: line.packageSize,
      packages: line.packages,
      ordered: line.ordered,
      unitCost: line.pricePerPackage,
      totalCost: line.cost,
    })),
    totalCost: round(lines.reduce((sum, line) => sum + line.cost, 0), 2),
  }))
}

export function procurementWarnings(plan) {
  const warnings = []

  for (const line of plan?.lines || []) {
    if (line.overhang > line.remaining && line.remaining > 0) {
      warnings.push({
        code: 'high-overhang',
        articleId: line.articleId,
        message: `${line.name}: Überhang ist größer als der tatsächliche Restbedarf`,
      })
    }

    if (line.packages >= 10) {
      warnings.push({
        code: 'large-order',
        articleId: line.articleId,
        message: `${line.name}: große Bestellmenge (${line.packages} Gebinde)`,
      })
    }

    if (!Number.isFinite(line.cost) || line.cost < 0) {
      warnings.push({
        code: 'invalid-cost',
        articleId: line.articleId,
        message: `${line.name}: Einkaufspreis ist ungültig`,
      })
    }
  }

  return warnings
}

export function exportProcurementCsv(plan) {
  const header = [
    'Artikel',
    'Einheit',
    'Bedarf',
    'Lager',
    'Restbedarf',
    'Gebinde',
    'Anzahl Gebinde',
    'Bestellmenge',
    'Überhang',
    'Kosten',
  ]

  const rows = (plan?.lines || []).map((line) => [
    line.name,
    line.unit,
    line.needed,
    line.stock,
    line.remaining,
    line.packageSize,
    line.packages,
    line.ordered,
    line.overhang,
    line.cost.toFixed(2),
  ])

  return [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(';'))
    .join('\n')
}
