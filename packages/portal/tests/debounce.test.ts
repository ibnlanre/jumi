import { debounceEffect } from "@/utilities";
import { afterAll, expect, test, vi } from "vitest";

afterAll(() => {
  vi.useRealTimers();
});

test("Debounced effect should be called after the specified delay", () => {
  vi.useFakeTimers();

  const effect = vi.fn();
  const debouncedEffect = debounceEffect(effect, { delay: 100 });

  debouncedEffect();

  expect(effect).not.toBeCalled();

  vi.advanceTimersByTime(100);

  expect(effect).toBeCalled();
});

test("Debounced effect should be immediately called if delay is 0", () => {
  vi.useFakeTimers();

  const effect = vi.fn();
  const debouncedEffect = debounceEffect(effect, { delay: 0 });

  debouncedEffect();

  expect(effect).toBeCalled();
});

test("Debounced effect should be called only once if leading is true and trailing is fals", () => {
  vi.useFakeTimers();

  const effect = vi.fn();
  const debouncedEffect = debounceEffect(effect, {
    delay: 100,
    leading: true,
    trailing: false,
  });

  debouncedEffect();
  debouncedEffect();
  debouncedEffect();

  expect(effect).toBeCalledTimes(1);

  vi.advanceTimersByTime(100);

  expect(effect).toBeCalledTimes(1);
});

test("Debounced effect should be called twice if leading is true and trailing is true", () => {
  vi.useFakeTimers();

  const effect = vi.fn();
  const debouncedEffect = debounceEffect(effect, { delay: 100, leading: true });

  debouncedEffect();
  debouncedEffect();
  debouncedEffect();

  expect(effect).toBeCalledTimes(1);

  vi.advanceTimersByTime(100);

  expect(effect).toBeCalledTimes(2);
});

test("Debounced effect should be called on both leading and trailing edge if trailing is true", () => {
  vi.useFakeTimers();

  const effect = vi.fn();
  const debouncedEffect = debounceEffect(effect, {
    delay: 100,
    trailing: true,
  });

  debouncedEffect();
  expect(effect).not.toBeCalled();

  vi.advanceTimersByTime(100);
  expect(effect).toBeCalled();

  debouncedEffect();
  expect(effect).toBeCalledTimes(1);

  vi.advanceTimersByTime(100);
  expect(effect).toBeCalledTimes(2);
});
