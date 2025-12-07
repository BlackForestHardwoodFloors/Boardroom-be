import {
  Between,
  FindOperator,
  LessThanOrEqual,
  MoreThanOrEqual,
  Raw,
} from "typeorm";

/**
 * Filter by upper and lower bounds. If one of the bounds is missing, it only
 * uses the other. If both are missing, it ignores the filter.
 */
export function BetweenOptional<T>(
  lowerBound: T | undefined,
  upperBound: T | undefined,
): FindOperator<T> | undefined {
  if (lowerBound !== undefined && upperBound !== undefined) {
    return Between(lowerBound, upperBound);
  } else if (lowerBound !== undefined) {
    return MoreThanOrEqual(lowerBound);
  } else if (upperBound !== undefined) {
    return LessThanOrEqual(upperBound);
  } else {
    return Raw(() => "TRUE");
  }
}
