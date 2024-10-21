"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

function ProjectIdeaSubmission() {
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaDescription, setIdeaDescription] = useState("");
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");
  const user_id = "1SpHj23Df5"
  const router = useRouter();

  // Track if inputs have been touched
  const [touched, setTouched] = useState({
    ideaTitle: false,
    ideaDescription: false,
  });

  const handleSubmit = async () => {
    // Check for validations before sending a request
    const isValid = validateForm();
    if (!isValid) return;

    const submissionData = {
      user_id: user_id,
      idea_title: ideaTitle,
      idea_desc: ideaDescription,
    };

    console.log("Submitting project idea:", submissionData);

    try {
      const response1 = await fetch("http://localhost:8080/apis/createproject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      console.log("Response status:", response1.status);
      console.log("Response headers:", response1.headers);

      const data = await response1.json();
      console.log("Response data:", data.project_id);

      if (response1.ok && data.success === "True") {
        setMessage("Project created successfully!");
        setMessageColor("text-green-500");

        const response = await fetch(`http://localhost:8080/apis/gen_titles/${data.project_id}`, {
          method: 'POST',  
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user_id 
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        else router.push(`/titles_page/${data.project_id}`);

      } else {
        setMessage(`Error: ${data.message || 'Unknown error occurred'}`);
        setMessageColor("text-red-500");
      }

    } catch (error: unknown) {
        console.error("Error details:", error);
        let errorMessage = "An error occurred while trying to submit the project idea.";
        if (error instanceof Error) {
          errorMessage += ` ${error.message}`;
        }
        setMessage(errorMessage);
        setMessageColor("text-red-500");
      }
    
  };

  // Validations
  const validateIdeaTitle = () => ideaTitle.length <= 100;
  const validateIdeaTitleZero = () => ideaTitle.length > 0;
  const validateIdeaDescription = () => ideaDescription.length <= 750;
  const validateIdeaDescriptionZero = () => ideaDescription.length >0 ;

  // Check all fields for validation
  const validateForm = () => {
    const validations = {
      ideaTitle: validateIdeaTitle() && validateIdeaTitleZero(),
      ideaDescription: validateIdeaDescription() && validateIdeaDescriptionZero(),
    };

    // If any field is invalid, mark it as touched
    setTouched({
      ideaTitle: true,
      ideaDescription: true,
    });

    return Object.values(validations).every((valid) => valid);
  };

  return (
    <>
      <div className="flex items-center justify-center flex-col h-screen">
        <div className="flex rounded-2xl w-auto h-auto bg-[linear-gradient(45deg,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF)] bg-[length:800%_auto] animate-gradient p-[2px] shadow-lg">
          <div className="flex-1 bg-black rounded-2xl flex flex-col justify-center items-center py-20 px-44">
            <h1 className="text-6xl pb-20">Your Project Idea</h1>

            <div className="p-4 w-full">
              <Input
                placeholder="Project Idea Title"
                type="text"
                id="ideaTitle"
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, ideaTitle: true }))}
                className="focus:outline-none focus:ring-0 bg-transparent"
              />
              {touched.ideaTitle && !validateIdeaTitle() && (
                <div className="text-red-500">Title should not exceed 100 characters</div>
              )}
              {touched.ideaTitle && !validateIdeaTitleZero() && (
                <div className="text-red-500">Please enter title!</div>
              )}
            </div>
            <div className="p-4 w-full">
              <Textarea
                placeholder="Project Description"
                id="ideaDescription"
                value={ideaDescription}
                onChange={(e) => setIdeaDescription(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, ideaDescription: true }))}
                className="focus:outline-none focus:ring-0 bg-transparent h-40"
              />
              {touched.ideaDescription && !validateIdeaDescription() && (
                <div className="text-red-500">
                  Description should not exceed 750 characters
                </div>
              )}
              {touched.ideaDescription && !validateIdeaDescriptionZero() && (
                <div className="text-red-500">
                  Please enter description of the project!
                </div>
              )}
              
            </div>

            <div className="w-[600px] h-20 mt-12 relative group">
              <div className="absolute inset-0 blur-xl flex rounded-full w-auto h-full bg-[linear-gradient(45deg,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF)] bg-[length:800%_auto] animate-gradientbg ease-out p-[3px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex rounded-full w-full h-full bg-[linear-gradient(45deg,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF)] bg-[length:800%_auto] animate-gradient p-[3px]">
                <Button
                  variant="gradient"
                  className="h-auto pb-[10px] text-3xl font-medium"
                  onClick={handleSubmit}
                >
                  Submit Idea
                </Button>
              </div>
            </div>

            {/* Message display as pop-up */}
            {message && (
              <div
                className={`absolute top-0 left-1/2 transform -translate-x-1/2 mt-10 p-4 rounded-lg ${messageColor} bg-gray-800 text-2xl transition-opacity duration-300 ease-in-out`}
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

export default ProjectIdeaSubmission;