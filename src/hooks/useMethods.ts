import type { Reducer } from 'react'
import { useMemo, useReducer } from 'react'

type Action = {
  type: string;
  payload: unknown[];
};

type MethodsRecord<T> = Record<string, (...args: never[]) => T>;

type CreateMethods<T> = (state: T) => MethodsRecord<T>;

type WrappedMethods<T, M extends CreateMethods<T>> = {
  [K in keyof ReturnType<M>]: ReturnType<M>[K] extends (...args: infer Args) => T
  ? (...args: Args) => void
  : never;
};

export const useMethods = <T, M extends CreateMethods<T>>(
  createMethods: M,
  initialState: T
): [T, WrappedMethods<T, M>] => {
  const reducer = useMemo<Reducer<T, Action>>(
    () => (reducerState: T, action: Action) => {
      return (createMethods(reducerState) as MethodsRecord<T>)[action.type](...(action.payload as never[]))
    },
    [createMethods]
  )

  const [state, dispatch] = useReducer(reducer, initialState)

  const wrappedMethods = useMemo(() => {
    const actionTypes = Object.keys(createMethods(initialState))
    return actionTypes.reduce((acc, type) => {
      acc[type] = (...payload: unknown[]) => dispatch({ type, payload })
      return acc
    }, {} as Record<string, (...args: unknown[]) => void>)
  }, [createMethods, initialState])

  return [state, wrappedMethods as WrappedMethods<T, M>]
}
