"use client";

import { useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

const tasks = [
  { value: 'search', label: 'Async search' },
  { value: 'pagination', label: 'Pagination' },
  { value: 'cache', label: 'Authorization and cache' },
  { value: 'bullmq', label: 'BullMQ worker recovery' },
];

export default function BenchmarkTaskSelect() {
  const [task, setTask] = useState('search');

  function selectTask(value) {
    if (!tasks.some(item => item.value === value)) return;
    setTask(value);
    document.dispatchEvent(new CustomEvent('handwork:benchmark-task', { detail: value }));
  }

  return (
    <div className="benchmark-task">
      <label id="task-select-label" htmlFor="task-select">Task</label>
      <div className="benchmark-task-picker">
        <Select value={task} onValueChange={selectTask} items={tasks}>
          <SelectTrigger id="task-select" className="w-full min-h-11" aria-labelledby="task-select-label task-select-value">
            <SelectValue id="task-select-value" />
          </SelectTrigger>
          <SelectContent id="task-options" aria-labelledby="task-select-label">
            {tasks.map(item => (
              <SelectItem key={item.value} value={item.value} className="min-h-11">{item.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
