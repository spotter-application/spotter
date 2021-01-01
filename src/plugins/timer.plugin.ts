import { SpotterOption, SpotterPlugin, SpotterPluginLifecycle } from '../core/shared';

interface Time {
  hours: number;
  minutes: number;
  seconds: number;
}

export class Timer extends SpotterPlugin implements SpotterPluginLifecycle {

  timer: NodeJS.Timeout | null = null;

  presets: SpotterOption[] = [
    {
      title: 't 15m',
      subtitle: 'Set a timer for a 15 minutes',
      action: () => this.setTimer(900),
      image: '',
    }
  ];

  onQuery(query: string): SpotterOption[] {
    const [prefix, ...timerQueryArray] = query.split(' ');
    const timerQuery = timerQueryArray.join(' ');

    if (prefix.toLowerCase() !== 't') {
      return [];
    }

    if (!timerQuery) {
      return this.presets;
    }

    const time = this.parseTimeQuery(timerQuery);
    const timeSubtile = this.getSubtitle(time);
    const seconds = this.getSeconds(time);

    return [{
      title: `t ${timerQuery}`,
      subtitle: `Set a timer for ${timeSubtile}`,
      action: () => this.setTimer(seconds),
      image: '',
    }];
  }

  private setTimer(seconds: number) {
    let counter = seconds;
    this.resetTimer();

    this.timer = setInterval(() => {
      if (!counter) {
        this.resetTimer();
        this.nativeModules.notifications.show('Complete', `Timer for ${seconds} seconds has been completed`)
        this.nativeModules.statusBar.changeTitle('');
        return;
      }

      this.nativeModules.statusBar.changeTitle(`${counter--}`)
    }, 1000)
  }

  private resetTimer() {
    if (!this.timer) {
      return;
    }
    clearInterval(this.timer)
  }

  private getSubtitle(time: Time): string {
    const timeLabel = time.hours
      ? `${time.hours} hour(s)`
      : time.minutes
        ? `${time.minutes} minute(s)`
        : time.seconds
          ? `${time.seconds} second(s)`
          : '';

    return timeLabel;
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

}
