// Global type definitions for Node.js 22 compatibility
declare global {
  // Ensure global types are available
  const Boolean: BooleanConstructor;
  const Number: NumberConstructor;
  const Object: ObjectConstructor;
  const CallableFunction: FunctionConstructor;
  const NewableFunction: FunctionConstructor;

  interface IArguments {
    [index: number]: any;
    length: number;
    callee: Function;
  }
}

export {};

