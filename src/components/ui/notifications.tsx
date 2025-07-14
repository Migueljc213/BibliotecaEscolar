"use client";

import { useState, useEffect } from "react";
import { FiBell, FiX, FiCheck, FiAlertTriangle, FiInfo } from "react-icons/fi";

interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  icon?: string;
  timestamp: string;
  action?: string;
  bookCode?: string;
  bookTitle?: string;
}

interface NotificationProps {
  notification: Notification;
  onClose: (id: string) => void;
}

export function NotificationToast({
  notification,
  onClose,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(notification.id), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <FiCheck className="h-5 w-5 text-green-600" />;
      case "error":
        return <FiX className="h-5 w-5 text-red-600" />;
      case "warning":
        return <FiAlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <FiInfo className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white border rounded-lg shadow-lg transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      } ${getTypeStyles(notification.type)}`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {notification.icon ? (
              <span className="text-lg">{notification.icon}</span>
            ) : (
              getIcon(notification.type)
            )}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{notification.message}</p>
            <p className="text-xs opacity-75 mt-1">
              {new Date(notification.timestamp).toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onClose(notification.id), 300);
              }}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type NotificationListProps = {
  notifications: Notification[];
  unread: number;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const SHOW_NOTIFICATION_KEY = "showNotificationKey";
  useEffect(() => {
    async function fetchNotification() {
      try {
        //Busco os dados na api de notificatições
        const response = await fetch("/api/notifications?limit=5");
        //Verifico se a resposta é OK, se não for eu envio uma mensagem de error
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        //Transformo a resposta da api em um JSON
        const data: NotificationListProps = await response.json();
        //Busco dentro do localStorage todos os items com a shave SHOW_NOTIFICATION_KEY
        const showIdString = localStorage.getItem(SHOW_NOTIFICATION_KEY);

        //Se exister algum item nesta chave, eu transforma em um json, se não, envio uma array vazia
        const showIds = showIdString ? JSON.parse(showIdString) : [];

        //Transformo em um SET(Um tipo de array que evitar duplicidade e é eficiente na hora de fazer verificações se existe ou não o dado dentro do array)
        const showIdsSet = new Set(showIds);
        //Pego a resposta da notificações, uso o filter para encontrar a apenas as notificações que NÃO EXISTE dentro da lista do localStorage
        const newNotification = data.notifications.filter((not) => {
          return !showIdsSet.has(not.id);
        });
        //Dentro da lista que contem apenas notificações que não estao dentro do localStorage, eu pego apenas 3 items
        const notificationsToShowToast = newNotification.slice(0, 3);
        //Veririfico se realmente existe alguam novo notificação
        if (notificationsToShowToast.length > 0) {
          setUnreadCount(notificationsToShowToast.length);
          //Se existir, vou setar essa nova notificação no useState
          setNotifications(notificationsToShowToast);
          //Crio uma lista das noticações antigas que já tem dentro do localStora + as notificações que eu acabei de mostrar
          const newShowIds = [
            ...showIds,
            ...notificationsToShowToast.map((n) => n.id),
          ];
          //E guardo esta lista novamente no LocalStorage
          localStorage.setItem(
            SHOW_NOTIFICATION_KEY,
            JSON.stringify(newShowIds)
          );
        }
      } catch (e: any) {
        console.error("Não foi possivel buscar as notificações:", e.message);
      }
    }
    fetchNotification();
  }, []);

  const handleCloseNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <FiBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Notificações
            </h3>
            <p className="text-sm text-gray-500">{unreadCount} não lidas</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleCloseNotification(notification.id)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {notification.icon ? (
                        <span className="text-lg">{notification.icon}</span>
                      ) : (
                        <FiInfo className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.timestamp).toLocaleString(
                          "pt-BR"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-4 border-t">
              <button
                onClick={() => {
                  setNotifications([]);
                  setUnreadCount(0);
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Marcar todas como lidas
              </button>
            </div>
          )}
        </div>
      )}

      {/* Toast notifications */}
      {notifications.slice(0, 3).map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={handleCloseNotification}
        />
      ))}
    </div>
  );
}

// Hook para usar notificações em outros componentes
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp">
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return {
    notifications,
    addNotification,
    removeNotification,
  };
}
