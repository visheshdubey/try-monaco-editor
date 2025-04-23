import axios from "axios";
import { Judge0Response } from "../types";

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com";

// Status codes from Judge0 API
const STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR: 7,
  INTERNAL_ERROR: 8,
  EXEC_FORMAT_ERROR: 9,
};

const MAX_RETRIES = 10;
const RETRY_DELAY = 2000; // 2 seconds

export const submitCode = async (
  sourceCode: string,
  languageId: number,
  stdin: string
): Promise<Judge0Response> => {
  try {
    console.log(process.env.NEXT_PUBLIC_RAPIDAPI_KEY);
    // Submit the code
    const response = await axios.post(
      `${JUDGE0_API_URL}/submissions`,
      {
        source_code: sourceCode,
        language_id: languageId,
        stdin: stdin,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      }
    );

    const submissionId = response.data.token;
    let retries = 0;

    // Poll for the result with retries
    while (retries < MAX_RETRIES) {
      const result = await axios.get(
        `${JUDGE0_API_URL}/submissions/${submissionId}`,
        {
          headers: {
            "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
        }
      );

      const statusId = result.data.status.id;

      // If the submission is completed (either accepted or with an error)
      if (statusId !== STATUS.IN_QUEUE && statusId !== STATUS.PROCESSING) {
        return result.data;
      }

      // If still processing, wait and retry
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      retries++;
    }

    throw new Error("Submission timed out after maximum retries");
  } catch (error) {
    console.error("Error submitting code:", error);
    throw error;
  }
};
