'use strict';

import Segment from './Segment.mjs';
import EndOfRecordTag from '../tags/EndOfRecordTag.mjs';

import AddressField from '../fields/AddressField.mjs';
import AgeField from '../fields/AgeField.mjs';
import AltitudeField from '../fields/AltitudeField.mjs';
import AntAzField from '../fields/AntAzField.mjs';
import AntElField from '../fields/AntElField.mjs';
import AntPathField from '../fields/AntPathField.mjs';
import ArrlSectField from '../fields/ArrlSectField.mjs';
import AwardSubmittedField from '../fields/AwardSubmittedField.mjs';
import AwardGrantedField from '../fields/AwardGrantedField.mjs';
import AIndexField from '../fields/AIndexField.mjs';
import BandField from '../fields/BandField.mjs';
import BandRxField from '../fields/BandRxField.mjs';
import CallField from '../fields/CallField.mjs';
import CheckField from '../fields/CheckField.mjs';
import ClassField from '../fields/ClassField.mjs';
import ClublogQsoUploadDateField from '../fields/ClublogQsoUploadDateField.mjs';
import ForceInitField from '../fields/ForceInitField.mjs';
import ItuzField from '../fields/ItuzField.mjs';
import KIndexField from '../fields/KIndexField.mjs';
import ModeField from '../fields/ModeField.mjs';
import QsoDateField from '../fields/QsoDateField.mjs';
import QsoDateOffField from '../fields/QsoDateOffField.mjs';
import QsoRandomField from '../fields/QsoRandomField.mjs';
import SilentKeyField from '../fields/SilentKeyField.mjs';
import SwlField from '../fields/SwlField.mjs';
import TimeOffField from '../fields/TimeOffField.mjs';
import TimeOnField from '../fields/TimeOnField.mjs';

class RecordSegment extends Segment {

    constructor(obj = {}) {
        super([
            AddressField,
            AgeField,
            AltitudeField,
            AntAzField,
            AntElField,
            AntPathField,
            ArrlSectField,
            AwardSubmittedField,
            AwardGrantedField,
            AIndexField,
            BandField,
            BandRxField,
            CallField,
            CheckField,
            ClassField,
            ClublogQsoUploadDateField,
            ForceInitField,
            ItuzField,
            KIndexField,
            ModeField,
            QsoDateField,
            QsoDateOffField,
            QsoRandomField,
            SilentKeyField,
            SwlField,
            TimeOffField,
            TimeOnField,
        ], EndOfRecordTag, obj);
    }
}

export default RecordSegment;
