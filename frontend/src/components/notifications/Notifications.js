import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.read).length);
    } catch (err) {
      setError('Failed to fetch notifications');
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8080/api/notifications/${notificationId}/read`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:8080/api/notifications/read-all',
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (err) {
      setError('Failed to mark all notifications as read');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'FOLLOW':
        return 'fas fa-user-plus';
      case 'QUIZ_COMPLETED':
        return 'fas fa-check-circle';
      case 'SKILL_ADDED':
        return 'fas fa-plus-circle';
      case 'QUIZ_RESULT':
        return 'fas fa-chart-bar';
      default:
        return 'fas fa-bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'FOLLOW':
        return 'primary';
      case 'QUIZ_COMPLETED':
        return 'success';
      case 'SKILL_ADDED':
        return 'info';
      case 'QUIZ_RESULT':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else {
      return `${days} day${days === 1 ? '' : 's'} ago`;
    }
  };

  return (
    <Container>
      <Row className="mt-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Notifications</h1>
            {unreadCount > 0 && (
              <Button variant="outline-primary" onClick={markAllAsRead}>
                Mark All as Read
              </Button>
            )}
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          {notifications.length === 0 ? (
            <Card>
              <Card.Body className="text-center">
                <p className="text-muted">No notifications yet</p>
              </Card.Body>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card key={notification.id} className="mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <i
                        className={`${getNotificationIcon(notification.type)} fa-2x me-3 text-${getNotificationColor(
                          notification.type
                        )}`}
                      />
                      <div>
                        <h5 className="mb-1">{notification.title}</h5>
                        <p className="mb-0 text-muted">{notification.message}</p>
                        <small className="text-muted">
                          {formatDate(notification.createdAt)}
                        </small>
                      </div>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Notifications; 