import { Event } from './event';

export interface Task {
  id?: number;
  title: string;
  description: string;
  completed: boolean;
  event?: Pick<Event, 'id'> | Event;
}