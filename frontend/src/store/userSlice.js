import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../hooks/api';


// گرفتن کاربر فعلی
export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/account/user')
      return res.data
    } catch(err) {
      return thunkAPI.rejectWithValue(null);
    }
  }
);

// لاگین
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({national_id, password}, thunkAPI) => {
    try {
      await api.post("/account/login/", { national_id, password });
      const res = await thunkAPI.dispatch(fetchUser()).unwrap()
      return res
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);


//لاگ اوت

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      await api.post("/account/logout/");
    } finally {
      return null;
    }
  }
);


// آپدیت کردن کاربر
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (formData, thunkAPI) => {
    try {
      const res = await api.put('/account/update/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);


const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: true,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // گرفتن کاربر
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.user = null;
        state.loading = false;
      })

      // لاگین
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // لاگ اوت
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      })


      // آپدیت
      // update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        state.loading = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;