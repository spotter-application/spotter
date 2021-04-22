import { BehaviorSubject, Observable } from 'rxjs';
import { SpotterState } from '../core';

export class State implements SpotterState {

  private valueSubject$ = new BehaviorSubject<string>('');

  get value$(): Observable<string> {
    return this.valueSubject$.asObservable();
  }

  get value(): string {
    return this.valueSubject$.getValue();
  }

  setValue(value: string) {
    this.valueSubject$.next(value);
  }

}

