// Support for-await-of syntax
if (!Symbol.asyncIterator) {
    (Symbol as any).asyncIterator = Symbol.for('Symbol.asyncIterator');
}
