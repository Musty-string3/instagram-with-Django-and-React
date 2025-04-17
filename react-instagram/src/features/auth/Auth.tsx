import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch } from '../../app/store'

import styles from './Auth.module.css'
import Modal from 'react-modal'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { TextField, Button, CircularProgress } from '@mui/material/'

import {
    selectIsLoadingAuth,
    selectOpenSignIn,
    selectOpenSignUp,
    resetOpenSignIn,
    setOpenSignIn,
    setOpenSignUp,
    resetOpenSignUp,
    fetchAsyncLogin,
    fetchAsyncRegister,
    fetchAsyncGetMyProf,
    fetchAsyncGetProfs,
    fetchAsyncCreateProf,
    fetchCredStart,
    fetchCredEnd,
} from './authSlice'


const customStyles = {
    // modal以外の背景色
    overlay: {
        backgroundColor: "#777777",
    },
    content: {
        top: "50%",
        left: "50%",
        width: "auto",
        height: "auto",
        maxHeight: "80vh",
        padding: "50px",
        transform: "translate(-50%, -50%)",
        overflow: "initial",
    },
}

// tsの場合はReact.FCが必要
const Auth: React.FC = () => {
    Modal.setAppElement("#root");
    const openSignIn = useSelector(selectOpenSignIn);
    const openSignUp = useSelector(selectOpenSignUp);
    const isLoadingAuth = useSelector(selectIsLoadingAuth);
    const dispatch: AppDispatch = useDispatch();

    return (
        <div>
            <Modal
                // isOpenをtrue・falseで表示非表示を切り替えできる
                isOpen={openSignUp}
                // モーダル以外にクリックしたらモーダルを閉じる
                onRequestClose={async () => {
                    await dispatch(resetOpenSignUp());
                }}
                style={customStyles}
            >
                <Formik
                    initialErrors={{ email: "required" }}
                    initialValues={{ email: "", password: "" }}
                    // valuesにはユーザーが入力したemailとpasswordがオブジェクトとして入る
                    onSubmit={ async (values) => {
                        // ローディング開始 => ユーザー状態を取得 => ユーザー状態をReduxに反映 => ローディング終了
                        await dispatch(fetchCredStart());
                        const resultReg = await dispatch(fetchAsyncRegister(values));

                        // Django側が正常終了したときは、Redux側にも状態を反映させる
                        if (fetchAsyncRegister.fulfilled.match(resultReg)) {
                            await dispatch(fetchAsyncLogin(values));
                            // 新規作成時は、デフォルトとしてユーザーを作成する
                            await dispatch(fetchAsyncCreateProf({ nickName: "anonymous" }));

                            await dispatch(fetchAsyncGetProfs());
                            await dispatch(fetchAsyncGetMyProf());
                        }
                        // ローディング終了
                        await dispatch(fetchCredEnd());
                        await dispatch(resetOpenSignUp());
                    }}

                    validationSchema={Yup.object().shape({
                        email: Yup.string()
                            .email("メールアドレスの形式で入力してください。")
                            .required("メールアドレスの入力は必須です。"),
                        password: Yup.string()
                            // minとmaxで文字数制限をかけることができる
                            .required("パスワードを入力してください。").min(6),
                    })}
                >
                    {({
                        handleSubmit,
                        handleChange,
                        handleBlur,
                        values,
                        errors,
                        touched,
                        isValid,
                    }) => (
                        <div>
                            <form onSubmit={handleSubmit}>
                                <div className={styles.auth_signUp}>
                                    <h1 className={styles.auth_title}>SNS clone</h1>
                                    <br />
                                    <div className={styles.auth_progress}>
                                        { isLoadingAuth && <CircularProgress /> }
                                    </div>
                                    <br />

                                    <TextField
                                        placeholder="メールアドレス"
                                        type='input'
                                        name='email'
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.email}
                                    />
                                    {/* 一度でもフォームを触っている＆バリデーションエラーの場合は、エラーメッセージの表示 */}
                                    { touched.email && errors.email ? (
                                        <div className={styles.auth_error}>
                                            {errors.email}
                                        </div>
                                    ) : null }

                                    <TextField
                                        placeholder="パスワード"
                                        type='password'
                                        name='password'
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.password}
                                    />
                                    {/* 一度でもフォームを触っている＆バリデーションエラーの場合は、エラーメッセージの表示 */}
                                    { touched.password && errors.password ? (
                                        <div className={styles.auth_error}>
                                            {errors.password}
                                        </div>
                                    ) : null }
                                    <br />

                                    <Button
                                        variant='contained'
                                        color='primary'
                                        disabled={!isValid}
                                        type='submit'
                                    >
                                        新規作成
                                    </Button>
                                    <br />

                                    <span
                                        className={styles.auth_text}
                                        onClick={async () => {
                                            // ログイン用のモーダルを開き、新規登録のモーダルは閉じる
                                            await dispatch(setOpenSignIn());
                                            await dispatch(resetOpenSignUp());
                                        }}
                                    >
                                        ログインする
                                    </span>
                                </div>
                            </form>
                        </div>
                    )}
                </Formik>
            </Modal>

            {/* ログイン用のモーダル */}
            <Modal
                isOpen={openSignIn}
                onRequestClose={async () => {
                    await dispatch(resetOpenSignIn());
                }}
                style={customStyles}
            >
                <Formik
                    initialErrors={{ email: "required" }}
                    initialValues={{ email: "", password: "" }}
                    onSubmit={ async (values) => {
                        // ローディング開始 => ユーザー状態を取得 => ユーザー状態をReduxに反映 => ローディング終了
                        await dispatch(fetchCredStart());
                        const result = await dispatch(fetchAsyncLogin(values));

                        if (fetchAsyncRegister.fulfilled.match(result)) {
                            await dispatch(fetchAsyncGetProfs());
                            await dispatch(fetchAsyncGetMyProf());
                        }
                        await dispatch(fetchCredEnd());
                        await dispatch(resetOpenSignIn());
                    }}

                    validationSchema={Yup.object().shape({
                        email: Yup.string()
                            .email("メールアドレスの形式で入力してください。")
                            .required("メールアドレスの入力は必須です。"),
                        password: Yup.string()
                            // minとmaxで文字数制限をかけることができる
                            .required("パスワードを入力してください。").min(6),
                    })}
                >
                    {({
                        handleSubmit,
                        handleChange,
                        handleBlur,
                        values,
                        errors,
                        touched,
                        isValid,
                    }) => (
                        <div>
                            <form onSubmit={handleSubmit}>
                                <div className={styles.auth_signUp}>
                                    <h1 className={styles.auth_title}>SNS clone</h1>
                                    <br />
                                    <div className={styles.auth_progress}>
                                        { isLoadingAuth && <CircularProgress /> }
                                    </div>
                                    <br />

                                    <TextField
                                        placeholder="メールアドレス"
                                        type='input'
                                        name='email'
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.email}
                                    />
                                    { touched.email && errors.email ? (
                                        <div className={styles.auth_error}>
                                            {errors.email}
                                        </div>
                                    ) : null }

                                    <TextField
                                        placeholder="パスワード"
                                        type='password'
                                        name='password'
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.password}
                                    />
                                    <br />
                                    { touched.password && errors.password ? (
                                        <div className={styles.auth_error}>
                                            {errors.password}
                                        </div>
                                    ) : null }
                                    <br />

                                    <Button
                                        variant='contained'
                                        color='primary'
                                        disabled={!isValid}
                                        type='submit'
                                    >
                                        ログイン
                                    </Button>
                                    <br />

                                    <span
                                        className={styles.auth_text}
                                        onClick={async () => {
                                            // ログイン用のモーダルを開き、新規登録のモーダルは閉じる
                                            await dispatch(resetOpenSignIn());
                                            await dispatch(setOpenSignUp());
                                        }}
                                    >
                                        新規登録
                                    </span>
                                </div>
                            </form>
                        </div>
                    )}
                </Formik>
            </Modal>
        </div>
    )
}

export default Auth;
