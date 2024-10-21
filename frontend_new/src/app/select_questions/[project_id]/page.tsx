"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function QuestionSelector({params} : {params: {project_id: string};}) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [customQuestions, setCustomQuestions] = useState<string[]>(["","","",]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  
  const [message, setMessage] = useState(""); // For displaying messages
  const [messageColor, setMessageColor] = useState(""); // Color for messages
  const [placeholderQuestions, setPlaceholderQuestions] = useState(["Loading Question..", "Loading Question..", "Loading Question..", "Loading Question..", "Loading Question..",])

  const project_id = params.project_id
  const user_id = "1SpHj23Df5"
  

  useEffect(() => {
    // fetch questions from the backend API
    console.log("Project ID: ", params.project_id)
    const fetchQuestions = async () => {
      if(project_id){
        try {
            const response = await fetch(`http://localhost:8080/apis/get_questions/${project_id}`, {
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
        
            const data = await response.json();
            if (data.success === "True") {
              setPlaceholderQuestions(data.questions)
            }
          } catch (error) {
            console.error("Error fetching questions:", error);
            setMessage("Failed to load questions.");
            setMessageColor("text-red-500");
          }
      }
    };

    fetchQuestions();
  }, [params.project_id]);


  const handleToggle = (id: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else if (prev.length < 3) {
        setErrorMessage(null); // Clear error message when a question is selected
        return [...prev, id];
      }
      return prev;
    });
  };

  const handleCustomQuestionChange = (index: number, value: string) => {
    if (value.length <= 400) {
      const newCustomQuestions = [...customQuestions];
      newCustomQuestions[index] = value;
      setCustomQuestions(newCustomQuestions);

      if (value && !selectedItems.includes(`custom-${index}`)) {
        handleToggle(`custom-${index}`);
        setErrorMessage(null);
      } else if (!value && selectedItems.includes(`custom-${index}`)) {
        handleToggle(`custom-${index}`);
      }
    }
  };

  const isDisabled = (id: string) => {
    return selectedItems.length >= 3 && !selectedItems.includes(id);
  };

  const getSelectionOrder = (id: string) => {
    const index = selectedItems.indexOf(id);
    return index !== -1 ? index + 1 : null;
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      setErrorMessage("Please select at least one question before submitting.");
      // setMessage("Please select at least one question before submitting.")
      // setMessageColor("text-red-500");
      return;
    }

    setErrorMessage(null);
    const selectedQuestions = selectedItems.map((id) => {
      if (id.startsWith("preset-")) {
        const index = parseInt(id.split("-")[1]);
        return placeholderQuestions[index];
      } else {
        const index = parseInt(id.split("-")[1]);
        return customQuestions[index];
      }
    });


    setMessage(`Questions selected: ${selectedQuestions} Custom: ${customQuestions}`);
    setMessageColor("text-green-500");

    const formatted_selected_questions = [];
    let custom_flag = 0;
    for(let i=0; i<selectedQuestions.length; i++){
      custom_flag = 0;
      for(let j=0; j<customQuestions.length; j++){
        if(selectedQuestions[i] === customQuestions[j]){
          custom_flag = 1;
          break;
        }
      }
      if(custom_flag)
        formatted_selected_questions.push({"type": "custom", "question": selectedQuestions[i]});
      else
        formatted_selected_questions.push({"type": "generated", "question": selectedQuestions[i]});
    }
    try {
      const response = await fetch(`http://localhost:8080/apis/finalize_questions/${project_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "user_id": user_id,
          "selected_questions": formatted_selected_questions
        }), 
      });

      // Log the JSON response to the console
      const data = await response.json();
      console.log("Response from backend:", data); // Log the response JSON

      if (data.success === "True") {
        setMessage(`Questions selected: ${selectedQuestions}`);
        setMessageColor("text-green-500");

        // router.push(`/select_sources/${params.project_id}`);
        router.push(`/dashboard`);

      } else {
        setMessage(`Error: ${data.message}`);
        setMessageColor("text-red-500");
      }
    } catch (error) {
      console.error("Error sending title:", error); // Log any errors
      // setMessage("An error occurred");
      // setMessageColor("text-red-500");
    }

    console.log("Questions submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col justify-center items-center">
      <div className="rounded-2xl w-3/5 h-auto bg-[linear-gradient(45deg,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF)] bg-[length:800%_auto] animate-gradient p-[2px] shadow-lg">
        <div className="bg-black rounded-2xl flex justify-center items-center py-4 px-4">
          <div className="w-full max-w-3xl py-4">
            <h1 className="text-6xl mb-5 text-center">
              Select Questions
            </h1>
            <p className="text-2xl mb-8 text-center">
              Choose 1-3 questions from the options below or create your own.
              The order of selection matters. Once 3 are selected, the rest will
              be disabled.
            </p>
            <div className="flex flex-col space-y-4">
              {placeholderQuestions.map((question, index) => (
                <button
                  key={`preset-${index}`}
                  onClick={() => handleToggle(`preset-${index}`)}
                  disabled={isDisabled(`preset-${index}`)}
                  className={`w-full p-6 pr-12 text-left border border-gray-700 rounded-md text-2xl relative ${
                    selectedItems.includes(`preset-${index}`)
                      ? "bg-gray-800"
                      : "bg-black hover:bg-gray-900"
                  } ${
                    isDisabled(`preset-${index}`)
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {question}
                  {selectedItems.includes(`preset-${index}`) && (
                    <span className="absolute top-2 right-2 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center text-lg font-bold">
                      {getSelectionOrder(`preset-${index}`)}
                    </span>
                  )}
                </button>
              ))}
              {customQuestions.map((question, index) => (
                <div
                  key={`custom-${index}`}
                  className={`w-full px-6 pr-12 text-left border border-gray-700 rounded-md text-2xl relative ${
                    selectedItems.includes(`custom-${index}`)
                      ? "bg-gray-800"
                      : "bg-black hover:bg-gray-900"
                  } ${
                    isDisabled(`custom-${index}`)
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <Input
                    type="text"
                    placeholder="Enter your custom question"
                    value={question}
                    onChange={(e) =>
                      handleCustomQuestionChange(index, e.target.value)
                    }
                    disabled={isDisabled(`custom-${index}`)}
                    className="w-full bg-transparent border-r-2 border-none focus:ring-0 p-0 text-2xl"
                    maxLength={400}
                  />
                  <span className="absolute bottom-2 right-2 text-sm text-gray-400">
                    {question.length}/400
                  </span>
                  {selectedItems.includes(`custom-${index}`) && (
                    <span className="absolute top-2 right-2 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center text-lg font-bold">
                      {getSelectionOrder(`custom-${index}`)}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xl mt-4 text-gray-400 text-center">
              Custom questions are automatically selected when you start typing.
            </p>
            {errorMessage && (
              <p className="text-red-500 text-xl mt-4 text-center">
                {errorMessage}
              </p>
            )}

            <div className="my-8 relative group flex w-[600px] justify-center mx-auto">
              <div className="absolute inset-0 blur-xl rounded-full w-auto h-full bg-[linear-gradient(45deg,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF)] bg-[length:800%_auto] animate-gradientbg ease-out p-[3px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex rounded-full w-full h-full bg-[linear-gradient(45deg,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF)] bg-[length:800%_auto] animate-gradient p-[3px]">
                <Button
                  onClick={handleSubmit}
                  variant="gradient"
                  className="h-auto pb-[10px] text-3xl font-medium"
                >
                  Submit
                </Button>
              </div>
            </div>

            {message && (
              <div
                className={`absolute top-0 left-1/2 transform -translate-x-1/2 mt-10 p-4 rounded-lg ${messageColor} bg-gray-800 text-xl transition-opacity duration-300 ease-in-out`}
                style={{ zIndex: 1000 }}
              >
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
