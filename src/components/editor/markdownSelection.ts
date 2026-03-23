/** Helpers to edit textarea value at selection (markdown-style). */

export type EditResult = {
  nextValue: string;
  selectionStart: number;
  selectionEnd: number;
};

export function wrapSelection(
  value: string,
  start: number,
  end: number,
  before: string,
  after: string,
  placeholderWhenEmpty: string,
): EditResult {
  const selected = value.slice(start, end);
  const middle = selected.length > 0 ? selected : placeholderWhenEmpty;
  const nextValue = value.slice(0, start) + before + middle + after + value.slice(end);
  const selStart = start + before.length;
  const selEnd = selStart + middle.length;
  return { nextValue, selectionStart: selStart, selectionEnd: selEnd };
}

export function replaceSelection(
  value: string,
  start: number,
  end: number,
  replacement: string,
): EditResult {
  const nextValue = value.slice(0, start) + replacement + value.slice(end);
  const pos = start + replacement.length;
  return { nextValue, selectionStart: pos, selectionEnd: pos };
}
