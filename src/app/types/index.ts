export interface Problem {
  id: string;
  title: string;
  description: string;
  constraints: string[];
  initialCode: {
    [key: string]: string;
  };
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface Language {
  id: number;
  name: string;
  value: string;
}

export interface Judge0Response {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
}
