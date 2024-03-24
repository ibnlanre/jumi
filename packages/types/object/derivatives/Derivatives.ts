type Functions =
  | Function
  | FunctionConstructor
  | Generator
  | GeneratorFunction
  | GeneratorFunctionConstructor
  | AsyncGenerator
  | AsyncGeneratorFunction
  | AsyncGeneratorFunctionConstructor
  | Promise<any>
  | PromiseConstructor;

type Errors =
  | Error
  | ErrorConstructor
  | EvalError
  | RangeError
  | ReferenceError
  | SyntaxError
  | TypeError
  | URIError;

type TypedArrays =
  | ArrayBuffer
  | DataView
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

type Buffers =
  | Buffer
  | BufferConstructor
  | SharedArrayBuffer
  | SharedArrayBufferConstructor
  | Atomics;

type Events =
  | Event
  | ErrorEvent
  | DOMException
  | CustomEvent
  | EventTarget
  | EventListener
  | EventListenerObject
  | EventListenerOrEventListenerObject
  | EventListenerOptions;

export type Derivatives = RegExp | Date | JSON;
