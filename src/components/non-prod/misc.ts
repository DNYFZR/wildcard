
function processArray(arr: string[], cardToValue: (card: string) => number) {
  const originalMap = new Map<number, string>();
  const parsedMap = new Map<number, number>();
  
  arr.forEach((value, index) => {
      originalMap.set(index, value);
      parsedMap.set(index, cardToValue(value));
  });

  // const sortedMap = new Map([...parsedMap.entries()].sort((a, b) => a[1] - b[1]));
  return { originalMap, parsedMap };
};

function sortMapValues(map: Map<number,number>) {
  return new Map([...map.entries()].sort((a, b) => a[1] as number - b[1] as number));
};

// Tmp empty export...
export {};