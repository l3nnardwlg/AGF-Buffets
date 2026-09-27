# AGF Buffets

Merged buffet planning platform for employees and customers.

## Core workflow
Buffet template → courses → dishes → ingredients → amount per person → guest count → package rounding → overhang → purchase cost → selling price → stock → supplier order.

## Roles
- **Employee / chef:** full buffet and recipe editing, templates, purchase prices, stock and supplier ordering.
- **Guest / customer:** customer-facing buffet view without internal purchase prices or recipe administration.

## Included
- Buffet templates and custom buffets
- Full buffet editor
- Ingredient / position editor
- Per-dish portion overrides
- Package-size and overhang calculations
- Purchase and selling-price calculation
- Aggregated shopping cart
- Stock deductions
- Delivery availability
- Product search + barcode lookup
- OpenFoodFacts, REWE and EDEKA adapters
- Express API and JSON development persistence

## Development
```bash
npm install
npm run dev
npm run api
```

Frontend defaults to http://localhost:5173 and API to http://localhost:4000.

## Production note
Demo authentication and JSON persistence are scaffolding. Production must use server-side sessions/RBAC and a real database. Purchase prices must never be returned by customer-facing API responses.
