import { useState, useEffect } from 'react';
import { EditableField } from './enxt-brain-app';
import { X, Check } from 'lucide-react';

export interface TaskData {
  id?: string; // present when editing an existing task
  title: string;
  description: string;
  dueDate: string;
  dueTime?: string;
  status: string;
  assignedEmployeeIds: string[];
}

interface TaskFormProps {
  employees: any[];
  onTaskCreated?: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  onShowToast?: (message: string, type: 'success' | 'error') => void;
  /** When provided, the modal opens in edit mode pre-filled with this task */
  editTask?: TaskData | null;
}

export default function TaskAssignmentModal({
  employees,
  onTaskCreated,
  open,
  setOpen,
  onShowToast,
  editTask,
}: TaskFormProps) {
  const isEditMode = Boolean(editTask?.id);

  const activeEmployees = employees.filter((emp) => {
    const status = emp.fields?.status || emp.status;
    return String(status).toLowerCase() === 'active';
  });

  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [status, setStatus] = useState('Pending');
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill fields when editTask changes
  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title || '');
      setDescription(editTask.description || '');
      // If the dueDate contains a time component (T), split it
      if (editTask.dueDate && editTask.dueDate.includes('T')) {
        const [datePart, timePart] = editTask.dueDate.split('T');
        setDueDate(datePart);
        setDueTime(timePart?.substring(0, 5) || '');
      } else {
        setDueDate(editTask.dueDate || '');
        setDueTime(editTask.dueTime || '');
      }
      setStatus(editTask.status || 'Pending');
      setSelectedEmployeeIds(editTask.assignedEmployeeIds || []);
    } else {
      reset();
    }
  }, [editTask, open]);

  const reset = () => {
    setSelectedEmployeeIds([]);
    setTitle('');
    setDescription('');
    setDueDate('');
    setDueTime('');
    setStatus('Pending');
  };

  const toggleEmployee = (id: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'No due date';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { onShowToast?.('Please enter a task title.', 'error'); return; }
    if (selectedEmployeeIds.length === 0) { onShowToast?.('Please select at least one employee.', 'error'); return; }

    setSubmitting(true);
    try {
      if (isEditMode && editTask?.id) {
        // ── EDIT MODE: PATCH existing task ──────────────────────────
        // Combine date + time into a single ISO-ish string
        const combinedDueDate = dueTime ? `${dueDate}T${dueTime}` : dueDate;
        const res = await fetch('/api/tasks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editTask.id,
            updates: { title, description, dueDate: combinedDueDate, dueTime, status, assignedEmployeeIds: selectedEmployeeIds },
          }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to update task');
        }
        onShowToast?.('✅ Task updated successfully!', 'success');
      } else {
        // ── CREATE MODE: POST new task ──────────────────────────────
        // Combine date + time into a single ISO-ish string
        const combinedDueDate = dueTime ? `${dueDate}T${dueTime}` : dueDate;
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title, description, dueDate: combinedDueDate, dueTime, status,
            assignedEmployeeIds: selectedEmployeeIds,
          }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to create task');
        }

        // Send WhatsApp notifications to each assignee
        const selectedEmployees = employees.filter((e) => selectedEmployeeIds.includes(e.id));
        const formattedDate = formatDate(dueDate);
        let notifSent = 0;
        let notifFailed = 0;

        for (const employee of selectedEmployees) {
          const phone = employee.fields?.phone;
          if (!phone) { notifFailed++; continue; }

          const timeStr = dueTime ? ` at ${dueTime}` : '';
          const message =
            `📋 *New Task Assigned*\n\n` +
            `Hi ${employee.fields?.name || employee.title || 'there'}!\n\n` +
            `*Title:* ${title}\n` +
            `*Description:* ${description || 'No description provided.'}\n` +
            `*Due Date:* ${formattedDate}${timeStr}\n` +
            `*Status:* ${status}`;

          try {
            const wRes = await fetch('/api/whatsapp/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ to: phone, body: message }),
            });
            if (wRes.ok) notifSent++; else notifFailed++;
          } catch { notifFailed++; }
        }

        if (notifSent > 0 && notifFailed === 0) {
          onShowToast?.(`✅ Task created! WhatsApp sent to ${notifSent} employee${notifSent > 1 ? 's' : ''}.`, 'success');
        } else if (notifSent > 0 && notifFailed > 0) {
          onShowToast?.(`Task created. WhatsApp sent to ${notifSent}, failed for ${notifFailed}.`, 'success');
        } else if (notifFailed > 0) {
          onShowToast?.('Task created but WhatsApp notifications failed.', 'error');
        } else {
          onShowToast?.('Task created successfully!', 'success');
        }
      }

      reset();
      setOpen(false);
      onTaskCreated?.();
    } catch (err: any) {
      console.error(err);
      onShowToast?.(err.message || (isEditMode ? 'Could not update task.' : 'Could not create task.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {open && (
        <div className="modal-backdrop" role="presentation">
          <div
            className="employee-edit-panel employee-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-label={isEditMode ? 'Edit task' : 'Assign new task'}
          >
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Task Manager</p>
                <h3>{isEditMode ? 'Edit Task' : 'Assign New Task'}</h3>
              </div>
              <button
                className="icon-button"
                onClick={() => { setOpen(false); reset(); }}
                title="Close"
                type="button"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="employee-edit-grid">
              <EditableField label="Title" value={title} onChange={setTitle} />
              <EditableField label="Description" value={description} onChange={setDescription} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', gridColumn: '1 / -1' }}>
                <label className="field-control" style={{ minWidth: 0 }}>
                  <span>Due Date</span>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </label>

                <label className="field-control" style={{ minWidth: 0 }}>
                  <span>Due Time</span>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    placeholder="e.g. 17:00"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </label>
              </div>

              <label className="field-control">
                <span>Status</span>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </label>

              {/* Multi-select employee checkboxes */}
              <div className="field-control" style={{ gridColumn: '1 / -1' }}>
                <span style={{ display: 'block', marginBottom: '10px', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>
                  Assign To {selectedEmployeeIds.length > 0 && (
                    <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: '999px', padding: '1px 8px', marginLeft: '6px', fontSize: '0.75rem' }}>
                      {selectedEmployeeIds.length}
                    </span>
                  )}
                </span>
                <div className="assignee-checkbox-list">
                  {activeEmployees.map((emp) => {
                    const isSelected = selectedEmployeeIds.includes(emp.id);
                    const name = emp.fields?.name || emp.title || emp.id;
                    return (
                      <button
                        key={emp.id}
                        type="button"
                        className={`assignee-checkbox-item${isSelected ? ' selected' : ''}`}
                        onClick={() => toggleEmployee(emp.id)}
                        aria-pressed={isSelected}
                      >
                        <span className="assignee-avatar">{name.charAt(0).toUpperCase()}</span>
                        <span className="assignee-name">{name}</span>
                        {isSelected && (
                          <span className="assignee-check"><Check size={13} /></span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected pills summary */}
                {selectedEmployeeIds.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                    {selectedEmployeeIds.map((id) => {
                      const emp = employees.find((e) => e.id === id);
                      const name = emp?.fields?.name || emp?.title || id;
                      return (
                        <span key={id} className="assignee-pill">
                          {name}
                          <button
                            type="button"
                            onClick={() => toggleEmployee(id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 4px', color: 'inherit', lineHeight: 1 }}
                            aria-label={`Remove ${name}`}
                          >×</button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="panel-footer">
              <button
                className="secondary-button"
                onClick={() => { setOpen(false); reset(); }}
                type="button"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="primary-button"
                type="submit"
                onClick={submit}
                disabled={submitting}
                style={{ opacity: submitting ? 0.7 : 1 }}
              >
                {submitting
                  ? (isEditMode ? 'Saving…' : 'Creating…')
                  : isEditMode
                    ? 'Save Changes'
                    : `Create Task${selectedEmployeeIds.length > 1 ? ` & Notify ${selectedEmployeeIds.length}` : ''}`
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
