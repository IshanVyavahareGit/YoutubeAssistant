"use client";

import { useState } from "react";
import { Youtube, Globe, FileText, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function FeatureGridDarkEnhanced() {
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<{ [key: string]: string[] }>(
    {}
  );
  const [customText, setCustomText] = useState("");

  const features = [
    {
      icon: Youtube,
      title: "YouTube Videos",
      color: "text-red-500",
      buttonText: "Add Custom Links",
      dialogTitle: "Add YouTube Video Links",
      subText:
        "Enter up to 3 YouTube video links. Empty fields will be filled with automatically fetched videos.",
      points: [
        "Uses transcripts of YouTube videos",
        "In-depth tutorials",
        "Diverse range of topics",
      ],
    },
    {
      icon: Globe,
      title: "Web Pages",
      color: "text-blue-400",
      buttonText: "Add Custom Links",
      dialogTitle: "Add Web Page Links",
      subText:
        "Enter up to 3 web page URLs. Empty fields will be filled with automatically fetched web pages.",
      points: [
        "Comprehensive articles",
        "Up-to-date information",
        "Interactive elements",
      ],
    },
    {
      icon: FileText,
      title: "Research Papers",
      color: "text-green-400",
      buttonText: "Add Custom Links",
      dialogTitle: "Add Research Paper Links (Direct PDF Links)",
      subText:
        "Enter up to 3 direct PDF links. Empty fields will be filled with automatically fetched research papers.",
      points: [
        "Peer-reviewed studies",
        "Cutting-edge findings",
        "Detailed methodologies",
      ],
    },
    {
      icon: Pencil,
      title: "Custom",
      color: "text-amber-400",
      buttonText: "Add Custom Text",
      dialogTitle: "Add Custom Information",
      subText:
        "Enter your custom information below. Maximum 20,000 characters.",
      points: [
        "Tailored to your needs",
        "Flexible content options",
        "Personalized experience",
      ],
    },
  ];

  const handleSubmit = (title: string) => {
    if (title === "Custom") {
      console.log(`Submitted for ${title}:`, customText);
      setCustomText("");
    } else {
      console.log(`Submitted for ${title}:`, inputValues[title]);
      setInputValues((prev) => ({ ...prev, [title]: ["", "", ""] }));
    }
    setOpenDialog(null);
  };

  const handleInputChange = (title: string, index: number, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [title]: prev[title]
        ? prev[title].map((v, i) => (i === index ? value : v))
        : ["", "", ""],
    }));
  };

  const handleMainSubmit = () => {
    console.log("Main submit button clicked");
    // Add your main submit logic here
  };

  return (
    <div className="flex items-center justify-center flex-col h-screen p-4 sm:p-6 lg:p-8 text-lg">
      <div className="rounded-2xl w-4/6 h-auto bg-[linear-gradient(45deg,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF)] bg-[length:800%_auto] animate-gradient p-[2px] shadow-lg mb-6">
        <div className="bg-black rounded-2xl justify-center items-center py-2 px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-900 rounded-lg p-6 sm:p-8 flex flex-col"
              >
                <div className="flex items-center mb-4">
                  <feature.icon className={`w-10 h-10 mr-4 ${feature.color}`} />
                  <h2 className="text-2xl font-semibold text-white">
                    {feature.title}
                  </h2>
                </div>
                <ul className="list-disc list-inside space-y-3 text-gray-300 flex-grow text-lg">
                  {feature.points.map((point, pointIndex) => (
                    <li key={pointIndex}>{point}</li>
                  ))}
                </ul>
                <Dialog
                  open={openDialog === feature.title}
                  onOpenChange={(open) =>
                    open ? setOpenDialog(feature.title) : setOpenDialog(null)
                  }
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="default"
                      className="rounded-full bg-white text-black mt-6 text-lg hover:bg-zinc-200 transition-all border-zinc-400 hover:border-[3px]"
                    >
                      {feature.buttonText}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[750px] bg-gray-950 text-white border border-gray-800 p-8">
                    <DialogHeader>
                      <DialogTitle className="text-3xl ">
                        {feature.dialogTitle}
                      </DialogTitle>
                    </DialogHeader>
                    <p className="text-lg text-gray-400 mb-2">
                      {feature.subText}
                    </p>
                    <div className="grid gap-4 py-4">
                      {feature.title === "Custom" ? (
                        <Textarea
                          placeholder="Enter your custom information here"
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          maxLength={20000}
                          className="h-60 bg-gray-900 text-white text-xl p-4"
                        />
                      ) : (
                        [0, 1, 2].map((i) => (
                          <Input
                            key={i}
                            placeholder={`Link ${i + 1}`}
                            value={inputValues[feature.title]?.[i] || ""}
                            onChange={(e) =>
                              handleInputChange(
                                feature.title,
                                i,
                                e.target.value
                              )
                            }
                            className="bg-gray-900 text-white text-xl p-4 h-14 w-full"
                          />
                        ))
                      )}
                    </div>
                    <Button
                      onClick={() => handleSubmit(feature.title)}
                      variant="default"
                      className="rounded-full bg-white text-black hover:bg-slate-200 transition-all border-slate-400 hover:border-[3px] w-full text-xl h-14"
                    >
                      Submit
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
          <div className="my-8 relative group flex w-[600px] justify-center mx-auto">
            <div className="absolute inset-0 blur-xl rounded-full w-auto h-full bg-[linear-gradient(45deg,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF)] bg-[length:800%_auto] animate-gradientbg ease-out p-[3px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex rounded-full w-full h-full bg-[linear-gradient(45deg,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF,#2998ff,#FB923C,#8F00FF)] bg-[length:800%_auto] animate-gradient p-[3px]">
              <Button
                onClick={handleMainSubmit}
                variant="gradient"
                className="h-auto pb-[18px]"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
