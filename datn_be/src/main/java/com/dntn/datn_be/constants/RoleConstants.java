package com.dntn.datn_be.constants;

public class RoleConstants {

    public interface RoleTypes {
        public String ROLE_ADMIN = "ADMIN";
        public String ROLE_COACH = "COACH";
        public String ROLE_USER = "USER";
    }

    public interface AuthoritiesTypes {
        // ===== COACH (01) =====
        String COACH = "01";
        String COACH_CREATE = "0101";
        String COACH_VIEW = "0102";
        String COACH_UPDATE = "0103";
        String COACH_DELETE = "0104";

        // ===== USER (02) =====
        String USER = "02";
        String USER_CREATE = "0201";
        String USER_VIEW = "0202";
        String USER_UPDATE = "0203";
        String USER_DELETE = "0204";

        // ===== ROLE (03) =====
        String ROLE = "03";
        String ROLE_CREATE = "0301";
        String ROLE_VIEW = "0302";
        String ROLE_UPDATE = "0303";
        String ROLE_DELETE = "0304";

        // ===== COMBO (04) =====
        String COMBO = "04";
        String COMBO_CREATE = "0401";
        String COMBO_VIEW = "0402";
        String COMBO_UPDATE = "0403";
        String COMBO_DELETE = "0404";

        // ===== SUBJECT (05) =====
        String SUBJECT = "05";
        String SUBJECT_CREATE = "0501";
        String SUBJECT_VIEW = "0502";
        String SUBJECT_UPDATE = "0503";
        String SUBJECT_DELETE = "0504";

        // ===== BOOKING (06) =====
        String BOOKING = "06";
        String BOOKING_CREATE = "0601";
        String BOOKING_VIEW = "0602";
        String BOOKING_UPDATE = "0603";
        String BOOKING_CANCEL = "0604";

        // ===== ZOOM (07) =====
        String ZOOM = "07";
        String ZOOM_CREATE = "0701";
        String ZOOM_VIEW = "0702";
        String ZOOM_END = "0703";

        // ===== TRAINING DATA (08) =====
        String TRAINING = "08";
        String TRAINING_CREATE = "0801";
        String TRAINING_VIEW = "0802";
        String TRAINING_UPDATE = "0803";
        String TRAINING_DELETE = "0804";

        // ===== REPORT (09) =====
        String REPORT = "09";
        String REPORT_VIEW = "0901";
        String REPORT_EXPORT_EXCEL = "0902";
        String REPORT_EXPORT_PDF = "0903";
    }
}
