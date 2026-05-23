# Hero Cycle Pricing Engine

A beginner-friendly full-stack pricing engine for bicycle parts with time-sensitive pricing.

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** HTML, CSS, Vanilla JavaScript

## Features

- Select cycle parts and calculate total price
- Time-sensitive pricing — set a date to see historical prices
- Price breakdown by component
- Pricing history per part

## Quickstart

```bash
# Install dependencies
npm install

# Start MongoDB (must be running locally)
# Then seed the database
npm run seed

# Start the server
npm run dev
```

Open `frontend/index.html` in a browser.

## Command-Line Pricing Engine 🚴

We have built a premium, standalone command-line pricing engine under the `cli/` directory. It operates independently of the MongoDB server (falling back to a static JSON catalog) so it can be run instantly in any terminal!

### 2-Minute Quickstart

You can execute the CLI tool using either a JSON configuration file or direct command-line arguments.

#### Option A: Run with a JSON configuration file
```bash
node cli/index.js cli/example_input.json
```

#### Option B: Run with command-line arguments
```bash
node cli/index.js --date 2016-12-15 --parts steel_frame,standard_handlebar,v_brakes,basic_saddle,tubeless_tyre,standard_rim,tube,spokes,4_gear_assembly
```

### Expected Output Format
```text
Cycle Price Breakdown — 15 Dec 2016
------------------------------------
Frame              : ₹1,200
Handle Bar/Brakes  : ₹850
Seating            : ₹400
Wheels             : ₹1,580 ← tubeless tyre priced at Dec 2016 rate
Chain Assembly     : ₹950
------------------------------------
TOTAL              : ₹4,980
```

---

## Run Unit Tests

To run all backend and CLI pricing engine unit tests:
```bash
npm test
```

