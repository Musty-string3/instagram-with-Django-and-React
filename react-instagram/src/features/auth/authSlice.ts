import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'

import axios from 'axios'
import { PROPS_AUTHEN, PROPS_NICKNAME, PROPS_PROFILE } from '../types'


const apiURL = process.env.REACT_APP_DEV_API_URL;

// ログイン
export const fetchAsyncLogin = createAsyncThunk(
    "auth/login",
    async(authen: PROPS_AUTHEN) => {
        const res= await axios.post(`${apiURL}/authen/jwt/create`, authen, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return res.data;
    }
);

// 新規ユーザー登録
export const fetchAsyncRegister = createAsyncThunk(
    "auth/register",
    async(auth: PROPS_AUTHEN) => {
        const res = await axios.post(`${apiURL}/api/register/`, auth, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return res.data;
    }
);

// プロフィールの作成
export const fetchAsyncCreateProf = createAsyncThunk(
    "profile/create",
    async(nickName: PROPS_NICKNAME) => {
        const res = await axios.post(`${apiURL}/api/profile/`, nickName, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `JWT ${localStorage.localJWT}`
            },
        });
        return res.data;
    }
);

// プロフィールの更新
export const fetchAsyncUpdateProf = createAsyncThunk(
    "profile/update",
    async(profile: PROPS_PROFILE) => {
        // formからのデータを取得
        const uploadData = new FormData();
        // uploadDataにプロフィール情報を格納していく
        uploadData.append("nickName", profile.nickName);
        if (profile.img) {
            uploadData.append("img", profile.img, profile.img.name);
        }

        // プロフィール情報の更新のため、putメソッドを使う
        const res = await axios.put(`${apiURL}/api/profile/${profile.id}/`, uploadData, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `JWT ${localStorage.localJWT}`
            },
        });
        return res.data;
    }
);

// ログインユーザーのプロフィール情報の取得
export const fetchAsyncGetMyProf = createAsyncThunk(
    "profile/get",
    async() => {
        const res = await axios.post(`${apiURL}/api/myprofile/`, {
            headers: {
                Authorization: `JWT ${localStorage.localJWT}`
            },
        });
        // ユーザー情報をDjangoのfilterを使って返却しているので、firstのみ取得する
        return res.data[0];
    }
);

// 全ユーザーのプロフィール情報の取得
export const fetchAsyncGetProfs = createAsyncThunk(
    "profiles/create",
    async() => {
        const res = await axios.post(`${apiURL}/api/profile/`, {
            headers: {
                Authorization: `JWT ${localStorage.localJWT}`
            },
        });
        return res.data;
    }
);


export const authSlice = createSlice({
    name: "auth",
    initialState: {
        openSignIn: true,
        openSignUp: false,
        openProfile: false,
        isLoadingAuth: false,
        myProfile: {
            id: 0,
            nickName: "",
            userProfile: 0,
            created_at: "",
            img: "",
        },
        profiles: [
            {
                id: 0,
                nickName: "",
                userProfile: 0,
                created_at: "",
                img: "",
            },
        ],
    },
    reducers: {
        fetchCredStart(state) {
            state.isLoadingAuth = true;
        },
        fetchCredEnd(state) {
            state.isLoadingAuth = false;
        },
        setOpenSignIn(state) {
            state.openSignIn = true;
        },
        resetOpenSignIn(state) {
            state.openSignIn = false;
        },
        setOpenSignUp(state) {
            state.openSignUp = true;
        },
        resetOpenSignUp(state) {
            state.openSignUp = false;
        },
        setOpenProfile(state) {
            state.openProfile = true;
        },
        resetOpenProfile(state) {
            state.openProfile = false;
        },
        editNickName(state, action) {
            state.myProfile.nickName = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAsyncLogin.fulfilled, (state, action) => {
            console.group("fetchAsyncLoginのaction.payload", action.payload);
            localStorage.setItem("localJWT", action.payload.access);
        })
        .addCase(fetchAsyncCreateProf.fulfilled, (state, action) => {
            console.group("fetchAsyncCreateProfのaction.payload", action.payload);
            state.myProfile = action.payload;
        })
        .addCase(fetchAsyncGetMyProf.fulfilled, (state, action) => {
            console.group("fetchAsyncGetMyProfのaction.payload", action.payload);
            state.myProfile = action.payload;
        })
        .addCase(fetchAsyncGetProfs.fulfilled, (state, action) => {
            console.group("fetchAsyncGetProfsのaction.payload", action.payload);
            state.profiles = action.payload;
        })
        .addCase(fetchAsyncUpdateProf.fulfilled, (state, action) => {
            console.group("fetchAsyncGetProfsのaction.payload", action.payload);
            state.myProfile = action.payload;
            state.profiles.map((profile) =>
                profile.id === action.payload.id ? action.payload : profile
            );
        })
    }
});

export const {
    fetchCredStart,
    fetchCredEnd,
    setOpenSignIn,
    resetOpenSignIn,
    setOpenSignUp,
    resetOpenSignUp,
    setOpenProfile,
    resetOpenProfile,
    editNickName
} = authSlice.actions;

// RootStateはhoverするとわかるが、全てのstateの型情報を持っている
// ここで設定した型情報つきの関数をuseSelectorで使用可能になる

export const selectIsLoadingAuth = (state: RootState) => state.auth.isLoadingAuth;
export const selectOpenSignIn = (state: RootState) => state.auth.openSignIn;
export const selectOpenSignUp = (state: RootState) => state.auth.openSignUp;
export const selectOpenProfile = (state: RootState) => state.auth.openProfile;
export const selectProfile = (state: RootState) => state.auth.myProfile;
export const selectProfiles = (state: RootState) => state.auth.profiles;


export default authSlice.reducer;