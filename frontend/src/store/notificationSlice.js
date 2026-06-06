// store/notificationSlice.js
import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import api from '../hooks/api';

// =====================
// THUNKS
// =====================

/**
 * گرفتن لیست notification ها با فیلتر
 * همه فیلترها (category, is_read, page) از همینجا
 */
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async ({ page = 1, category = "", is_read } = {}, thunkAPI) => {
    try {
      const params = new URLSearchParams({ page });
      if (category) params.append("category", category);
      if (is_read !== null && is_read !== undefined) params.append("is_read", is_read);

      const res = await api.get(`/notifications/all/?${params}`);

      return {
        data: res.data.results,
        page: res.data.current_page,
        next: res.data.next,
        previous: res.data.previous,
        totalPages: res.data.total_pages,
        totalCount: res.data.count,
        unreadCount: res.data.unread_count, // 👈 backend این رو هم برگردونه (توضیح پایین)
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

/**
 * صفحه بعد
 */
export const fetchNextNotifications = createAsyncThunk(
  "notifications/fetchNext",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState().notifications;
    if (!state.next) return thunkAPI.rejectWithValue("No next page");

    try {
      const res = await api.get(state.next);
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

/**
 * صفحه قبل
 */
export const fetchPrevNotifications = createAsyncThunk(
  "notifications/fetchPrev",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState().notifications;
    if (!state.previous) return thunkAPI.rejectWithValue("No previous page");

    try {
      const res = await api.get(state.previous);
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


export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (id, thunkAPI) => {
    try {
      await api.delete(`/notifications/${id}/delete/`);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue({ id, error: err.response?.data });
    }
  }
);

/**
 * فقط تعداد unread — برای badge توی navbar
 * این رو جداگانه نگه می‌داریم چون:
 * - موقع لود اول app صدا می‌زنیم (قبل از باز کردن پنل notification)
 * - خیلی سبکه (فقط یه عدد)
 */
export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/notifications/unread-count/");
      return res.data.unread;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

/**
 * mark یه notification به عنوان خوانده شده
 * id رو برمی‌گردونیم تا توی reducer پیدا کنیم
 */
export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id, thunkAPI) => {
    try {
      await api.post(`/notifications/read/${id}/`);
      return id; // 👈 id رو return کن نه null
    } catch (err) {
      return thunkAPI.rejectWithValue({ id, error: err.response?.data });
    }
  }
);

/**
 * همه رو خوانده شده mark کن
 */
export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, thunkAPI) => {
    try {
      await api.post("/notifications/read-all/");
      return true;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);


// =====================
// HELPERS
// =====================

/** نتیجه pagination رو توی state ست می‌کنه — تکرار نشه */
function applyPaginationResult(state, payload) {
  const { data, page, next, previous, totalPages, totalCount } = payload;
  state.list = data;
  state.page = page;
  state.next = next;
  state.previous = previous;
  state.totalPages = totalPages;
  state.totalCount = totalCount;
  state.loading = false;
}


// =====================
// SLICE
// =====================

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
    unreadCount: 0,

    loading: false,
    isMarking: false, // 👈 جدا از loading عمومی
    error: null,

    page: 1,
    next: null,
    previous: null,
    totalPages: 1,
    totalCount: 0,

    activeFilters: {
      category: "",
      is_read: undefined,
    },
  },

  reducers: {
    /**
     * وقتی notification جدید از WebSocket می‌رسه
     */
    addNotification(state, action) {
      const exists = state.list.some(n => n.id === action.payload.id);
      if (exists) return;

      if (state.page === 1) {
        state.list.unshift(action.payload);
        if (state.list.length > 10) state.list.pop();
      }

      state.totalCount += 1;
      state.totalPages = Math.ceil(state.totalCount / 10);
      state.unreadCount += 1;
    },

    /**
     * بدون request به backend — فقط UI رو آپدیت کن
     * مثلاً وقتی روی notification کلیک می‌کنی و قبلاً markAsRead فرستادی
     */
    markReadLocal(state, action) {
      const notif = state.list.find(n => n.id === action.payload);
      if (notif && !notif.is_read) {
        notif.is_read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // ── fetchNotifications ──────────────────────────
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        applyPaginationResult(state, action.payload);
        // اگه backend unread_count برگردوند، آپدیتش کن
        if (action.payload.unreadCount !== undefined) {
          state.unreadCount = action.payload.unreadCount;
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── fetchNextNotifications ──────────────────────
      .addCase(fetchNextNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNextNotifications.fulfilled, (state, action) => {
        applyPaginationResult(state, action.payload);
      })
      .addCase(fetchNextNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── fetchPrevNotifications ──────────────────────
      .addCase(fetchPrevNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPrevNotifications.fulfilled, (state, action) => {
        applyPaginationResult(state, action.payload);
      })
      .addCase(fetchPrevNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // ── deleteNotifs ────────────────────────────

      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.list = state.list.filter(n => n.id !== action.payload);
        state.totalCount = Math.max(0, state.totalCount - 1);
        state.totalPages = Math.ceil(state.totalCount / 10);
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload.error;
      })

      // ── fetchUnreadCount ────────────────────────────
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      // ── markNotificationAsRead ──────────────────────
      .addCase(markNotificationAsRead.pending, (state) => {
        state.isMarking = true;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.isMarking = false;
        const notif = state.list.find(n => n.id === action.payload);
        if (notif && !notif.is_read) {
          notif.is_read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.isMarking = false;
        // Optimistic update رو rollback کن اگه لازم بود
        const notif = state.list.find(n => n.id === action.payload?.id);
        if (notif) notif.is_read = false;
      })

      // ── markAllAsRead ───────────────────────────────
      .addCase(markAllAsRead.pending, (state) => {
        state.isMarking = true;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.isMarking = false;
        state.list = state.list.map(n => ({ ...n, is_read: true }));
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.isMarking = false;
        state.error = action.payload;
      });
  },
});

export const {
  addNotification,
  markReadLocal,
  removeNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;


// =====================
// SELECTORS
// =====================

/** لیست کامل */
export const selectNotifications = (state) => state.notifications.list;

/** فقط unread ها — بدون request جدید */
export const selectUnreadNotifications = createSelector(
  selectNotifications,
  (list) => list.filter(n => !n.is_read).slice(0, 4)
);

/** تعداد unread */
export const selectUnreadCount = (state) => state.notifications.unreadCount;

/** وضعیت loading */
export const selectNotifLoading = (state) => state.notifications.loading;

/** pagination info */
export const selectNotifPagination = (state) => ({
  page: state.notifications.page,
  totalPages: state.notifications.totalPages,
  totalCount: state.notifications.totalCount,
  hasNext: !!state.notifications.next,
  hasPrev: !!state.notifications.previous,
});