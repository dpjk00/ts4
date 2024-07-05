// NotificationService.ts
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { PriorityMongo } from './StoryMongo';
import { MongoClient, ObjectId } from 'mongodb';

type ISOString = string;

export type Notification = {
  title: string;
  message: string;
  date: ISOString;
  priority: PriorityMongo;
  read: boolean;
};

class NotificationService {
  private notificationsSubject: BehaviorSubject<Notification[]> = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  send(notification: Notification): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);
    this.update_unread_count();
  }

  delete(index: number): void {
    const currentNotifications = this.notificationsSubject.value;
    if (currentNotifications[index]) {
      currentNotifications.splice(index, 1);
      this.notificationsSubject.next([...currentNotifications]);
      this.update_unread_count();
    }
  }

  list(): Observable<Notification[]> {
    return this.notificationsSubject.asObservable();
  }

  unread_count(): Observable<number> {
    return this.unreadCountSubject.asObservable();
  }

  private update_unread_count(): void {
    const unreadCount = this.notificationsSubject.value.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  mark_as_read(index: number): void {
    const notifications = this.notificationsSubject.value;
    if (notifications[index]) {
      notifications[index].read = true;
      this.notificationsSubject.next([...notifications]);
      this.update_unread_count();
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;
