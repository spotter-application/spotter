import { exec } from "node:child_process";

export const promisedExec = (command: string) => {
	return new Promise<string>((res, rej) => {
    exec(command, (err, result) => {
      if (err) {
        rej(err);
        return;
      }

      res(result);
    });
  });
}
