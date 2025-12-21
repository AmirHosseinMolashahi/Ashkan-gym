// store/notificationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../hooks/api'

// =====================
// 1️⃣ async thunk
// =====================
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async ({ page = 1, type = "", is_read = "" } = {}, thunkAPI) => {
    try {
      const res = await api.get(
        `/notifications/all/?page=${page}&type=${type}&is_read=${is_read}`
      );

      return {
        data: res.data.results,
        page,
        totalPages: Math.ceil(res.data.count / 10),
        totalCount: res.data.count,
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const fetchUnreadNotifList = createAsyncThunk(
  "notifications/fetchUnreadNotifList",
  async (_,thunkAPI) => {
    try {
      const res = await api.get('/notifications/unread/')
      console.log(res.data)
      return res.data
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);


export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async () => {
    const res = await api.get("/notifications/unread-count/");
    return res.data.unread;
  }
);


export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, thunkAPI) => {
    try {
      await api.post("/notifications/read-all/");
    } finally {
      return null;
    }
  }
)

const pageSize = 10;

// =====================
// 2️⃣ slice
// =====================
const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
    unreadList : [],
    unreadCount: 0,
    loading: false,
    error: null,
    page: 1,
    totalPages: 1,
    totalCount: 0,
  },
  reducers: {
    addNotification(state, action) {
      const exists = state.list.some(n => n.id === action.payload.id);
      if (!exists) {
        if (state.page === 1) {
          state.list.unshift(action.payload);

          if (state.list.length > 10) {
            state.list.pop();
          }
        }
        state.totalCount += 1;
        state.totalPages = Math.ceil(state.totalCount / 10);
        state.unreadCount += 1;
      }
    },

    markAsRead(state, action) {
      const notif = state.list.find(n => n.id === action.payload);
      if (notif && !notif.is_read) {
        notif.is_read = true;
        state.unreadCount -= 1;
      }
    },

    deleteNotification(state, action) {
      state.list = state.list.filter(n => n.id !== action.payload);
      state.totalCount -= 1;
      state.totalPages = Math.ceil(state.totalCount / 10);
    },
  },

  // =====================
  // 3️⃣ async states
  // =====================
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        if (action.payload.page === 1) {
          state.list = action.payload.data;
        } else {
          state.list = action.payload.data;
        }

        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.totalCount = action.payload.totalCount;
        state.loading = false;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadNotifList.fulfilled, (state, action) => {
        state.unreadList = action.payload;
      })
      .addCase(markAllAsRead.pending, (state) => {
        state.loading = true;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.list = state.list.map(n => ({
          ...n,
          is_read: true,
        }));
        state.unreadList = [];
        state.unreadCount = 0;
        state.loading = false;
      });
  },
});

export const {
  addNotification,
  markAsRead,
  deleteNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
