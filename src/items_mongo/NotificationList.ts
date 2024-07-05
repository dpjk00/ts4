// NotificationsList.tsx
import React, { useState, useEffect, ChangeEvent } from 'react';
import { Notification }  from './NotificationService';
import notificationService from './NotificationService'

const NotificationsList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const subscription = notificationService.list().subscribe(setNotifications);
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div></div>
  );
};

export default NotificationsList;
