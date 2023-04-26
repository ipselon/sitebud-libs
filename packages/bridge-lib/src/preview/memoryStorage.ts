let memoryStorage: Record<string, any> = {};

export function getChanges(key: string) {
  return memoryStorage[key];
}
export function setChanges(key: string, val: any) {
  memoryStorage[key] = val;
}
export function setChangesBulk(data: any) {
  Object.keys(data).forEach((keyItem: string) => {
    memoryStorage[keyItem] = data[keyItem];
  });
}
export function delChanges(key: string) {
  delete memoryStorage[key];
}
export function clearChanges() {
  memoryStorage = {};
}
export function keysChanges() {
  return Object.keys(memoryStorage);
}
export function countChanges() {
  return keysChanges().length;
}
