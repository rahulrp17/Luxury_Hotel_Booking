import { useState, useCallback } from "react";
import { storage } from "@/utils/storage";

/**
 * React state backed by localStorage. Reads initial value lazily, writes on
 * change, and stays in sync across this component's lifetime.
 */
const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    const stored = storage.get(key);
    return stored !== null ? stored : initialValue;
  });

  const set = useCallback(
    (next) => {
      const resolved = typeof next === "function" ? next(value) : next;
      setValue(resolved);
      storage.set(key, resolved);
    },
    [key, value]
  );

  const remove = useCallback(() => {
    setValue(initialValue);
    storage.remove(key);
  }, [key, initialValue]);

  return [value, set, remove];
};

export default useLocalStorage;
