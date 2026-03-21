import { useState, useEffect, useCallback } from 'react';

import { useSDK } from '../context/SDKProvider';
import type { ScheduledTask, CreateTaskPayload, UpdateTaskPayload } from '../../core/types';

export interface UseSchedulerReturn {
  tasks: ScheduledTask[];
  register: (task: CreateTaskPayload) => Promise<ScheduledTask>;
  trigger: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
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

  const trigger = useCallback(
    async (id: string): Promise<void> => {
      // Trigger is an update that forces immediate execution
      await sdk.scheduler.update(id, {});
      await refresh();
    },
    [sdk, refresh],
  );

  const remove = useCallback(
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

  return { tasks, register, trigger, remove, update, refresh };
}
