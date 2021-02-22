import { SpotterOption, SpotterPlugin, SpotterPluginLifecycle } from '../../core';
import icon from './icon.png';

interface Time {
  hours: number;
  minutes: number;
  seconds: number;
}

export class TimerPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  identifier = 'Timer';

  timer: NodeJS.Timeout | null = null;

  onQuery(query: string): SpotterOption[] {
    const startsWithNumber = /^\d/.test(query);

    if (!startsWithNumber) {
      return [];
    }

    const time = this.parseTimeQuery(query);

    if (!time.hours && !time.minutes && !time.seconds) {
      return [];
    }

    const seconds = this.getSeconds(time);
    const stringTime = this.getStringTime(time);

    return [{
      title: `${stringTime}`,
      subtitle: `Set a timer for ${stringTime}`,
      action: () => this.setTimer(seconds, stringTime),
      icon,
    }];
  }

  private setTimer(seconds: number, stringTime: string) {
    const startSeconds = Math.round(+new Date()/1000)
    const endSeconds = startSeconds + seconds;

    this.resetTimer();

    this.timer = setInterval(() => {
      const currentSeconds = Math.round(+new Date()/1000);
      const secondsLeft = endSeconds - currentSeconds;

      if (!secondsLeft) {
        this.resetTimer();
        this.nativeModules.notifications.show('Complete', `Timer for ${stringTime} has been completed`);
        this.nativeModules.statusBar.changeTitle('');
        return;
      }

      this.nativeModules.statusBar.changeTitle(`${this.getStringISOTime(secondsLeft)}`);
    }, 1000)
  }

  private resetTimer() {
    if (!this.timer) {
      return;
    }
    clearInterval(this.timer)
  }

  private parseTimeQuery(timeQuery: string): Time {
    const hours = timeQuery.match(/(\d+)\s*h/);
    const minutes = timeQuery.match(/(\d+)\s*m/);
    const seconds = timeQuery.match(/(\d+)\s*s/);

    if (!hours && !minutes && !seconds && /^\d+$/.test(timeQuery)) {
      return { hours: 0, minutes: parseInt(timeQuery), seconds: 0 };
    }

    return {
      hours: hours ? parseInt(hours[1]) : 0,
      minutes: minutes ? parseInt(minutes[1]) : 0,
      seconds: seconds ? parseInt(seconds[1]) : 0,
    };
  }

  private getSeconds(time: Time): number {
    let seconds = time.seconds ?? 0;
    if (time.hours) { seconds += time.hours * 3600; }
    if (time.minutes) { seconds += time.minutes * 60; }
    return seconds;
  }

  private getStringTime(time: Time): string {
    const hours = time.hours ? `${time.hours}h` : '';
    const minutes = time.minutes ? `${time.minutes}m` : '';
    const seconds = time.seconds ? `${time.seconds}s` : '';
    return `${hours}${minutes}${seconds}`;
  }

  private getStringISOTime(seconds: number): string {
    return new Date(seconds * 1000).toISOString().substr(11, 8);
  }

}
