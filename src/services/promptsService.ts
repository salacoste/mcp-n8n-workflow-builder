import { Prompt, PromptVariable } from '../types/prompts';

// Определяем константы для ID промтов
export const PROMPT_IDS = {
  SCHEDULE_WORKFLOW: 'schedule-workflow',
  HTTP_WEBHOOK_WORKFLOW: 'http-webhook-workflow',
  DATA_TRANSFORMATION_WORKFLOW: 'data-transformation-workflow',
  INTEGRATION_WORKFLOW: 'integration-workflow'
};

// Промт для создания рабочего процесса с триггером по расписанию
export const scheduleWorkflowPrompt: Prompt = {
  id: PROMPT_IDS.SCHEDULE_WORKFLOW,
  name: 'Schedule Triggered Workflow',
  description: 'Create a workflow that runs on a schedule',
  template: {
    name: '{workflow_name}',
    nodes: [
      {
        name: 'Schedule Trigger',
        type: 'n8n-nodes-base.cron',
        parameters: {
          rule: '{schedule_expression}',
          additionalParameters: {
            timezone: 'UTC'
          }
        }
      },
      {
        name: 'Code Script',
        type: 'n8n-nodes-base.code',
        parameters: {
          jsCode: 'return {\n  timestamp: new Date().toISOString(),\n  message: "{workflow_message}",\n  executionId: $execution.id\n};'
        }
      }
    ],
    connections: [
      {
        source: 'Schedule Trigger',
        target: 'Code Script'
      }
    ]
  },
  variables: [
    {
      name: 'workflow_name',
      description: 'Name of the workflow',
      defaultValue: 'Scheduled Workflow',
      required: true
    },
    {
      name: 'schedule_expression',
      description: 'Cron expression for schedule (e.g. */5 * * * * for every 5 minutes)',
      defaultValue: '*/5 * * * *',
      required: true
    },
    {
      name: 'workflow_message',
      description: 'Message to include in the workflow execution',
      defaultValue: 'Scheduled execution triggered',
      required: false
    }
  ]
};

// Промт для создания рабочего процесса с HTTP вебхуком
export const httpWebhookWorkflowPrompt: Prompt = {
  id: PROMPT_IDS.HTTP_WEBHOOK_WORKFLOW,
  name: 'HTTP Webhook Workflow',
  description: 'Create a workflow that responds to HTTP webhook requests',
  template: {
    name: '{workflow_name}',
    nodes: [
      {
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        parameters: {
          httpMethod: 'POST',
          path: '{webhook_path}',
          options: {
            responseMode: 'lastNode'
          }
        }
      },
      {
        name: 'Process Data',
        type: 'n8n-nodes-base.code',
        parameters: {
          jsCode: 'const data = $input.first().json;\n\nreturn {\n  processed: true,\n  timestamp: new Date().toISOString(),\n  data,\n  message: "{response_message}"\n};'
        }
      }
    ],
    connections: [
      {
        source: 'Webhook',
        target: 'Process Data'
      }
    ]
  },
  variables: [
    {
      name: 'workflow_name',
      description: 'Name of the workflow',
      defaultValue: 'Webhook Workflow',
      required: true
    },
    {
      name: 'webhook_path',
      description: 'Path for the webhook (e.g. "my-webhook")',
      defaultValue: 'my-webhook',
      required: true
    },
    {
      name: 'response_message',
      description: 'Message to include in the response',
      defaultValue: 'Webhook processed successfully',
      required: false
    }
  ]
};

// Промт для создания рабочего процесса трансформации данных
export const dataTransformationWorkflowPrompt: Prompt = {
  id: PROMPT_IDS.DATA_TRANSFORMATION_WORKFLOW,
  name: 'Data Transformation Workflow',
  description: 'Create a workflow for processing and transforming data',
  template: {
    name: '{workflow_name}',
    nodes: [
      {
        name: 'Manual Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        parameters: {}
      },
      {
        name: 'Input Data',
        type: 'n8n-nodes-base.set',
        parameters: {
          values: [
            {
              name: 'data',
              value: '{sample_data}',
              type: 'json'
            }
          ],
          options: {
            dotNotation: true
          }
        }
      },
      {
        name: 'Transform Data',
        type: 'n8n-nodes-base.code',
        parameters: {
          jsCode: 'const data = $input.first().json.data;\n\n// Apply transformation\n{transformation_code}\n\nreturn { result: data };'
        }
      }
    ],
    connections: [
      {
        source: 'Manual Trigger',
        target: 'Input Data'
      },
      {
        source: 'Input Data',
        target: 'Transform Data'
      }
    ]
  },
  variables: [
    {
      name: 'workflow_name',
      description: 'Name of the workflow',
      defaultValue: 'Data Transformation Workflow',
      required: true
    },
    {
      name: 'sample_data',
      description: 'Sample JSON data to transform',
      defaultValue: '{"items": [{"id": 1, "name": "Item 1"}, {"id": 2, "name": "Item 2"}]}',
      required: true
    },
    {
      name: 'transformation_code',
      description: 'JavaScript code for data transformation',
      defaultValue: '// Example: Add a processed flag to each item\ndata.items = data.items.map(item => ({\n  ...item,\n  processed: true,\n  processedAt: new Date().toISOString()\n}));',
      required: true
    }
  ]
};

