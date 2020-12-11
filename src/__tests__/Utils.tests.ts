import {TwoDigits} from "../utils";

test('TwoDigits', () => {
    // Ensure all decimal numbers are truncated to just two digits
    const testValue = 11.2345
    const expectedValue = 11.23
    expect(TwoDigits(testValue)).toBe(expectedValue)
})
