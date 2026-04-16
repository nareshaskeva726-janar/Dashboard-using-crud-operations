import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  attendanceData: [],
  loading: false,
  error: null,
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,

  reducers: {

    /* ======================
       SET FULL ATTENDANCE
    ====================== */
    setAttendanceData: (state, action) => {
      state.attendanceData = action.payload || [];
      state.loading = false;
      state.error = null;
    },

    /* ======================
       LOADING STATE
    ====================== */
    setAttendanceLoading: (state, action) => {
      state.loading = action.payload;
    },

    /* ======================
       ERROR STATE
    ====================== */
    setAttendanceError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    /* ======================
       UPDATE STUDENT STATUS
    ====================== */
    updateStudentAttendance: (state, action) => {
      const { studentId, status } = action.payload;

      const student = state.attendanceData.find(
        (s) =>
          s.studentId === studentId ||
          s.studentId?._id === studentId
      );

      if (student) {
        student.status = status;
      }
    },

    /* ======================
       ADD STUDENT ATTENDANCE
    ====================== */
    addStudentAttendance: (state, action) => {
      const exists = state.attendanceData.find(
        (s) =>
          s.studentId === action.payload.studentId ||
          s.studentId?._id === action.payload.studentId
      );

      if (!exists) {
        state.attendanceData.push(action.payload);
      }
    },

    /* ======================
       REMOVE ATTENDANCE
    ====================== */
    removeStudentAttendance: (state, action) => {
      const id = action.payload;

      state.attendanceData = state.attendanceData.filter(
        (s) =>
          s._id !== id &&
          s.studentId !== id &&
          s.studentId?._id !== id
      );
    },

    /* ======================
       RESET
    ====================== */
    resetAttendance: (state) => {
      state.attendanceData = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setAttendanceData,
  setAttendanceLoading,
  setAttendanceError,
  updateStudentAttendance,
  addStudentAttendance,
  removeStudentAttendance,
  resetAttendance,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;