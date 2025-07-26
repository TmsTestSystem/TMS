export interface ApiError {
  error?: string;
  details?: string;
  message?: string;
}

export const getErrorMessage = (error: any): string => {
  // Если это объект с полем error
  if (error && typeof error === 'object') {
    if (error.error) return error.error;
    if (error.details) return error.details;
    if (error.message) return error.message;
  }
  
  // Если это строка
  if (typeof error === 'string') {
    return error;
  }
  
  // Если это Error объект
  if (error instanceof Error) {
    return error.message;
  }
  
  // По умолчанию
  return 'Произошла неизвестная ошибка';
};

export const handleApiError = async (response: Response): Promise<string> => {
  try {
    const errorData = await response.json();
    return getErrorMessage(errorData);
  } catch {
    // Если не удалось распарсить JSON, возвращаем статус ошибки
    return `Ошибка ${response.status}: ${response.statusText}`;
  }
}; 