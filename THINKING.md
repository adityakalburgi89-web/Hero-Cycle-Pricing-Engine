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

Question 1: Who is using this?The User: A non-technical salesperson at a cycle showroom.  What she needs:An instant, foolproof way to select parts and get a total price while talking to a customer.  A clear breakdown so she can explain to a customer why a specific configuration costs more (e.g., "The aluminum frame adds ₹1,200").  What would frustrate her:Having to type exact text or JSON strings into a black box terminal.  Cryptic error messages if a part combination doesn't match.Slow loading times or having to look up historical parts price lists manually. 