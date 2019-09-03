export const simpleMock = <T>(values?: { [key: string]: any }): T => {
  const cls = jest.fn();
  const obj = new cls();

  if (values === undefined) return obj;

  for (const [key, value] of Object.entries(values)) {
    obj[key] = value;
  }
  return obj;
};
