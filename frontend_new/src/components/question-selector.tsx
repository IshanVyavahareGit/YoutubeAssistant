"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

export function QuestionSelectorComponent() {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [customQuestions, setCustomQuestions] = useState<string[]>(["", "", ""])

  const placeholderQuestions = [
    "What is your favorite color and why?",
    "Describe your ideal vacation destination.",
    "If you could have dinner with any historical figure, who would it be?",
    "What's the most interesting book you've read recently?",
    "What's a skill you'd like to learn in the next year?",
  ]

  const handleToggle = (id: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id)
      } else if (prev.length < 3) {
        return [...prev, id]
      }
      return prev
    })
  }

  const handleCustomQuestionChange = (index: number, value: string) => {
    const newCustomQuestions = [...customQuestions]
    newCustomQuestions[index] = value
    setCustomQuestions(newCustomQuestions)

    if (value && !selectedItems.includes(`custom-${index}`)) {
      handleToggle(`custom-${index}`)
    } else if (!value && selectedItems.includes(`custom-${index}`)) {
      handleToggle(`custom-${index}`)
    }
  }

  const isDisabled = (id: string) => {
    return selectedItems.length >= 3 && !selectedItems.includes(id)
  }

  const getSelectionOrder = (id: string) => {
    const index = selectedItems.indexOf(id)
    return index !== -1 ? index + 1 : null
  }

  const handleSubmit = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one question before submitting.",
        variant: "destructive",
      })
      return
    }

    const selectedQuestions = selectedItems.map(id => {
      if (id.startsWith('preset-')) {
        const index = parseInt(id.split('-')[1])
        return placeholderQuestions[index]
      } else {
        const index = parseInt(id.split('-')[1])
        return customQuestions[index]
      }
    })
    console.log("Selected questions:", selectedQuestions)
    toast({
      title: "Success",
      description: "Your questions have been submitted successfully!",
    })
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-5xl font-bold mb-6 text-center">Select Questions</h1>
        <p className="text-2xl mb-8 text-center">
          Choose 1-3 questions from the options below or create your own. The order of selection matters. Once 3 are selected, the rest will be disabled.
        </p>
        <div className="flex flex-col space-y-4">
          {placeholderQuestions.map((question, index) => (
            <button
              key={`preset-${index}`}
              onClick={() => handleToggle(`preset-${index}`)}
              disabled={isDisabled(`preset-${index}`)}
              className={`w-full p-6 text-left border border-gray-700 rounded-md text-2xl relative ${
                selectedItems.includes(`preset-${index}`)
                  ? "bg-gray-800"
                  : "bg-black hover:bg-gray-900"
              } ${isDisabled(`preset-${index}`) ? "opacity-50 cursor-not-allowed" : ""}`}
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
              className={`w-full p-6 text-left border border-gray-700 rounded-md text-2xl relative ${
                selectedItems.includes(`custom-${index}`)
                  ? "bg-gray-800"
                  : "bg-black hover:bg-gray-900"
              } ${isDisabled(`custom-${index}`) ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Input
                type="text"
                placeholder="Enter your custom question"
                value={question}
                onChange={(e) => handleCustomQuestionChange(index, e.target.value)}
                disabled={isDisabled(`custom-${index}`)}
                className="w-full bg-transparent border-none focus:ring-0 p-0 text-2xl"
              />
              {selectedItems.includes(`custom-${index}`) && (
                <span className="absolute top-2 right-2 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center text-lg font-bold">
                  {getSelectionOrder(`custom-${index}`)}
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="text-xl mt-6 mb-4 text-gray-400 text-center">
          Custom questions are automatically selected when you start typing.
        </p>
        <div className="flex justify-center">
          <Button onClick={handleSubmit} className="mt-4 bg-white hover:bg-gray-200 text-black text-2xl py-6 px-12">
            Submit
          </Button>
        </div>
      </div>
    </div>
  )
}