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
import CreditSubmittedField from '../fields/CreditSubmittedField.mjs';
import CreditGrantedField from '../fields/CreditGrantedField.mjs';
import CqzField from '../fields/CqzField.mjs';
import DarcDokField from '../fields/DarcDokField.mjs';
import DclQslrdateField from '../fields/DclQslrdateField.mjs';
import DclQslsdateField from '../fields/DclQslsdateField.mjs';
import DclQslRcvdField from '../fields/DclQslRcvdField.mjs';
import DclQslSentField from '../fields/DclQslSentField.mjs';
import DistanceField from '../fields/DistanceField.mjs';
import DxccField from '../fields/DxccField.mjs';
import EmailField from '../fields/EmailField.mjs';
import EqCallField from '../fields/EqCallField.mjs';
import EqslAgField from '../fields/EqslAgField.mjs';
import EqslQslrdateField from '../fields/EqslQslrdateField.mjs';
import EqslQslsdateField from '../fields/EqslQslsdateField.mjs';
import EqslQslRcvdField from '../fields/EqslQslRcvdField.mjs';
import EqslQslSentField from '../fields/EqslQslSentField.mjs';
import FistsField from '../fields/FistsField.mjs';
import FistsCcField from '../fields/FistsCcField.mjs';
import FreqField from '../fields/FreqField.mjs';
import FreqRxField from '../fields/FreqRxField.mjs';
import ForceInitField from '../fields/ForceInitField.mjs';
import GuestOpField from '../fields/GuestOpField.mjs';
import ItuzField from '../fields/ItuzField.mjs';
import KIndexField from '../fields/KIndexField.mjs';
import ModeField from '../fields/ModeField.mjs';
import MorseKeyTypeField from '../fields/MorseKeyTypeField.mjs';
import MyDarcDokField from '../fields/MyDarcDokField.mjs';
import MyMorseKeyTypeField from '../fields/MyMorseKeyTypeField.mjs';
import MyRigField from '../fields/MyRigField.mjs';
import NameField from '../fields/NameField.mjs';
import PublicKeyField from '../fields/PublicKeyField.mjs';
import QsoCompleteField from '../fields/QsoCompleteField.mjs';
import QsoDateField from '../fields/QsoDateField.mjs';
import QsoDateOffField from '../fields/QsoDateOffField.mjs';
import QsoRandomField from '../fields/QsoRandomField.mjs';
import RigField from '../fields/RigField.mjs';
import SigField from '../fields/SigField.mjs';
import SigInfoField from '../fields/SigInfoField.mjs';
import SilentKeyField from '../fields/SilentKeyField.mjs';
import SkccField from '../fields/SkccField.mjs';
import SwlField from '../fields/SwlField.mjs';
import TimeOffField from '../fields/TimeOffField.mjs';
import TimeOnField from '../fields/TimeOnField.mjs';
import VeProvField from '../fields/VeProvField.mjs';
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
            CreditSubmittedField,
            CreditGrantedField,
            DarcDokField,
            DclQslrdateField,
            DclQslsdateField,
            DclQslRcvdField,
            DclQslSentField,
            DistanceField,
            DxccField,
            EmailField,
            EqCallField,
            EqslAgField,
            EqslQslrdateField,
            EqslQslsdateField,
            EqslQslRcvdField,
            EqslQslSentField,
            FistsField,
            FistsCcField,
            ForceInitField,
            FreqField,
            FreqRxField,
            GuestOpField,
            ItuzField,
            KIndexField,
            ModeField,
            MorseKeyTypeField,
            MyDarcDokField,
            MyMorseKeyTypeField,
            MyRigField,
            NameField,
            PublicKeyField,
            QsoCompleteField,
            QsoDateField,
            QsoDateOffField,
            QsoRandomField,
            RigField,
            SigField,
            SigInfoField,
            SilentKeyField,
            SkccField,
            SwlField,
            TimeOffField,
            TimeOnField,
            VeProvField,
            WebField,
        ], EndOfRecordTag, obj);
    }
}

export default RecordSegment;