// Промт для создания рабочего процесса интеграции
export const integrationWorkflowPrompt: Prompt = {
  id: PROMPT_IDS.INTEGRATION_WORKFLOW,
  name: 'External Service Integration Workflow',
  description: 'Create a workflow that integrates with external services',
  template: {
    name: '{workflow_name}',
    nodes: [
      {
        name: 'Schedule Trigger',
        type: 'n8n-nodes-base.cron',
        parameters: {
          rule: '{schedule_expression}',
          additionalParameters: {
            timezone: 'UTC'
          }
        }
      },
      {
        name: 'HTTP Request',
        type: 'n8n-nodes-base.httpRequest',
        parameters: {
          url: '{api_url}',
          method: 'GET',
          authentication: 'none',
          options: {}
        }
      },
      {
        name: 'Process Response',
        type: 'n8n-nodes-base.code',
        parameters: {
          jsCode: 'const data = $input.first().json;\n\n// Process the API response\n{processing_code}\n\nreturn { result: data };'
        }
      }
    ],
    connections: [
      {
        source: 'Schedule Trigger',
        target: 'HTTP Request'
      },
      {
        source: 'HTTP Request',
        target: 'Process Response'
      }
    ]
  },
  variables: [
    {
      name: 'workflow_name',
      description: 'Name of the workflow',
      defaultValue: 'External API Integration',
      required: true
    },
    {
      name: 'schedule_expression',
      description: 'Cron expression for schedule',
      defaultValue: '0 */6 * * *', // Every 6 hours
      required: true
    },
    {
      name: 'api_url',
      description: 'URL of the external API to call',
      defaultValue: 'https://api.example.com/data',
      required: true
    },
    {
      name: 'processing_code',
      description: 'JavaScript code to process the API response',
      defaultValue: '// Example: Extract and transform specific fields\nconst processedData = data.items ? data.items.map(item => ({\n  id: item.id,\n  name: item.name,\n  status: item.status || "pending"\n})) : [];\n\ndata.processedItems = processedData;\ndata.processedAt = new Date().toISOString();',
      required: true
    }
  ]
};

// Получение всех доступных промтов
export function getAllPrompts(): Prompt[] {
  return [
    scheduleWorkflowPrompt,
    httpWebhookWorkflowPrompt,
    dataTransformationWorkflowPrompt,
    integrationWorkflowPrompt
  ];
}

// Получение промта по ID
export function getPromptById(id: string): Prompt | undefined {
  return getAllPrompts().find(prompt => prompt.id === id);
}

// Заполнение шаблона значениями переменных
export function fillPromptTemplate(promptId: string, variables: Record<string, string>): any {
  const prompt = getPromptById(promptId);
  if (!prompt) {
    throw new Error(`Prompt with id ${promptId} not found`);
  }

  // Создаем копию шаблона для заполнения
  const template = JSON.parse(JSON.stringify(prompt.template));

  // Проверяем, что все обязательные переменные предоставлены
  prompt.variables
    .filter((v: PromptVariable) => v.required)
    .forEach((v: PromptVariable) => {
      if (!variables[v.name] && !v.defaultValue) {
        throw new Error(`Required variable ${v.name} is missing`);
      }
    });

  // Функция для рекурсивного заполнения переменных в объекте
  function replaceVariables(obj: any, currentPrompt: Prompt): any {
    if (typeof obj === 'string') {
      // Заменяем все переменные вида {var_name} на их значения
      return obj.replace(/\{([^}]+)\}/g, (match, varName) => {
        // Передаем промт как параметр функции, чтобы избежать проблем с undefined
        const variableDefault = currentPrompt.variables.find((v: PromptVariable) => v.name === varName)?.defaultValue;
        return variables[varName] || variableDefault || match;
      });
    } else if (Array.isArray(obj)) {
      return obj.map(item => replaceVariables(item, currentPrompt));
    } else if (obj !== null && typeof obj === 'object') {
      const result: Record<string, any> = {};
      for (const key in obj) {
        result[key] = replaceVariables(obj[key], currentPrompt);
      }
      return result;
    }
    return obj;
  }

  // Заполняем переменные в шаблоне, передавая prompt как аргумент
  return replaceVariables(template, prompt);
} 