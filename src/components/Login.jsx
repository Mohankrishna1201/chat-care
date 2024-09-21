import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { useFirebase } from '../context/firebase';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const firebase = useFirebase();
    const navigate = useNavigate();

    useEffect(() => {
        if (firebase.isLoggedIn) {
            navigate('/main');
        }
    }, [firebase, navigate]);

    const LoginFunction = async (e) => {
        e.preventDefault();
        try {
            const result = await firebase.UserLoginwithEmailandPassword(email, password);
            console.log(result);
            alert(`Logged in with ${email}`);
        } catch (error) {
            console.log(error);
            alert(error.message);
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

    const handleEmailChange = (e) => setEmail(e.target.value);

    const handlePasswordChange = (e) => setPassword(e.target.value);

    const handlePasswordBlur = () => {
        if (password.length > 0 && password.length < 6) {
            alert('Password must contain at least 6 characters');
        }
    };

    return (
        <section className="h-screen flex flex-col md:flex-row justify-center items-center space-y-10 md:space-y-0 md:space-x-16 my-2 mx-5 md:mx-0 md:my-0 bg-[#0d0d0d]">
            {/* Left side with image */}
            <div className="hidden md:block md:w-1/3 max-w-sm">
                <img
                    src="https://cdn.dribbble.com/userupload/16694596/file/original-81c895b73931494ee90812ebdeaa987a.png?resize=1200x1200"
                    alt="Your Company"
                    className="w-[440px]"
                />
            </div>

            {/* Right side with form */}
            <div className="md:w-1/3 max-w-sm">
                <div className="text-center md:text-left">
                    <h2 className="text-2xl text-center font-bold text-[#fefefe] mb-6">
                        Log in for an account
                    </h2>

                    {/* Social Login Options */}
                    <p className="text-[#fefefe] text-center font-bold">Sign in with</p>
                    <div className="flex space-x-2 my-4">
                        <button
                            type="button"
                            onClick={LoginGoogleFunction}
                            className="flex mt-2 w-full items-center justify-center rounded-md bg-[#252525]   hover:bg-[#3c3c3c]   px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                        >
                            <FcGoogle className="mr-2 h-5 w-5" />
                            Login with Google
                        </button>
                    </div>

                    <div className="flex items-center my-4">
                        <div className="flex-grow border-t border-neutral-300"></div>
                        <p className="mx-2 text-sm text-gray-500 font-semibold">or</p>
                        <div className="flex-grow border-t border-neutral-300"></div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={LoginFunction} className="space-y-4">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="block w-full text-sm px-4 py-2 border-0 rounded bg-[#252525] text-[#fefefe] focus:ring-2 focus:ring-[#00b8d9]"
                            value={email}
                            onChange={handleEmailChange}
                            placeholder="Enter your email"
                        />

                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="block w-full text-sm px-4 py-2 border-0 rounded bg-[#252525] text-[#fefefe] focus:ring-2 focus:ring-[#00b8d9]"
                            value={password}
                            onChange={handlePasswordChange}
                            onBlur={handlePasswordBlur}
                            placeholder="Enter your password"
                        />

                        <div className="flex justify-between text-sm text-gray-500">
                            <label className="flex items-center">
                                <input type="checkbox" className="mr-1" />
                                Remember Me
                            </label>
                            <button
                                onClick={ForgotPasswordFunction}
                                className="text-[#00b8d9] hover:text-[#009bb3]">
                                Forgot Password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 text-sm font-semibold bg-[#00b8d9] hover:bg-[#009bb3] text-white rounded"
                        >
                            Login
                        </button>
                    </form>

                    <p className="mt-4 text-sm text-center text-gray-500">
                        Not a Member?{' '}
                        <Link to="/" className="text-[#00b8d9] hover:text-[#009bb3]">
                            Signup
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
