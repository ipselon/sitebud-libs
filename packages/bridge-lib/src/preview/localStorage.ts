let localStorage: Record<string, any> = {};

export function getChanges(key: string) {
  return localStorage[key];
}
export function setChanges(key: string, val: any) {
  localStorage[key] = val;
}
export function setChangesBulk(data: any) {
  Object.keys(data).forEach((keyItem: string) => {
    localStorage[keyItem] = data[keyItem];
  });
}
export function delChanges(key: string) {
  delete localStorage[key];
}
export function clearChanges() {
  localStorage = {};
}
export function keysChanges() {
  return Object.keys(localStorage);
}
export function countChanges() {
  return keysChanges().length;
}
