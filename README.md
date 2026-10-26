# zahir1509.github.io

Personal site of Zahir Ali: data analyst, forecasting and statistical modelling, co-founder of [Anyone Can Quiz](https://www.instagram.com/anyonecanquiz/). Live at https://zahir1509.github.io.

Plain HTML, CSS and a little JavaScript. No build step.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
```

## Layout

| Path | What it is |
|---|---|
| `index.html` | The whole page |
| `css/style.css` | Theme, dark/light variables and all custom styles |
| `js/site.js` | Theme toggle, nav, terminal typing, stats counters, scroll progress, contact form |
| `js/main.js` | Scroll-in animations and back-to-top |
| `images/` | Profile photo, favicon, social share image, loader |

## Notes

- The contact form posts to [Web3Forms](https://web3forms.com).
- Dark mode is the default; the choice is saved in `localStorage`.

## License

MIT, see `LICENSE`.
