export default function invariant (condition, format, a, b, c, d, e, f) {
  if (!condition) {
    let args = [a, b, c, d, e, f]
    let argIndex = 0
    let error = new Error(
      'Invariant Violation: ' +
      format.replace(/%s/g, () => args[argIndex++])
    )
    error.framesToPop = 1 // we don't care about invariant's own frame
    throw error
  }
}
