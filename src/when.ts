import { Expectation } from './expectation';
import { SINGLETON_PENDING_EXPECTATION } from './pending-expectation';

interface InvocationCount {
  /**
   * `min` and `max` are inclusive.
   */
  between(min: number, max: number): void;

  /**
   * Shortcut for `between(exact, exact)`.
   */
  times(exact: number): void;

  /**
   * Shortcut for `between(min, Infinity)`.
   */
  atLeast(min: number): void;

  /**
   * Shortcut for `between(0, max)`.
   */
  atMost(max: number): void;

  /**
   * Shortcut for `times(1)`.
   */
  once(): void;

  /**
   * Shortcut for `times(2)`.
   */
  twice(): void;
}

type PromiseStub<R> = {
  returns(returnValue: Promise<R>): InvocationCount;
  resolves(returnValue: R): InvocationCount;

  rejects(error: Error): InvocationCount;
  rejects(message: string): InvocationCount;
  rejects(): InvocationCount;
};

type NonPromiseStub<R> = {
  returns(returnValue: R): InvocationCount;

  throws(error: Error): InvocationCount;
  throws(message: string): InvocationCount;
  throws(): InvocationCount;
};

type Stub<T> = T extends Promise<infer U> ? PromiseStub<U> : NonPromiseStub<T>;

const returnInvocationCount = (expectation: Expectation): InvocationCount => {
  /* eslint-disable no-param-reassign, no-multi-assign */
  return {
    between: (min, max) => {
      expectation.min = min;
      expectation.max = max;
    },
    times: exact => {
      expectation.min = expectation.max = exact;
    },
    atLeast(min: number): void {
      expectation.min = min;
      expectation.max = Infinity;
    },
    atMost(max: number): void {
      expectation.min = 0;
      expectation.max = max;
    },
    once(): void {
      expectation.min = expectation.max = 1;
    },
    twice(): void {
      expectation.min = expectation.max = 2;
    }
  };
  /* eslint-enable no-param-reassign, no-multi-assign */
};

const finishPendingExpectation = (returnValue: any) => {
  const finishedExpectation = SINGLETON_PENDING_EXPECTATION.finish(returnValue);
  SINGLETON_PENDING_EXPECTATION.clear();

  return returnInvocationCount(finishedExpectation);
};

const getError = (errorOrMessage: Error | string | undefined) => {
  if (typeof errorOrMessage === 'string') {
    return new Error(errorOrMessage);
  }

  if (errorOrMessage instanceof Error) {
    return errorOrMessage;
  }

  return new Error();
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
export const when = <R>(expectation: R): Stub<R> => {
  const nonPromiseStub: NonPromiseStub<any> = {
    returns: (returnValue: any): InvocationCount =>
      finishPendingExpectation(returnValue),

    throws: (errorOrMessage?: Error | string): InvocationCount =>
      finishPendingExpectation(getError(errorOrMessage))
  };

  const promiseStub: PromiseStub<any> = {
    returns: (returnValue: Promise<any>): InvocationCount =>
      finishPendingExpectation(returnValue),

    resolves: (returnValue: any): InvocationCount =>
      finishPendingExpectation(Promise.resolve(returnValue)),

    rejects: (errorOrMessage?: Error | string): InvocationCount =>
      finishPendingExpectation(Promise.reject(getError(errorOrMessage)))
  };

  // @ts-ignore
  return { ...nonPromiseStub, ...promiseStub };
};
