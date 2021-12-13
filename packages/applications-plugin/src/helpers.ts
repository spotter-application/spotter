import { PREFERENCES } from './constants';
import { Application } from './interfaces';
import { exec } from 'child_process';

export const getAllApplications = async (): Promise<Application[]> => {

  const paths: string[] = (await execPromise('mdfind -onlyin /Applications -onlyin $HOME  kMDItemContentTypeTree=com.apple.application-bundle')).split('\n');

  const applications: Application[] = paths.map((p) => {
    return {
      path: p,
      title: p.substring(p.lastIndexOf('/') + 1)
    }
  })

  return [
    ...applications,
    ...PREFERENCES,
    {
      title: 'Finder',
      path: '/System/Library/CoreServices/Finder.app',
    }
  ];
}

export function execPromise(command: string): Promise<string> {
  return new Promise(function(resolve, reject) {
    exec(command, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(stdout.trim());
    });
  });
}
