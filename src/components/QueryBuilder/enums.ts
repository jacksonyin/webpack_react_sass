export enum AggregationMethod {
  Sum = 'sum',
  Average = 'avg',
  Max = 'max',
  Min = 'min',
  Count = 'cnt',
  DistinctCount = 'dst',
  None = 'none',
  First = 'fst', // first
  List = 'list', // not supported yet!
  // Ssq = 'ssq',
  // Stdev = 'stdev',
  // Var = 'var',
}
export enum AggregationValueCalculationType {
  Running = 'running',
  Moving = 'moving',
  Date = 'date',
  Group = 'group',
}
export enum FilterRule {
  GENERAL = 'general',
  VALUE_RANGE = 'value_range',
  WILDCARD = 'wildcard',
  DATE_RANGE = 'date_range',
  RELATIVE_DATE = 'relative_date',
  SLICER_RELATIVE_DATE = 'slicer_relative_date',
}
export enum FilterType {
  EXACT = 10,
  RANGE = 20,
  GREATER = 21,
  LESS = 22,
  STARTWITH = 30,
  ENDWITH = 31,
  CONTAIN = 32,
  MATCHWORD = 33,
}

export enum RulesType {
  Equal = 0,
  NotEqual = 1,
  Greater = 2,
  EqualOrGreater = 3,
  Less = 4,
  EqualOrLess = 5,
  Between = 6,
  NotBetween = 7,

  StartWith = 8,
  EndWith = 9,
  Contain = 10,
  MatchWord = 11,

  AboveAverage = 12,
  BelowAverage = 13,
  AboveMax = 14,
  BelowMin = 15,

  DoesNotContain = 16,
  Today = 17,
  Yesterday = 18,
  Tomorrow = 19,
  Last7Days = 20,
  ThisMonth = 21,
  LastMonth = 22,
  NextMonth = 23,
  ThisWeek = 24,
  LastWeek = 25,
  NextWeek = 26,
  StrEqual = 27,
  StrNotEqual = 28,
}
export enum SortOrder {
  None = 0,
  Ascending = 1,
  Descending = 2,
  Manual = 3,
}