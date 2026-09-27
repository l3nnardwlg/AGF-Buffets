export const ROLES = Object.freeze({ EMPLOYEE: 'chef', GUEST: 'guest' })

export function isEmployee(user) {
  return user?.loggedIn === true && user?.role === ROLES.EMPLOYEE
}

export function isGuest(user) {
  return user?.loggedIn === true && user?.role === ROLES.GUEST
}

export function canSeePurchasePrices(user, hidePurchasePrices = false) {
  return isEmployee(user) && !hidePurchasePrices
}

export function canManageTemplates(user) {
  return isEmployee(user)
}

export function canEditBuffet(user) {
  return isEmployee(user)
}

export function canPlaceSupplierOrder(user) {
  return isEmployee(user)
}

export function sanitizeBuffetForGuest(buffet) {
  if (!buffet) return buffet
  const safe = JSON.parse(JSON.stringify(buffet))
  for (const course of safe.courses || []) {
    for (const dish of course.dishes || []) {
      delete dish.markupPct
      delete dish.markupEUR
      for (const item of dish.items || []) {
        delete item.purchasePricePerUnit
        delete item.purchasePrice
        delete item.supplierPrice
        delete item.cost
      }
    }
  }
  delete safe.globalMarkupPct
  return safe
}

export function canManageOrders(user) {
  return isEmployee(user)
}

export function canEditRecipes(user) {
  return isEmployee(user)
}
