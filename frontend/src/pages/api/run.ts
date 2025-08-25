import { Client } from '@langchain/langgraph-sdk'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { question, databaseUuid, sessionId } = req.body
  const defaultDatabaseUuid = 'dae413af-fef8-4101-ad7d-9f333b041829'

  const client = new Client({
    apiKey: process.env.LANGSMITH_API_KEY,
    apiUrl: process.env.LANGGRAPH_API_URL,
  })

  try {
    const thread = await client.threads.create()
    const streamResponse = client.runs.stream(thread['thread_id'], 'my_agent', {
      input: { question, uuid: databaseUuid || defaultDatabaseUuid, session_id: sessionId },
    })

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    })

    for await (const chunk of streamResponse) {
      if (chunk.data && chunk.data.question) {
        res.write(`data: ${JSON.stringify(chunk.data)}\n\n`)
      }
    }

    res.end()
  } catch (error) {
    console.error('Error in run:', error)
    res.status(500).json({ message: `Error in run: ${error}` })
  }
}
