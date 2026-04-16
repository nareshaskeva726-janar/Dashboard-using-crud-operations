import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  projects: [],
  myProjects: [],
  selectedProject: null,

  submissionStatus: null,
  reminderSent: false,

  pendingStudents: [],
};

const assignmentSlice = createSlice({
  name: "Assignment",
  initialState,

  reducers: {
    /* ================= PROJECT LIST ================= */

    setProjects: (state, action) => {
      state.projects = action.payload ?? [];
    },

    addProject: (state, action) => {
      const exists = state.projects.some(
        (p) => p._id === action.payload._id
      );

      if (!exists) {
        state.projects.unshift(action.payload);
      }
    },

    setMyProjects: (state, action) => {
      state.myProjects = action.payload ?? [];
    },

    /* ================= SELECT PROJECT ================= */

    setSelectedProject: (state, action) => {
      state.selectedProject = action.payload ?? null;
    },

    clearSelectedProject: (state) => {
      state.selectedProject = null;
    },

    /* ================= SUBMISSION ================= */

    setSubmissionStatus: (state, action) => {
      state.submissionStatus = action.payload ?? null;
    },

    clearSubmissionStatus: (state) => {
      state.submissionStatus = null;
    },

    /* ================= REMINDER ================= */

    setReminderSent: (state, action) => {
      state.reminderSent = Boolean(action.payload);
    },

    resetReminder: (state) => {
      state.reminderSent = false;
    },

    /* ================= PENDING STUDENTS ================= */

    setPendingStudents: (state, action) => {
      state.pendingStudents = action.payload ?? [];
    },

    removePendingStudent: (state, action) => {
      state.pendingStudents = state.pendingStudents.filter(
        (student) => student._id !== action.payload
      );
    },

    clearPendingStudents: (state) => {
      state.pendingStudents = [];
    },

    /* ================= LOGOUT RESET ================= */

    resetProjectState: () => initialState,
  },
});

/* ================= EXPORTS ================= */

export const {
  setProjects,
  addProject,
  setMyProjects,

  setSelectedProject,
  clearSelectedProject,

  setSubmissionStatus,
  clearSubmissionStatus,

  setReminderSent,
  resetReminder,

  setPendingStudents,
  removePendingStudent,
  clearPendingStudents,

  resetProjectState,
} = assignmentSlice.actions;

export default assignmentSlice.reducer;