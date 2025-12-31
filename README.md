# Celestial Constellation Clock

An abstract, living representation of time as a cosmic web.

## How it Works

- **Hours**: Represented by 12 anchor stars arranged in a circle. The current hour star pulses and glows more brightly than the others.
- **Minutes**: Displayed as a growing web of "filaments" (lines) connecting the stars. 
    - The web grows clockwise in sectors.
    - **Every 5 minutes**, a perimeter line connecting two adjacent stars is completed.
    - By 60 minutes, all 66 possible connections are formed, creating a full constellation.
- **Seconds**: A bright gold "comet" with a stardust trail orbits the constellation once per minute.
- **Atmosphere**: The background hue shifts subtly based on the hour of the day, and all stars drift naturally using cosmic noise.

## Technical Details

Built with [p5.js](https://p5js.org/).

- `sketch.js`: The main logic for the constellation clock.
- `index.html`: The entry point for the browser.
- `p5.js`: The core library.

