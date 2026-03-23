import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  attendanceData: [], // 🔥 temporary data for marking attendance
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,

  reducers: {

    // ✅ Set full attendance list (initial load)
    setAttendanceData: (state, action) => {
      state.attendanceData = action.payload;
    },

    // ✅ Update single student's attendance
    updateStudentAttendance: (state, action) => {
      const { studentId, status } = action.payload;

      const index = state.attendanceData.findIndex(
        (s) => s.studentId === studentId
      );

      if (index !== -1) {
        state.attendanceData[index].status = status;
      }
    },

    // ✅ Reset after submit
    resetAttendance: (state) => {
      state.attendanceData = [];
    },
  },
});

export const {
  setAttendanceData,
  updateStudentAttendance,
  resetAttendance,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;