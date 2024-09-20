import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { useFirebase } from '../context/firebase';


export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const firebase = useFirebase();
    const navigate = useNavigate()
    useEffect(() => {
        if (firebase.isLoggedIn) {
            navigate('/main')
        }

    }, [firebase, navigate])

    const LoginFunction = async (e) => {
        e.preventDefault();
        try {
            const result = await firebase.UserLoginwithEmailandPassword(email, password);
            console.log(result);

            alert(`Logged in with ${email}`);
        } catch (error) {
            console.log(error);
            alert(error.message)
        }
    };
    const LoginGoogleFunction = async (e) => {
        e.preventDefault();
        try {
            const result = await firebase.UserLoginGoogle();
            console.log(result);

            alert(`Welcome ${result.user.displayName}`);
        } catch (error) {
            console.log(error);

        }
    };
    const ForgotPasswordFunction = async () => {
        if (!email) {
            alert('Please enter your email address.');
            return;
        }
        try {
            await firebase.sendPasswordReset(email);
            alert(`Password reset email sent to ${email}`);
        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    };

    const LoginFacebookFunction = async (e) => {
        e.preventDefault();
        try {
            const result = await firebase.UserLoginFacebook();
            console.log(result);
            alert(`Welcome ${result.user.displayName}`);
        } catch (error) {
            console.log(error);

        }
    };
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);

    };

    const handlePasswordBlur = () => {
        // Check if the password is less than 8 characters when the user finishes typing
        if (password.length > 0 && password.length < 6) {
            alert('Password must contain at least 6 characters');
        }
    };

    return (
        <>

            <div className="flex min-h-screen bg-[#0d0d0d] h-[fit-content]  flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img
                        className="mx-auto h-10 w-auto"
                        src="https://cdn.dribbble.com/userupload/16673750/file/original-3f2480fd160250a1445f2bdb740fae42.png?resize=1200x257"
                        alt="Your Company"
                    />
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-[#fefefe]">
                        Log in for an account
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={LoginFunction}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-[#fefefe]">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className=' pl-2 h-10 block w-full rounded-md border-0 py-1.5 text-[#fefefe] ring-inset bg-[#252525]   placeholder: text-gray-50 focus:ring-2 focus:ring-inset focus:ring-[#00b8d9] sm:text-sm sm:leading-6'
                                    value={email}
                                    onChange={handleEmailChange}
                                    placeholder='Enter your email'
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-[#fefefe]">
                                    Password
                                </label>
                                <div className="text-sm">
                                    <button onClick={() => ForgotPasswordFunction()} className="font-semibold text-[#00b8d9] hover:text-[#009bb3]">
                                        Forgot password?
                                    </button>

                                </div>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className=' pl-2 h-10 block w-full rounded-md border-0 py-1.5 text-[#fefefe] ring-inset bg-[#252525]   placeholder: text-gray-50 focus:ring-2 focus:ring-inset focus:ring-[#00b8d9] sm:text-sm sm:leading-6'
                                    placeholder='Enter your password'
                                    value={password}
                                    onChange={handlePasswordChange}
                                    onBlur={handlePasswordBlur}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-[#00b8d9] hover:bg-[#009bb3] px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Login
                            </button>
                            <button
                                type="button"
                                onClick={LoginGoogleFunction}
                                className="flex mt-2 w-full items-center justify-center rounded-md bg-[#252525]   hover:bg-[#3c3c3c]   px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                            >
                                <FcGoogle className="mr-2 h-5 w-5" />
                                Login with Google
                            </button>
                        </div>
                    </form>

                    <p className="mt-2 text-center text-sm text-gray-500">
                        Not a Member?{' '}
                        <a href="/" className="font-semibold leading-6 text-[#00b8d9] hover:text-[#009bb3]">
                            Signup
                        </a>
                    </p>

                </div>
            </div>



        </>
    );
}