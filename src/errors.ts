// TODO: improve all error messages
import { RECEIVED_COLOR } from 'jest-matcher-utils';
import { Expectation } from './expectation';
import { PendingExpectation } from './pending-expectation';
import { printCall, printProperty } from './print';

export class UnfinishedExpectation extends Error {
  constructor(pendingExpectation: PendingExpectation) {
    super(`There is an unfinished pending expectation:

${pendingExpectation.toString()}

Please finish it by chaining the expectation with a returns call.`);
  }
}

export class MissingWhen extends Error {
  constructor() {
    super(`You didn't set an expectation first`);
  }
}

export class UnexpectedAccess extends Error {
  constructor(property: PropertyKey, expectations: Expectation[]) {
    super(`Didn't expect mock${RECEIVED_COLOR(
      printProperty(property)
    )} to be accessed.

Remaining expectations:
 - ${expectations.map(e => e.toString()).join('\n - ')}`);
  }
}

export class UnexpectedCall extends Error {
  constructor(property: PropertyKey, args: any[], expectations: Expectation[]) {
    super(`Didn't expect mock${printCall(property, args)} to be called.

Remaining expectations:
 - ${expectations.map(e => e.toString()).join('\n - ')}`);
  }
}

export class NotAMock extends Error {
  constructor() {
    super(`This is not a mock`);
  }
}

export class UnmetExpectations extends Error {
  constructor(expectations: Expectation[]) {
    super(`There are unmet expectations:

 - ${expectations.map(e => e.toString()).join('\n - ')}`);
  }
}
