"use client";

import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

function SignupTrial() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    channelUrl: false,
  });

  const handleSignup = async () => {
    const isValid = validateForm();

    if (!isValid) return;

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          channel_url: channelUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`${data.message}`);
        setMessageColor("text-green-500");
      } else {
        setMessage(`${data.message}`);
        setMessageColor("text-red-500");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setMessage("An error occurred while trying to sign up.");
      setMessageColor("text-red-500");
    }
  };

  const validateName = () => name.trim().length > 0;
  const validateEmail = () => /^[\w\.-]+@[\w\.-]+\.\w+$/.test(email);
  const validatePassword = () => password.length >= 8;
  const validateChannelUrl = () =>
    /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(
      channelUrl
    );

  const validateForm = () => {
    const validations = {
      name: validateName(),
      email: validateEmail(),
      password: validatePassword(),
      channelUrl: validateChannelUrl(),
    };

    setTouched({
      name: true,
      email: true,
      password: true,
      channelUrl: true,
    });

    return Object.values(validations).every((valid) => valid);
  };

  return (
    <>
      <div className="flex items-center justify-center flex-col h-screen">
        <div className="flex rounded-2xl w-auto h-auto bg-[linear-gradient(45deg,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF)] bg-[length:800%_auto] animate-gradient p-[2px] shadow-lg">
          <div className="flex-1 bg-black rounded-2xl flex flex-col justify-center items-center py-20 px-44">
            <h1 className="text-6xl pb-20">Create A New Account!</h1>

            <div className="p-4">
              <Input
                placeholder="Name"
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              />
              {touched.name && !validateName() && (
                <div className="text-red-500">Name is required</div>
              )}
            </div>
            <div className="p-4">
              <Input
                placeholder="Email"
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              />
              {touched.email && !validateEmail() && (
                <div className="text-red-500">Invalid email format</div>
              )}
            </div>
            <div className="p-4">
              <Input
                placeholder="Password"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, password: true }))
                }
              />
              {touched.password && !validatePassword() && (
                <div className="text-red-500">
                  Password must be at least 8 characters long
                </div>
              )}
            </div>
            <div className="p-4">
              <Input
                placeholder="Channel URL"
                type="text"
                id="channelurl"
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, channelUrl: true }))
                }
              />
              {touched.channelUrl && !validateChannelUrl() && (
                <div className="text-red-500">Invalid channel URL format</div>
              )}
            </div>

            <div className="w-[600px] h-20 mt-12 relative group">
              <div className="absolute inset-0 blur-xl flex rounded-full w-auto h-full bg-[linear-gradient(45deg,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF)] bg-[length:800%_auto] animate-gradientbg ease-out p-[3px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex rounded-full w-full h-full bg-[linear-gradient(45deg,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF)] bg-[length:800%_auto] animate-gradient p-[3px]">
                <Button
                  variant="gradient"
                  className="h-auto pb-[18px]"
                  onClick={handleSignup}
                >
                  Sign Up
                </Button>
              </div>
            </div>

            {message && (
              <div
                className={`absolute top-0 left-1/2 transform -translate-x-1/2 mt-14 p-4 rounded-lg ${messageColor} bg-gray-800 text-2xl transition-opacity duration-300 ease-in-out`}
                style={{ zIndex: 1000 }}
              >
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default SignupTrial;