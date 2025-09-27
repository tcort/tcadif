# tcadif

Read and write data in Amateur Data Interchange Format (ADIF) with JavaScript.

## Implementation Notes

- Application-Defined Fields and User-Defined Fields are ignored.
- Enumerations included by reference with thousands of possible values that are subject to change over time are not verified. For example, Secondary Administrative Subdivision is not validated beyond basic string checks.
- no referential integrity checking have been implemented. That's up to the application developer. Here are some checks that are not implemented to give an idea of the problem space:
 - when both `FREQ` and `BAND` are present, the value of `FREQ` falls within the band value specified in `BAND`.
 - `DCL_QSLRDATE` is only valid if `DCL_QSL_RCVD` has value `Y`, `I`, or `V`.
 - `QSO_DATE`/`TIME_ON` is less than or equal to `QSO_DATE_OFF`/`TIME_OFF`.
 - `COUNTRY` value corresponds to `DXCC` value when both are provided.
 - `STATE` value is valid for `DXCC` when both are provided.
 - etc, etc.
- no automatic conversions for deprecated fields.
 - `GUEST_OP` value isn't moved to `OPERATOR`
 - `VE_PROV` value isn't moved to `STATE`
- no automatic filling in of fields. For example:
 - `PFX` isn't populated automatically from the value of `CALL`
 - `BAND` isn't populated automatically based on the value of `FREQ`
 - `COUNTRY` isn't populated automatically based on the value of `DXCC`
 - etc, etc.
- no automatic defaulting is performed. For example:
 - the absence of `EQSL_QSL_SENT` does not automatically set `EQSL_QSL_SENT` to `N`.
 - etc, etc.
