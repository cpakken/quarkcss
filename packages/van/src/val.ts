import van from 'vanjs-core'
import type { State } from 'vanjs-core'

export const stateProto = Object.getPrototypeOf(van.state())

export const val = <T>(v: T | State<T> | (() => T)): T => {
  const protoOfV = Object.getPrototypeOf(v ?? 0)
  if (protoOfV === stateProto) return (v as State<T>).val
  if (protoOfV === Function.prototype) return (v as () => T)()
  return v as T
}
