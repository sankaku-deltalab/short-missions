import { EventDispatcher } from "@/game/common/event-dispatcher";

describe("EventDispatcher", (): void => {
  it("can add event", (): void => {
    // Given EventDispatcher
    const eventDispatcher = new EventDispatcher<void>();

    // When add event
    const event = jest.fn();
    eventDispatcher.add(event);

    // Then EventDispatcher has event
    expect(eventDispatcher.has(event)).toBe(true);
  });

  it("can remove event", (): void => {
    // Given EventDispatcher
    const eventDispatcher = new EventDispatcher<() => void>();

    // When add event
    const event = jest.fn();
    const removeEvent = eventDispatcher.add(event);

    // And remove event
    removeEvent();

    // Then EventDispatcher doesn't have event
    expect(eventDispatcher.has(event)).toBe(false);
  });

  it("can clear events", (): void => {
    // Given EventDispatcher
    const eventDispatcher = new EventDispatcher<() => void>();

    // When add 2 event
    const event1 = jest.fn();
    const event2 = jest.fn();
    eventDispatcher.add(event1);
    eventDispatcher.add(event2);

    // And clear events
    eventDispatcher.clear();

    // Then EventDispatcher doesn't have all events
    expect(eventDispatcher.has(event1)).toBe(false);
    expect(eventDispatcher.has(event2)).toBe(false);
  });

  it("can dispatch events", (): void => {
    // Given EventDispatcher
    const eventDispatcher = new EventDispatcher<number>();

    // When add 2 event
    const event1 = jest.fn();
    const event2 = jest.fn();
    eventDispatcher.add(event1);
    eventDispatcher.add(event2);

    // And dispatch events
    const value = 91;
    eventDispatcher.dispatch(value);

    // Then EventDispatcher doesn't have all events
    expect(event1).toBeCalledWith(value);
    expect(event2).toBeCalledWith(value);
  });
});
