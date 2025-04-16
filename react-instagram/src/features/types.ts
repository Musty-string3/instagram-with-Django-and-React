export interface PROPS_AUTHEN {
    email: string;
    password: string;
}

// authSlice.ts

export interface File extends Blob {
    readonly lastModified: number;
    readonly name: string;
}

export interface PROPS_PROFILE {
    id: number;
    nickName: string;
    img: File | null;
}

export interface PROPS_NICKNAME {
    nickName: string;
}

// authSlice.ts