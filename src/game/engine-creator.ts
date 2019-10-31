import * as ex from "excalibur";

/**
 * Create `ex.Engine` with canvas.
 *
 * @param canvas Canvas used with game
 */
export function createEngine(canvas: HTMLCanvasElement): ex.Engine {
  // Override document.getElementById
  // because ex.Engine use it but vue override it
  const originalGetElementById = document.getElementById;
  document.getElementById = (): HTMLElement => canvas;

  const game = new ex.Engine({
    width: canvas.width,
    height: canvas.height,
    canvasElementId: "__anyId",
    pointerScope: ex.Input.PointerScope.Document,
    backgroundColor: ex.Color.DarkGray,
    suppressMinimumBrowserFeatureDetection: true,
    suppressConsoleBootMessage: true
  });

  document.getElementById = originalGetElementById;

  return game;
}
