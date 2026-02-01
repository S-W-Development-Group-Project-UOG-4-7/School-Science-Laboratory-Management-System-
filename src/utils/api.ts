export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}

async function parseJsonSafe(res: Response) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  return null;
}

export async function get<T = any>(url: string): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, { method: 'GET' });
    const body = await parseJsonSafe(res);
    if (!res.ok) {
      return { success: false, message: body?.message || res.statusText, error: body };
    }
    return { success: true, data: body };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error', error: err };
  }
}

export async function post<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const parsed = await parseJsonSafe(res);
    if (!res.ok) {
      return { success: false, message: parsed?.message || res.statusText, error: parsed };
    }
    return { success: true, data: parsed };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error', error: err };
  }
}

export default { get, post };
