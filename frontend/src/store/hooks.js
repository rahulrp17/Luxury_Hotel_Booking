import { useDispatch, useSelector } from "react-redux";

/**
 * Pre-typed Redux hooks. Use these instead of raw useDispatch/useSelector so
 * future migrations to TypeScript stay simple.
 */
export const useAppDispatch = () => useDispatch();

export const useAppSelector = useSelector;
export { useAppSelector as useSelector };