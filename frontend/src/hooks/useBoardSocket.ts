import { useEffect, useRef } from 'react';
import { getSocket } from '../api/socket';
import type { PresenceUser, Task } from '../types';

interface BoardSocketHandlers {
  onTaskCreated: (task: Task) => void;
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (id: number) => void;
  onTaskReordered: (taskIds: number[]) => void;
  onPresence: (users: PresenceUser[]) => void;
}

export const useBoardSocket = (
  projectId: number | null,
  handlers: BoardSocketHandlers,
) => {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (projectId === null) return;

    const socket = getSocket();
    socket.connect();
    socket.emit('joinBoard', { projectId });

    const handleTaskCreated = (task: Task) =>
      handlersRef.current.onTaskCreated(task);
    const handleTaskUpdated = (task: Task) =>
      handlersRef.current.onTaskUpdated(task);
    const handleTaskDeleted = ({ id }: { id: number }) =>
      handlersRef.current.onTaskDeleted(id);
    const handleTaskReordered = ({ taskIds }: { taskIds: number[] }) =>
      handlersRef.current.onTaskReordered(taskIds);
    const handlePresence = ({ users }: { users: PresenceUser[] }) =>
      handlersRef.current.onPresence(users);

    socket.on('task.created', handleTaskCreated);
    socket.on('task.updated', handleTaskUpdated);
    socket.on('task.deleted', handleTaskDeleted);
    socket.on('task.reordered', handleTaskReordered);
    socket.on('board.presence', handlePresence);

    return () => {
      socket.emit('leaveBoard', { projectId });
      socket.off('task.created', handleTaskCreated);
      socket.off('task.updated', handleTaskUpdated);
      socket.off('task.deleted', handleTaskDeleted);
      socket.off('task.reordered', handleTaskReordered);
      socket.off('board.presence', handlePresence);
      socket.disconnect();
    };
  }, [projectId]);
};
