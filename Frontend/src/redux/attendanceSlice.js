import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  attendanceData: [],
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,

  reducers: {


    setAttendanceData: (state, action) => {
      state.attendanceData = action.payload || [];
    },

    updateStudentAttendance: (state, action) => {
      const { studentId, status } = action.payload;

      const student = state.attendanceData.find(
        (s) => s.studentId === studentId
      );

      if (student) {
        student.status = status;
      }
    },


    addStudentAttendance: (state, action) => {
      state.attendanceData.push(action.payload);
    },

    resetAttendance: (state) => {
      state.attendanceData = [];
    },
  },
});

export const {
  setAttendanceData,
  updateStudentAttendance,
  addStudentAttendance,
  resetAttendance,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;