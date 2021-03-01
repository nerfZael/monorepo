import { spawn } from "child_process";

const run = (
  command: string,
  args: string[],
  projectRoot: string,
  errorHandler: jest.Mock
): Promise<{
  code: number | null;
  output: string;
}> => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: projectRoot });

    let mergedOut = "";

    if (child.stdout) {
      child.stdout.setEncoding("utf8");
      child.stdout.on("data", (data) => {
        process.stdout.write(data, (_err) => {});
        mergedOut += data;
      });
    }

    if (child.stderr) {
      child.stderr.setEncoding("utf8");
      child.stderr.on("data", errorHandler);
    }

    child
      .on("close", (code) => {
        resolve({
          code,
          output: mergedOut,
        });
      })
      .on("error", (err) => {
        errorHandler();
        reject(err);
      });
  });
};

export default run;
