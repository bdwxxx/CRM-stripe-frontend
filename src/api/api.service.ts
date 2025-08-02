const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

if (!API_BASE_URL) {
  // ИСПРАВЛЕНО: Сообщение об ошибке соответствует переменной
  throw new Error('VITE_API_BASE_URL is not defined in your .env file');
}

// --- Функции для управления воркерами ---

// GET /admin/workers
export const getWorkers = async () => {
  // ИСПРАВЛЕНО: Добавлен /workers
  const response = await fetch(`${API_BASE_URL}/admin/workers`);
  if (!response.ok) {
    throw new Error('Не удалось загрузить список воркеров');
  }
  return response.json();
};

// POST /admin/workers
export const createWorker = async (data: {
  accountId: string;
  friendlyName: string;
  workerUrl: string;
  dailyLimit: number;
  stripeApiKey: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/admin/workers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Не удалось создать воркер');
  }
  return response.json();
};

// POST /admin/workers/:accountId/limit
export const updateWorkerLimit = async (accountId: string, dailyLimit: number) => {
    const response = await fetch(`${API_BASE_URL}/admin/workers/${accountId}/limit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyLimit })
    });
    if (!response.ok) {
        throw new Error('Не удалось обновить лимит');
    }
    return response.json();
};

// DELETE /admin/workers/:accountId
export const deleteWorker = async (accountId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/workers/${accountId}`, {
        method: 'DELETE',
    });
    // ИСПРАВЛЕНО: Более надежная проверка статуса
    if (!response.ok && response.status !== 204) {
        throw new Error('Не удалось удалить воркер');
    }
    return { status: response.status };
};

// --- Функции для получения статистики ---

// GET /admin/workers/transferred-invoices
export const getTransferredInvoices = async () => {
    // Этот URL теперь правильный
    const response = await fetch(`${API_BASE_URL}/admin/workers/transferred-invoices`);
    if (!response.ok) {
        throw new Error('Не удалось загрузить историю переносов');
    }
    return response.json();
}