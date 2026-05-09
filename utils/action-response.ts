export function actionError(message: string, fieldErrors?: Record<string, string[]>) {
  return {
    success: false,
    message,
    fieldErrors,
  };
}

export function actionSuccess(message: string, extra?: Record<string, unknown>) {
  return {
    success: true,
    message,
    ...extra,
  };
}
