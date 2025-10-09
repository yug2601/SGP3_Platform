import { useCallback, useMemo, DependencyList } from 'react';

export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  dependencies: DependencyList
): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, dependencies);
};

export const useOptimizedValue = <T>(value: T, dependencies: DependencyList): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => value, dependencies);
};