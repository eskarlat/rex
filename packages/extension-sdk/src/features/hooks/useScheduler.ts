import { useState, useEffect, useCallback } from 'react';
import { useSDK } from '../context/SDKProvider';
import type {
  ScheduledTask,
  CreateTaskPayload,
  UpdateTaskPayload,
} from '../../core/types';

export interface UseSchedulerReturn {
  tasks: ScheduledTask[];
  register: (task: CreateTaskPayload) => Promise<ScheduledTask>;
  unregister: (id: string) => Promise<void>;
  update: (id: string, payload: UpdateTaskPayload) => Promise<ScheduledTask>;
  refresh: () => Promise<void>;
}

export function useScheduler(): UseSchedulerReturn {
  const sdk = useSDK();
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);

  const refresh = useCallback(async (): Promise<void> => {
    const list = await sdk.scheduler.list();
    setTasks(list);
  }, [sdk]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const register = useCallback(
    async (task: CreateTaskPayload): Promise<ScheduledTask> => {
      const created = await sdk.scheduler.register(task);
      await refresh();
      return created;
    },
    [sdk, refresh],
  );

  const unregister = useCallback(
    async (id: string): Promise<void> => {
      await sdk.scheduler.unregister(id);
      await refresh();
    },
    [sdk, refresh],
  );

  const update = useCallback(
    async (id: string, payload: UpdateTaskPayload): Promise<ScheduledTask> => {
      const updated = await sdk.scheduler.update(id, payload);
      await refresh();
      return updated;
    },
    [sdk, refresh],
  );

  return { tasks, register, unregister, update, refresh };
}
