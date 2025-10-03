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
import GridsquareField from '../fields/GridsquareField.mjs';
import GridsquareExtField from '../fields/GridsquareExtField.mjs';
import GuestOpField from '../fields/GuestOpField.mjs';
import HamlogeuQsoUploadDateField from '../fields/HamlogeuQsoUploadDateField.mjs';
import HamlogeuQsoUploadStatusField from '../fields/HamlogeuQsoUploadStatusField.mjs';
import HamqthQsoUploadDateField from '../fields/HamqthQsoUploadDateField.mjs';
import HamqthQsoUploadStatusField from '../fields/HamqthQsoUploadStatusField.mjs';
import HrdlogQsoUploadDateField from '../fields/HrdlogQsoUploadDateField.mjs';
import HrdlogQsoUploadStatusField from '../fields/HrdlogQsoUploadStatusField.mjs';
import IotaField from '../fields/IotaField.mjs';
import IotaIslandIdField from '../fields/IotaIslandIdField.mjs';
import ItuzField from '../fields/ItuzField.mjs';
import KIndexField from '../fields/KIndexField.mjs';
import LatField from '../fields/LatField.mjs';
import LonField from '../fields/LonField.mjs';
import LotwQslrdateField from '../fields/LotwQslrdateField.mjs';
import LotwQslsdateField from '../fields/LotwQslsdateField.mjs';
import LotwQslRcvdField from '../fields/LotwQslRcvdField.mjs';
import LotwQslSentField from '../fields/LotwQslSentField.mjs';
import MaxBursts from '../fields/MaxBurstsField.mjs';
import ModeField from '../fields/ModeField.mjs';
import MorseKeyInfoField from '../fields/MorseKeyInfoField.mjs';
import MorseKeyTypeField from '../fields/MorseKeyTypeField.mjs';
import MsShowerField from '../fields/MsShowerField.mjs';
import MyAntennaField from '../fields/MyAntennaField.mjs';
import MyArrlSectField from '../fields/MyArrlSectField.mjs';
import MyCityField from '../fields/MyCityField.mjs';
import MyCntyField from '../fields/MyCntyField.mjs';
import MyCntyAltField from '../fields/MyCntyAltField.mjs';
import MyCountryField from '../fields/MyCountryField.mjs';
import MyCqZoneField from '../fields/MyCqZoneField.mjs';
import MyDarcDokField from '../fields/MyDarcDokField.mjs';
import MyDxccField from '../fields/MyDxccField.mjs';
import MyFistsField from '../fields/MyFistsField.mjs';
import MyGridsquareField from '../fields/MyGridsquareField.mjs';
import MyGridsquareExtField from '../fields/MyGridsquareExtField.mjs';
import MyIotaField from '../fields/MyIotaField.mjs';
import MyIotaIslandIdField from '../fields/MyIotaIslandIdField.mjs';
import MyItuZoneField from '../fields/MyItuZoneField.mjs';
import MyLatField from '../fields/MyLatField.mjs';
import MyLonField from '../fields/MyLonField.mjs';
import MyMorseKeyInfoField from '../fields/MyMorseKeyInfoField.mjs';
import MyMorseKeyTypeField from '../fields/MyMorseKeyTypeField.mjs';
import MyNameField from '../fields/MyNameField.mjs';
import MyPostalCodeField from '../fields/MyPostalCodeField.mjs';
import MyPotaRefField from '../fields/MyPotaRefField.mjs';
import MyRigField from '../fields/MyRigField.mjs';
import MySigField from '../fields/MySigField.mjs';
import MySigInfoField from '../fields/MySigInfoField.mjs';
import MySotaRefFeild from '../fields/MySotaRefField.mjs';
import MyStateField from '../fields/MyStateField.mjs';
import MyStreetField from '../fields/MyStreetField.mjs';
import MyUsacaCountiesField from '../fields/MyUsacaCountiesField.mjs';
import MyVuccGridsField from '../fields/MyVuccGridsField.mjs';
import MyWwffRefField from '../fields/MyWwffRefField.mjs';
import NameField from '../fields/NameField.mjs';
import NotesField from '../fields/NotesField.mjs';
import NrBurstsField from '../fields/NrBurstsField.mjs';
import NrPingsField from '../fields/NrPingsField.mjs';
import OperatorField from '../fields/OperatorField.mjs';
import OwnerCallsignField from '../fields/OwnerCallsignField.mjs';
import PfxField from '../fields/PfxField.mjs';
import PotaRefField from '../fields/PotaRefField.mjs';
import PrecedenceField from '../fields/PrecedenceField.mjs';
import PropModeField from '../fields/PropModeField.mjs';
import PublicKeyField from '../fields/PublicKeyField.mjs';
import QrzcomQsoDownloadDateField from '../fields/QrzcomQsoDownloadDateField.mjs';
import QrzcomQsoDownloadStatusField from '../fields/QrzcomQsoDownloadStatusField.mjs';
import QrzcomQsoUploadDateField from '../fields/QrzcomQsoUploadDateField.mjs';
import QrzcomQsoUploadStatusField from '../fields/QrzcomQsoUploadStatusField.mjs';
import QslmsgField from '../fields/QslmsgField.mjs';
import QslmsgRcvdField from '../fields/QslmsgRcvdField.mjs';
import QslrdateField from '../fields/QslrdateField.mjs';
import QslsdateField from '../fields/QslsdateField.mjs';
import QsoCompleteField from '../fields/QsoCompleteField.mjs';
import QsoDateField from '../fields/QsoDateField.mjs';
import QsoDateOffField from '../fields/QsoDateOffField.mjs';
import QsoRandomField from '../fields/QsoRandomField.mjs';
import RigField from '../fields/RigField.mjs';
import SigField from '../fields/SigField.mjs';
import SigInfoField from '../fields/SigInfoField.mjs';
import SilentKeyField from '../fields/SilentKeyField.mjs';
import SkccField from '../fields/SkccField.mjs';
import SotaRefFeild from '../fields/SotaRefField.mjs';
import StateField from '../fields/StateField.mjs';
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
            GridsquareField,
            GridsquareExtField,
            GuestOpField,
            HamlogeuQsoUploadDateField,
            HamlogeuQsoUploadStatusField,
            HamqthQsoUploadDateField,
            HamqthQsoUploadStatusField,
            HrdlogQsoUploadDateField,
            HrdlogQsoUploadStatusField,
            IotaField,
            IotaIslandIdField,
            ItuzField,
            KIndexField,
            LatField,
            LonField,
            LotwQslrdateField,
            LotwQslsdateField,
            LotwQslRcvdField,
            LotwQslSentField,
            MaxBursts,
            ModeField,
            MorseKeyInfoField,
            MorseKeyTypeField,
            MsShowerField,
            MyAntennaField,
            MyArrlSectField,
            MyCityField,
            MyCntyField,
            MyCntyAltField,
            MyCountryField,
            MyCqZoneField,
            MyDarcDokField,
            MyDxccField,
            MyFistsField,
            MyGridsquareField,
            MyGridsquareExtField,
            MyIotaField,
            MyIotaIslandIdField,
            MyItuZoneField,
            MyLatField,
            MyLonField,
            MyMorseKeyInfoField,
            MyMorseKeyTypeField,
            MyNameField,
            MyPostalCodeField,
            MyPotaRefField,
            MyRigField,
            MySigField,
            MySigInfoField,
            MySotaRefFeild,
            MyStateField,
            MyStreetField,
            MyUsacaCountiesField,
            MyVuccGridsField,
            MyWwffRefField,
            NameField,
            NotesField,
            NrBurstsField,
            NrPingsField,
            OperatorField,
            OwnerCallsignField,
            PfxField,
            PotaRefField,
            PrecedenceField,
            PropModeField,
            PublicKeyField,
            QrzcomQsoDownloadDateField,
            QrzcomQsoDownloadStatusField,
            QrzcomQsoUploadDateField,
            QrzcomQsoUploadStatusField,
            QslmsgField,
            QslmsgRcvdField,
            QslrdateField,
            QslsdateField,
            QsoCompleteField,
            QsoDateField,
            QsoDateOffField,
            QsoRandomField,
            RigField,
            SigField,
            SigInfoField,
            SilentKeyField,
            SkccField,
            SotaRefFeild,
            StateField,
            SwlField,
            TimeOffField,
            TimeOnField,
            VeProvField,
            WebField,
        ], EndOfRecordTag, obj);
    }

    static fromADI(s) {
        const recordSegment = new RecordSegment();
        return Segment.fromADI(s, recordSegment);
    }
}

export default RecordSegment;
