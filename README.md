
# Stephanie's 2D Christmas Workshop

A premium 2D cartoon interactive greeting card featuring Santa's workshop and a gift gacha machine.

## How to Run Locally
Since this project uses PixiJS and React via ES modules, it requires a local server.
1. Use VS Code's **Live Server** extension.
2. OR run: `npx serve .`
3. Open `index.html` in your browser.

## Deployment to GitHub Pages
1. Push this code to a new GitHub repository.
2. Navigate to **Settings > Pages**.
3. Under **Build and deployment**, select `main` branch and `/ (root)` folder.
4. Hit **Save**.

## How it works
- **PixiJS**: Handles the high-performance 2D rendering of the workshop scene using vector graphics (Graphics API).
- **GSAP**: Manages the smooth cinematic pan and UI animations.
- **React**: Handles the interactive UI overlays, dialogue, and application state.
- **Web Audio API**: Generates procedural chime and spin sounds without needing large external assets.
- **Uniform Gacha**: Uses standard array indexing for perfectly balanced 1/7 probability.
