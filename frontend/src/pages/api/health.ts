export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const services = {
    sqlite: false,
    conversation: false,
    langgraph: false
  }

  try {
    // Check SQLite Server health endpoint
    const sqliteResponse = await fetch('http://localhost:3001/health', {
      signal: AbortSignal.timeout(2000) // 2 second timeout
    })
    services.sqlite = sqliteResponse.ok
  } catch (error) {
    services.sqlite = false
  }

  try {
    // Check Conversation API
    const conversationResponse = await fetch('http://localhost:5001/health', {
      signal: AbortSignal.timeout(2000)
    })
    services.conversation = conversationResponse.ok
  } catch (error) {
    services.conversation = false
  }

  try {
    // Check LangGraph (test if environment variables are set, which indicates it should be running)
    services.langgraph = !!(process.env.LANGGRAPH_API_URL && process.env.LANGSMITH_API_KEY)
  } catch (error) {
    services.langgraph = false
  }

  res.status(200).json(services)
} 