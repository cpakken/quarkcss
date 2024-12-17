// https://www.npmjs.com/package/react-addons-shallow-compare?activeTab=code

import type { AnyQuarkCss } from '@quarkcss/core'
import React from 'react'

const hasOwnProperty = Object.prototype.hasOwnProperty

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
export const shallowEqual = (objA: any, objB: any) => {
  if (Object.is(objA, objB)) {
    return true
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false
  }

  var keysA = Object.keys(objA)
  var keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  // Test for A's keys different from B.
  for (var i = 0; i < keysA.length; i++) {
    if (!hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]])) {
      return false
    }
  }

  return true
}

//https://github.com/kotarella1110/use-custom-compare/blob/master/src/useCustomCompareMemo.ts
export const useCompare = <T>(value: T, comparer: (next: T, prev: T | undefined) => boolean) => {
  const ref = React.useRef<T | undefined>(undefined)
  const prev = React.useRef<T | undefined>(ref.current)

  if (prev.current === undefined || !comparer(prev.current, value)) {
    ref.current = value
  }

  prev.current = value

  return ref.current as T
}

export const shallowEqualAll = (deps: any[]): boolean => deps.every(shallowEqual)

export const createUseQuarkMemo = (quark: AnyQuarkCss): AnyQuarkCss => {
  return ((quarkProps: any, className: string, ...rest: any[]) => {
    return React.useMemo(
      () => quark(quarkProps as any, className, ...rest),
      useCompare([quarkProps, className, ...rest], shallowEqualAll)
    )
  }) as any
}
