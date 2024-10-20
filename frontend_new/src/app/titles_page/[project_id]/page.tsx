"use client";

import { useState, useEffect, Suspense } from "react";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "../../../components/ui/button";
import { useRouter } from "next/navigation";


export default function TitlesPage({params} : {params: {project_id: string};}) {
  const [selectedValue, setSelectedValue] = useState("");
  const [titles, setTitles] = useState<string[]>([]); // Set titles as an array of strings
  const [customTitle, setCustomTitle] = useState("");
  const [message, setMessage] = useState(""); // For displaying messages
  const [messageColor, setMessageColor] = useState(""); // Color for messages
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  let currTitleType = ""
  const user_id = "1SpHj23Df5"
  const project_id = params.project_id

  useEffect(() => {
    // Fetch titles from the backend API
    console.log("Project ID: ", params.project_id)
    const fetchTitles = async () => {
      if(project_id){
        try {
            const response = await fetch(`http://localhost:8080/apis/get_titles/${project_id}`, {
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
              setTitles([...data.titles, "Other"]); // Adding 'Other' to the fetched titles
            }
          } catch (error) {
            console.error("Error fetching titles:", error);
            setMessage("Failed to load titles.");
            setMessageColor("text-red-500");
          }
      }
    };

    fetchTitles();
  }, [params.project_id]);

  // Validate the custom title
  const validateCustomTitle = () => {
    return customTitle.length > 0 && customTitle.length <= 100;
  };

  // Handle submission of selected or custom title
  const handleSubmit = async () => {
    let finalTitle = selectedValue;
    if (!selectedValue) {
        setErrorMessage("Please select one option.");
        return;
      }
  
    // If "Other" is selected, use the custom title
    if (selectedValue === "Other") {
      if (!validateCustomTitle()) {
        setMessage(
          "Custom title must be greater than 0 characters and less than 100 characters."
        );
        setMessageColor("text-red-500");
        return;
      }
      finalTitle = customTitle; // Use the custom title inputted by the user
      currTitleType = "custom";
    }
    else{
      finalTitle = selectedValue;
      currTitleType = "generated";
    }

    // Print the selected title to the console
    console.log("Selected title to send:", finalTitle); // Log the selected title

    try {
      const response = await fetch(`http://localhost:8080/apis/finalize_title/${project_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "user_id": user_id,
          "selected_title": {
            "type": currTitleType, 
            "title": finalTitle
          }
        }), 
      });

      // Log the JSON response to the console
      const data = await response.json();
      console.log("Response from backend:", data); // Log the response JSON

      if (data.success === "True") {
        setMessage(`Title selected: ${data.title}`);
        setMessageColor("text-green-500");

        const response1 = await fetch(`http://localhost:8080/apis/gen_ques/${params.project_id}`, {
          method: 'POST',  
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user_id 
          }),
        });
        
        const data1 = await response1.json();
        console.log("Response from backend:", data1);

        if (!response1.ok) {
          throw new Error(`HTTP error! Status: ${response1.status}`);
        }

        else router.push(`/select_questions/${params.project_id}`);

      } else {
        setMessage(`Error: ${data.message}`);
        setMessageColor("text-red-500");
      }
    } catch (error) {
      console.error("Error sending title:", error); // Log any errors
      // setMessage("An error occurred");
      // setMessageColor("text-red-500");
    }
  };
  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    setErrorMessage(""); // Clear error message when a valid option is selected
  };

  return (
    <div className="flex items-center justify-center flex-col h-screen">
      <div className="flex rounded-2xl w-auto h-auto bg-[linear-gradient(45deg,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF)] bg-[length:800%_auto] animate-gradient p-[2px] shadow-lg">
        <div className="flex-1 bg-black rounded-2xl flex flex-col justify-center items-center py-16 px-32">
          <h1 className="text-6xl pb-16 text-white">Choose a Video Title</h1>

          <RadioGroup value={selectedValue} onValueChange={handleValueChange}>
            <div className="space-y-4">
              {titles.map((title, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <RadioGroupItem
                    value={title}
                    id={`r${index}`}
                    className="w-6 h-6"
                  />
                  <Label
                    htmlFor={`r${index}`}
                    className="text-white text-2xl font-semibold"
                  >
                    {title}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
          {errorMessage && (
            <div className="text-red-500 text-lg mt-2">{errorMessage}</div>
          )}
          {/* Custom title field (always visible but disabled unless "Other" is selected) */}
          <div className="mt-6 ">
            <Input
              placeholder="Add custom title"
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              disabled={selectedValue !== "Other"} // Disable if "Other" is not selected
              className={`w-80 ml-6 focus:outline-none focus:ring-0 ${
                selectedValue === "Other"
                  ? "bg-gray-800 text-white p-2"
                  : "bg-gray-500 text-gray-400 p-2"
              }`}
            />
          </div>

          {/* Submit button with matching gradient */}
          <div className="w-[400px] h-16 mt-12 relative group">
            <div className="absolute inset-0 blur-xl flex rounded-full w-auto h-full bg-[linear-gradient(45deg,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF)] bg-[length:800%_auto] animate-gradientbg ease-out p-[3px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex rounded-full w-full h-full bg-[linear-gradient(45deg,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF)] bg-[length:800%_auto] animate-gradient p-[3px]">
              <Button
                variant="gradient"
                className="h-auto pb-[10px] text-3xl font-medium"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </div>
          </div>

          {/* Message display */}
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
  );
}
