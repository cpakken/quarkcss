// https://www.npmjs.com/package/react-addons-shallow-compare?activeTab=code

if (typeof window === 'undefined') {
  // Server-side
  module.exports = null
} else {
  // import { useMemo, useRef } from 'react'

  const { useMemo, useRef } = require('react') as typeof import('react')

  const hasOwnProperty = Object.prototype.hasOwnProperty

  /**
   * Performs equality by iterating through keys on an object and returning false
   * when any key has values which are not strictly equal between the arguments.
   * Returns true when the values of all keys are strictly equal.
   */
  const shallowEqual = (objA: any, objB: any) => {
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
  const useCompare = <T>(value: T, comparer: (next: T, prev: T | undefined) => boolean) => {
    const ref = useRef<T | undefined>()
    const prev = useRef<T | undefined>(ref.current)

    if (prev.current === undefined || !comparer(prev.current, value)) {
      ref.current = value
    }

    prev.current = value

    return ref.current as T
  }

  const shallowEqualAll = (deps: any[]): boolean => deps.every(shallowEqual)

  type AnyQuarkCss = import('./styled').AnyQuarkCss

  const createUseQuarkMemo = (quark: AnyQuarkCss): AnyQuarkCss => {
    return ((quarkProps: any, className: string, cn: any) => {
      return useMemo(
        () => quark(quarkProps as any, className, cn),
        useCompare([quarkProps, className, cn], shallowEqualAll)
      )
    }) as any
  }

  module.exports = createUseQuarkMemo
}
