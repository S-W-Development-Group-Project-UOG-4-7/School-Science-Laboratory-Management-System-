type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};

export async function get<T = any>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Request failed',
        error: data.error,
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Network error occurred',
      error: error.message,
    };
  }
}

export async function post<T = any>(
  url: string,
  body: any
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Request failed',
        error: data.error,
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Network error occurred',
      error: error.message,
    };
  }
}

