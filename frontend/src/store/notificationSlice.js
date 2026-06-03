// store/notificationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../hooks/api'

// =====================
// 1️⃣ async thunk
// =====================
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async ({ page = 1, category = "", is_read } = {}, thunkAPI) => {
    try {
      console.log(category)
      let url = `/notifications/all/?page=${page}`;

      if (category) {
        url += `&category=${category}`;
      }

      if (is_read !== null && is_read !== undefined) {
        url += `&is_read=${is_read}`;
      }

      const res = await api.get(url);

      return {
        data: res.data.results,
        page: res.data.current_page,
        next: res.data.next,
        previous: res.data.previous,
        totalPages: res.data.total_pages,
        totalCount: res.data.count,
      };

    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const fetchNextNotifications = createAsyncThunk(
  "notifications/fetchNext",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState().notifications;

    if (!state.next) return thunkAPI.rejectWithValue("No next page");

    const res = await api.get(state.next);

    return {
      data: res.data.results,
      page: res.data.current_page,
      next: res.data.next,
      previous: res.data.previous,
      totalPages: res.data.total_pages,
      totalCount: res.data.count,
    };
  }
);


export const fetchPrevNotifications = createAsyncThunk(
  "notifications/fetchPrev",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState().notifications;

    if (!state.previous) return thunkAPI.rejectWithValue("No previous page");

    const res = await api.get(state.previous);

    return {
      data: res.data.results,
      page: res.data.current_page,
      next: res.data.next,
      previous: res.data.previous,
      totalPages: res.data.total_pages,
      totalCount: res.data.count,
    };
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


export const markNotificationAsRead = createAsyncThunk(
  "notifications/markNotificationAsRead",
  async ({ id }, thunkAPI) => {
    try {
      await api.post(`/notifications/read/${id}/`)
    } finally {
      return null
    }
  }
)

export const fetchNotificationsByPage = createAsyncThunk(
  "notifications/fetchByPage",
  async (page, thunkAPI) => {
    try {
      const res = await api.get(`/notifications/all/?page=${page}`);

      return {
        data: res.data.results,
        page: res.data.current_page,
        next: res.data.next,
        previous: res.data.previous,
        totalPages: res.data.total_pages,
        totalCount: res.data.count,
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

const pageSize = 10;

// =====================
// 2️⃣ slice
// =====================
const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
    unreadList: [],
    unreadCount: 0,

    loading: false,
    error: null,

    page: 1,
    next: null,
    previous: null,
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
    
    markNotificationReadLocal(state, action) {
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
        const { data, page, next, previous, totalPages, totalCount } = action.payload;

        if (page === 1) {
          state.list = data;
        } else {
          // جلوگیری از duplicate
          const existingIds = new Set(state.list.map(n => n.id));
          const newItems = data.filter(n => !existingIds.has(n.id));

          state.list.push(...newItems);
        }

        state.page = page;
        state.next = next;
        state.previous = previous;
        state.totalPages = totalPages;
        state.totalCount = totalCount;
        state.loading = false;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchNextNotifications.fulfilled, (state, action) => {
        const { data, page, next, previous, totalPages, totalCount } = action.payload;

        state.page = page;
        state.list = data;
        state.next = next;
        state.previous = previous;
        state.totalPages = totalPages;
        state.totalCount = totalCount;
        state.loading = false;
      })

      // 🔵 prev page
      .addCase(fetchPrevNotifications.fulfilled, (state, action) => {
        const { data, page, next, previous, totalPages, totalCount } = action.payload;

        state.page = page;
        state.list = data;
        state.next = next;
        state.previous = previous;
        state.totalPages = totalPages;
        state.totalCount = totalCount;
        state.loading = false;
      })
      .addCase(fetchNotificationsByPage.fulfilled, (state, action) => {
        const { data, page, next, previous, totalPages, totalCount } = action.payload;

        state.page = page;
        state.list = data;
        state.next = next;
        state.previous = previous;
        state.totalPages = totalPages;
        state.totalCount = totalCount;
        state.loading = false;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadNotifList.fulfilled, (state, action) => {
        state.unreadList = action.payload;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notif = state.list.find(n => n.id === action.payload);

        if (notif && !notif.is_read) {
          notif.is_read = true;
          state.unreadCount -= 1;
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        const notif = state.list.find(
          n => n.id === action.payload.id
        );

        if (notif) {
          notif.is_read = false;
          state.unreadCount += 1;
        }
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
  markNotificationReadLocal,
  deleteNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
