import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  alertDialogOpen: boolean;
  alertDialogAlert: any;
  loading: boolean;
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
  modal: {
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  };
}

const initialState: UIState = {
  sidebarOpen: true,
  alertDialogOpen: false,
  alertDialogAlert: null,
  loading: false,
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
  modal: {
    open: false,
    title: '',
    content: '',
    onConfirm: () => {},
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    openAlertDialog: (state, action: PayloadAction<any>) => {
      state.alertDialogOpen = true;
      state.alertDialogAlert = action.payload;
    },
    closeAlertDialog: (state) => {
      state.alertDialogOpen = false;
      state.alertDialogAlert = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    showSnackbar: (state, action: PayloadAction<{
      message: string;
      severity: 'success' | 'error' | 'warning' | 'info';
    }>) => {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity,
      };
    },
    hideSnackbar: (state) => {
      state.snackbar = {
        ...state.snackbar,
        open: false,
      };
    },
    openModal: (state, action: PayloadAction<{
      title: string;
      content: string;
      onConfirm: () => void;
    }>) => {
      state.modal = {
        open: true,
        title: action.payload.title,
        content: action.payload.content,
        onConfirm: action.payload.onConfirm,
      };
    },
    closeModal: (state) => {
      state.modal = {
        ...state.modal,
        open: false,
      };
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  openAlertDialog,
  closeAlertDialog,
  setLoading,
  showSnackbar,
  hideSnackbar,
  openModal,
  closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;
