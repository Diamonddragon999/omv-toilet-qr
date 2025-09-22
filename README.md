# 🚽 OMV Toilet QR Generator

Generate valid-looking QR codes to unlock toilet doors at OMV gas stations. The
app is a simple static site ready to be deployed on GitHub Pages.

## ✨ Features

- 🔒 Generates QR payloads that match the structure found on receipts: `[BON_ID]*[OPERATOR_CODE]*[DATE]*[TIME]*[AMOUNT]`.
- 🕒 Uses your local time with an optional offset to keep the code fresh.
- 🗺️ Includes a curated list of working locations loaded from `locations.json`.
- 📋 One-click copy for the payload and instant QR rendering in the browser.
- 🪪 No build step or dependencies - plain HTML, CSS, and JavaScript.

## 🧩 QR payload format

The code concatenates the key values from a receipt, separated with asterisks:

```
[BON_ID]*[OPERATOR_CODE]*[DATE]*[TIME]*[AMOUNT]
```

Real-world example:

```
45006016*0831499*2025-08-07*13:06:36*197.18
```

| Segment  | Meaning                                           |
| -------- | ------------------------------------------------- |
| 45006016 | Fiscal receipt number (ФИСКАЛЕН БОН 45006016)     |
| 0831499  | Operator or transaction code (C831499 on receipt) |
| 2025-08-07 | Date formatted as `YYYY-MM-DD`                  |
| 13:06:36 | Time formatted as `HH:MM:SS`                      |
| 197.18   | Total amount on the receipt                       |

## 🚀 Getting started

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/omv-toilet-qr.git
   cd omv-toilet-qr
   ```

2. Serve the files locally (optional) using any static file server, for example:

   ```bash
   npx serve
   ```

   Then open [http://localhost:3000](http://localhost:3000).

3. Deploy to GitHub Pages by enabling Pages on your repository settings and
   choosing the `main` branch with the `/ (root)` folder.

## ➕ Add a new location

Extend the list in `locations.json` with a new entry. Each item needs the
visible station name, a Google Maps link for convenience, and the BON/operator
codes captured from the receipt.

```json
[
  {
    "name": "Byala",
    "maps": "https://goo.gl/maps/abc123",
    "bon": "45006017",
    "operator": "0831500"
  }
]
```

Once the file is saved, the UI will automatically include the new location on
load. Contributions via pull requests are welcome.

## ⚠️ Disclaimer

This tool is for educational purposes only. Respect the facilities you visit
and support the station when possible. 💧

## 🧻 License

MIT - Free to use, improve, and share.
