/**
 * Dispatch events.
 *
 * @example
 * > const eventDispatcher = new EventDispatcher<number>();
 * > const event = (v: number) => {
 * >   console.log(v);
 * > };
 * > eventDispatcher.add(event);
 * > eventDispatcher.dispatch(10);  // output 10
 */
export class EventDispatcher<T> {
  private readonly events: Set<(value: T) => void> = new Set();

  /**
   * Add event.
   *
   * @param event
   */
  public add(event: (value: T) => void): void {
    this.events.add(event);
  }

  /**
   * Remove added event.
   *
   * @param event
   */
  public remove(event: (value: T) => void): void {
    this.events.delete(event);
  }

  /**
   * Clear added events.
   */
  public clear(): void {
    this.events.clear();
  }

  /**
   * Return this has specified event.
   *
   * @param event
   */
  public has(event: (value: T) => void): boolean {
    return this.events.has(event);
  }

  /**
   * Dispatch added events.
   *
   * @param value
   */
  public dispatch(value: T): void {
    this.events.forEach((event: (value: T) => void): void => {
      event(value);
    });
  }
}
