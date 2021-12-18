import { OnQueryOption } from "@spotter-app/core";
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

export const onQueryFilter = (
  query: string,
  options: OnQueryOption[]
): OnQueryOption[] => {
  if (!query?.length) {
    return options;
  }

  const lowerCasedQuery = query.toLowerCase();
  return options.filter(o =>
    o.title.toLowerCase().split(' ').find(t => t.startsWith(lowerCasedQuery))
  );
}
