# Merge notes

## Preserved from buffet2
- Complete dashboard and template cards
- Buffet editor
- Full position editor
- Portion overrides
- Ingredient add/remove/replace flow
- Package-size rounding
- Purchase requirement vs ordered quantity calculation
- Overhang calculation
- Global and position pricing logic
- Aggregated shopping cart
- Stock deduction and notes
- Delivery-date availability handling
- Guest price-hiding concept

## Ported from the second prototype
- Express API layer
- Order persistence endpoint
- OpenFoodFacts search
- Barcode lookup
- REWE adapter
- EDEKA adapter
- External product normalization

## Added during merge
- Explicit employee / guest permission helpers
- External product search UI component
- API client abstraction
- Separate frontend/API dev scripts
- Fixed malformed dashboard CSS class from the original source

## Production follow-up
The bundled JSON persistence and demo login are development scaffolding. Before production, move authentication, roles, templates, orders and products to PostgreSQL and enforce authorization server-side.
