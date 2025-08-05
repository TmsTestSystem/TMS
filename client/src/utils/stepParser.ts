// Функция для умного парсинга шагов тест-кейсов
export const parseStepsIntelligently = (stepsText: string): string[] => {
  const lines = stepsText.split(/\n|\r/).filter(line => line.trim());
  const steps: string[] = [];
  let currentStep = '';
  let inMultiLineBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Проверяем, начинается ли строка с цифры и точки (новый шаг)
    const isNewStep = /^\d+\.\s*/.test(line);
    
    // Проверяем, является ли строка частью многострочного блока (SQL, код и т.д.)
    const isMultiLineStart = /^(CREATE|INSERT|UPDATE|DELETE|SELECT|DROP|ALTER|BEGIN|END|IF|ELSE|FOR|WHILE|FUNCTION|PROCEDURE)/i.test(line);
    const isMultiLineContinuation = /^(\s*[a-zA-Z0-9_]+|,|\(|\)|;|\+|-|\*|\/|=|>|<|>=|<=|!=|AND|OR|INTO|FROM|WHERE|GROUP|ORDER|HAVING|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|CASE|WHEN|THEN|ELSE|END)/i.test(line);
    
    if (isNewStep && !inMultiLineBlock) {
      // Сохраняем предыдущий шаг, если он есть
      if (currentStep.trim()) {
        steps.push(currentStep.trim());
      }
      // Начинаем новый шаг
      currentStep = line.replace(/^\d+\.\s*/, '');
      inMultiLineBlock = isMultiLineStart;
    } else if (isMultiLineStart && !inMultiLineBlock) {
      // Начинается многострочный блок
      if (currentStep.trim()) {
        steps.push(currentStep.trim());
      }
      currentStep = line;
      inMultiLineBlock = true;
    } else if (inMultiLineBlock && (isMultiLineContinuation || line.includes(';') || line.includes(')') || line.includes('}'))) {
      // Продолжение многострочного блока
      currentStep += '\n' + line;
      if (line.includes(';') || line.includes(')') || line.includes('}')) {
        inMultiLineBlock = false;
      }
    } else if (inMultiLineBlock) {
      // Продолжение многострочного блока
      currentStep += '\n' + line;
    } else {
      // Обычная строка
      if (currentStep.trim()) {
        currentStep += '\n' + line;
      } else {
        currentStep = line;
      }
    }
  }
  
  // Добавляем последний шаг
  if (currentStep.trim()) {
    steps.push(currentStep.trim());
  }
  
  return steps;
}; 