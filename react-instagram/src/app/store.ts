import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit"
import authReducer from "../features/auth/authSlice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
// dispatchも型情報を登録しておく
export const AppDispatch = typeof store.dispatch;