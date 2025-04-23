"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { INITIAL_PROBLEM, SUPPORTED_LANGUAGES } from "./constants";
import { Language, Judge0Response } from "./types";
import { submitCode } from "./services/judge0";

const TEST_CASES = [
  {
    input: "[2,7,11,15]\n9",
    expectedOutput: "[0,1]",
  },
  {
    input: "[3,2,4]\n6",
    expectedOutput: "[1,2]",
  },
  {
    input: "[3,3]\n6",
    expectedOutput: "[0,1]",
  },
];

const normalizeOutput = (output: string | null | undefined): string => {
  if (!output) return "";
  return output
    .trim()
    .replace(/\s+/g, "") // Remove all whitespace
    .replace(/,/g, ",") // Ensure consistent comma formatting
    .toLowerCase();
};

const getStatusColor = (
  status: Judge0Response | null,
  expectedOutput: string
) => {
  if (!status) return "bg-gray-100 text-gray-800";

  const statusId = status.status.id;

  // If the submission was successful (status 3) but output doesn't match expected
  if (
    statusId === 3 &&
    normalizeOutput(status.stdout) !== normalizeOutput(expectedOutput)
  ) {
    return "bg-red-100 text-red-800"; // Wrong Answer
  }

  if (statusId === 3) return "bg-green-100 text-green-800";
  if (statusId === 4) return "bg-red-100 text-red-800"; // Wrong Answer
  if (statusId === 5) return "bg-yellow-100 text-yellow-800"; // Time Limit Exceeded
  if (statusId === 6) return "bg-red-100 text-red-800"; // Compilation Error
  if (statusId === 7) return "bg-red-100 text-red-800"; // Runtime Error
  if (statusId === 8) return "bg-red-100 text-red-800"; // Internal Error
  if (statusId === 9) return "bg-red-100 text-red-800"; // Exec Format Error
  return "bg-gray-100 text-gray-800";
};

const getStatusMessage = (
  status: Judge0Response | null,
  expectedOutput: string
) => {
  if (!status) return "Error";

  // If the submission was successful but output doesn't match expected
  if (
    status.status.id === 3 &&
    normalizeOutput(status.stdout) !== normalizeOutput(expectedOutput)
  ) {
    return `Wrong Answer\nExpected: ${expectedOutput}\nGot: ${status.stdout?.trim()}`;
  }

  if (status.compile_output) return status.compile_output;
  if (status.stderr) return status.stderr;
  if (status.stdout) return status.stdout;
  if (status.message) return status.message;

  return "No output";
};

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    SUPPORTED_LANGUAGES[0]
  );
  const [code, setCode] = useState(
    INITIAL_PROBLEM.initialCode[selectedLanguage.value]
  );
  const [results, setResults] = useState<(Judge0Response | null)[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = SUPPORTED_LANGUAGES.find(
      (lang) => lang.value === e.target.value
    );
    if (newLanguage) {
      setSelectedLanguage(newLanguage);
      setCode(INITIAL_PROBLEM.initialCode[newLanguage.value]);
      setResults([]);
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    const newResults: (Judge0Response | null)[] = [];

    for (const testCase of TEST_CASES) {
      try {
        const result = await submitCode(
          code,
          selectedLanguage.id,
          testCase.input
        );
        newResults.push(result);
      } catch (error) {
        console.error("Error running test case:", error);
        newResults.push(null);
      }
    }

    setResults(newResults);
    setIsRunning(false);
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{INITIAL_PROBLEM.title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Problem Description */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="whitespace-pre-line">
                {INITIAL_PROBLEM.description}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Constraints</h2>
              <ul className="list-disc pl-6 space-y-2">
                {INITIAL_PROBLEM.constraints.map((constraint, index) => (
                  <li key={index}>{constraint}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Test Cases</h2>
              <div className="space-y-4">
                {TEST_CASES.map((testCase, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="mb-2">
                      <span className="font-semibold">Input:</span>
                      <pre className="mt-1 bg-gray-100 p-2 rounded">
                        {testCase.input}
                      </pre>
                    </div>
                    <div>
                      <span className="font-semibold">Expected Output:</span>
                      <pre className="mt-1 bg-gray-100 p-2 rounded">
                        {testCase.expectedOutput}
                      </pre>
                    </div>
                    {results[index] && (
                      <div className="mt-2">
                        <span className="font-semibold">Result:</span>
                        <pre
                          className={`mt-1 p-2 rounded ${getStatusColor(
                            results[index],
                            testCase.expectedOutput
                          )}`}
                        >
                          {getStatusMessage(
                            results[index],
                            testCase.expectedOutput
                          )}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <select
                value={selectedLanguage.value}
                onChange={handleLanguageChange}
                className="px-4 py-2 border rounded-md"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.value}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="h-[600px]">
              <Editor
                height="100%"
                defaultLanguage={selectedLanguage.value}
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                }}
              />
            </div>
            <div className="p-4 border-t">
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className={`px-6 py-2 rounded-md ${
                  isRunning
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                {isRunning ? "Running..." : "Run Code"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
