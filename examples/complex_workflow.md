# Example of Creating a Complex Workflow with Claude

## Request for Creating a Process with Multiple Nodes

```
Create an n8n workflow named "API Data Processor" with the following nodes:

1. "HTTP Request" node to fetch data from API https://api.example.com/data
2. "JSON Parse" node to process the received data
3. "Filter" node to filter records where "status" equals "active"
4. "Function" node with code that adds a "processed_date" field with the current date to each record
5. "Telegram" node to send a summary to chat ID: 123456789

Connect the nodes sequentially from first to last.
```

## Example of Updating an Existing Workflow

```
Update the workflow with ID [workflow ID]:
1. Change the URL in the "HTTP Request" node to https://api.example.com/data/v2
2. Add a new "Error Handling" node after "HTTP Request" to handle API errors
3. Modify the filter to also check the "priority" field with a value of "high"
```

## Example of Requesting Workflow Execution Statistics

```
Show me workflow execution statistics and answer the following questions:
1. What percentage of executions completed successfully?
2. Which workflow takes the longest to execute?
3. Were there any execution errors in the last 10 executions?
``` 