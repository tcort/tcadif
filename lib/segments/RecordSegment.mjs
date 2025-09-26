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
import ClublogQsoUploadStatusField from '../fields/ClublogQsoUploadStatusField.mjs';
import CntyField from '../fields/CntyField.mjs';
import CntyAltField from '../fields/CntyAltField.mjs';
import CommentField from '../fields/CommentField.mjs';
import ContField from '../fields/ContField.mjs';
import ContactedOpField from '../fields/ContactedOpField.mjs';
import ContestIdField from '../fields/ContestIdField.mjs';
import CountryField from '../fields/CountryField.mjs';
import CqzField from '../fields/CqzField.mjs';
import EmailField from '../fields/EmailField.mjs';
import ForceInitField from '../fields/ForceInitField.mjs';
import ItuzField from '../fields/ItuzField.mjs';
import KIndexField from '../fields/KIndexField.mjs';
import ModeField from '../fields/ModeField.mjs';
import NameField from '../fields/NameField.mjs';
import QsoDateField from '../fields/QsoDateField.mjs';
import QsoDateOffField from '../fields/QsoDateOffField.mjs';
import QsoRandomField from '../fields/QsoRandomField.mjs';
import SigField from '../fields/SigField.mjs';
import SigInfoField from '../fields/SigInfoField.mjs';
import SilentKeyField from '../fields/SilentKeyField.mjs';
import SkccField from '../fields/SkccField.mjs';
import SwlField from '../fields/SwlField.mjs';
import TimeOffField from '../fields/TimeOffField.mjs';
import TimeOnField from '../fields/TimeOnField.mjs';
import WebField from '../fields/WebField.mjs';

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
            ClublogQsoUploadStatusField,
            CntyField,
            CntyAltField,
            CommentField,
            ContField,
            ContactedOpField,
            ContestIdField,
            CountryField,
            CqzField,
            EmailField,
            ForceInitField,
            ItuzField,
            KIndexField,
            ModeField,
            NameField,
            QsoDateField,
            QsoDateOffField,
            QsoRandomField,
            SigField,
            SigInfoField,
            SilentKeyField,
            SkccField,
            SwlField,
            TimeOffField,
            TimeOnField,
            WebField,
        ], EndOfRecordTag, obj);
    }
}

export default RecordSegment;
