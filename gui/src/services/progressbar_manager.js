let _total;
let _current;

export function resetProgressbar() {
  _total = undefined;
  _current = 0;
}
export function updateProgressbar(current, total = undefined) {
  if (total !== undefined) _total = total;
  if (current === undefined) _current = _total;
  else _current += current;
}
export function GetProgressbarValue() {
  if (_total === undefined) return undefined;
  const val = Math.round((_current * 100) / _total);
  return val;
}
