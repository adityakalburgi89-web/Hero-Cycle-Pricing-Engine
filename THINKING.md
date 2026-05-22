# Thinking Log

## Architecture
- Simple Express API with MongoDB via Mongoose
- PricingService handles business logic, separate from routes
- Part model stores base prices
- PricingHistory model stores time-sensitive price changes

## Pricing Logic
- Default price = part.basePrice
- If PricingHistory exists with date <= query date, use that price
- Supports arbitrary historical queries

## Future Ideas
- Region and material multipliers
- Discount rules engine
- Admin dashboard for managing parts and history
- Real-time price change WebSocket
