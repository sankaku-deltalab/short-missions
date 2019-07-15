export const simpleMock = <T>(): T => {
  const cls = jest.fn();
  return new cls();
};
