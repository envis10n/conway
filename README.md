# conway

A Conway's Game of Life simulation for the browser.

## Building

### Requirements

- yarn (modern, non 1.x)
- node (latest stable)
- corepack

### Build

- Clone the repo.
- In the terminal, install the dev dependencies with `yarn`.
- Build a debug bundle with `yarn build:debug`
- Build a release minified bundle with `yarn build:release`
- Once bundled, open `index.html` in a browser.

## Settings

In the browser, there are a few settings that can be changed.

- Canvas Width
  * Changes the canvas render width in pixels.
- Canvas Height
  * Changes the canvas render height in pixels.
- Tile Size
  * Changes the tile size in pixels. Determines the size of the underlying `GridMap`.
- Frame rate
  * Changes the timeout period before requesting an animation frame for rendering. Value is in hertz.

Pressing the `Update Settings` button will create a fresh canvas with the new settings.

Pressing enter after changing the frame rate text will adjust the frame rate immediately.

Pressing the `Simulate` button will start the simulation. `Pause` will pause the simulation without resetting.
