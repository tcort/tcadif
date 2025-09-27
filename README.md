# tcadif

Read and write data in Amateur Data Interchange Format (ADIF) with JavaScript.

## Implementation Notes

- no referential integrity checking have been implemented. That's up to the application developer. Here are some checks that are not implemented to give an idea of the problem space:
 - when both `FREQ` and `BAND` are present, the value of `FREQ` falls within the band value specified in `BAND`.
 - `DCL_QSLRDATE` is only valid if `DCL_QSL_RCVD` has value `Y`, `I`, or `V`.
 - `QSO_DATE`/`TIME_ON` is less than or equal to `QSO_DATE_OFF`/`TIME_OFF`.
 - `COUNTRY` value corresponds to `DXCC` value when both are provided.
 - `STATE` value is valid for `DXCC` when both are provided.
 - etc, etc.
- Secondary Administrative Subdivision is not validated beyond basic string checks. There are over 15,000 possible values. They are not listed in the specification and subject to change over time.
