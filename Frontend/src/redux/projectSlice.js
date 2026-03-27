import { createSlice } from "@reduxjs/toolkit";

// Helper: get pending students from localStorage
const getPendingFromStorage = () => {
  try {
    const data = localStorage.getItem("pendingStudents");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const initialState = {
  projects: [],
  selectedProject: null,
  submissionStatus: null,
  reminderSent: false,
  pendingStudents: getPendingFromStorage(),
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload;
    },

    addProject: (state, action) => {
      state.projects.unshift(action.payload);
    },

    setSelectedProject: (state, action) => {
      state.selectedProject = action.payload;
    },

    clearSelectedProject: (state) => {
      state.selectedProject = null;
    },

    setSubmissionStatus: (state, action) => {
      state.submissionStatus = action.payload;
    },

    setReminderSent: (state, action) => {
      state.reminderSent = action.payload;
    },

    setPendingStudents: (state, action) => {
      state.pendingStudents = action.payload;
      localStorage.setItem("pendingStudents", JSON.stringify(action.payload));
    },

    removePendingStudent: (state, action) => {
      state.pendingStudents = state.pendingStudents.filter(
        (s) => s._id !== action.payload
      );

      localStorage.setItem(
        "pendingStudents",
        JSON.stringify(state.pendingStudents)
      );

    },

    clearPendingStudents: (state) => {
      state.pendingStudents = [];
      localStorage.removeItem("pendingStudents");
    },

  },

});

export const {
  setProjects,
  addProject,
  setSelectedProject,
  clearSelectedProject,
  setSubmissionStatus,
  setReminderSent,
  setPendingStudents,
  removePendingStudent,
  clearPendingStudents,
} = projectSlice.actions;

export default projectSlice.reducer;