# DataViz Pro

<!-- DEMO VIDEO -->

## Demo

[Watch the demo video](https://github.com/shubhpsd/data-viz/assets/102896824/d0b712c9-9323-450d-8e83-c39a97f8a55f)

DataViz Pro is a tool that lets you turn data into visualizations just by asking. You can upload a database file (SQLite), and then ask questions in plain English. The system will understand your request, query the database, and generate the appropriate chart or graph to display the results.

## Quickstart

Follow these steps to get the project running locally.

### 1. First-Time Setup

First, run the setup script. This will check for necessary dependencies, install packages for all services, and create the environment files.

```bash
./setup.sh
```

### 2. Configure Environment Variables

The setup script creates `.env` files in the `backend_py` and `frontend` directories. You'll need to add your API keys to them.

- `backend_py/.env`: Add your `GOOGLE_API_KEY`.
- `frontend/.env.local`: No action needed unless you want to change the default API URLs.

### 3. Start the Services

This project has multiple services that need to be running at the same time. The `manage_services.sh` script helps with this.

To start all required services (Frontend, Conversation API), run:

```bash
./manage_services.sh start
```

### 4. Start the LangGraph Dev Server

The core logic is powered by a LangGraph agent. You need to start its development server separately.

Open a **new terminal** and run:

```bash
cd backend_py
source venv/bin/activate
langgraph dev --port 8123
```

Note: You need to activate the virtual environment (`source venv/bin/activate`) each time you start the LangGraph server in a new terminal session.

### 5. Access the Application

Once all services are running, you can open your browser and go to:

[http://localhost:3000](http://localhost:3000)

## Troubleshooting

- **Port conflicts**: If a service fails to start, it might be because the port is already in use. The `manage_services.sh` script will attempt to kill existing processes on the required ports. You can also manually stop all services with `./manage_services.sh stop`.
- **Missing dependencies**: Make sure you have Node.js (v20+) and Python (v3.11+) installed. The `setup.sh` script will check for these.
- **API Key Issues**: If you see errors related to API keys, double-check that you've added your `GOOGLE_API_KEY` to `backend_py/.env`.
- **LangGraph Port Conflict**: If the `langgraph dev` server fails to start, it might be because the port (8123) is in use by a previous process. You can free it up by running: `kill $(lsof -t -i:8123)`.

## What is What? A Look at the Project Structure

Here’s a breakdown of the main directories and what they do.

- `frontend/`: This is the web interface, built with Next.js and TypeScript. It's what you see and interact with in the browser.

  - `src/pages/`: The main pages of the application.
  - `src/components/`: Reusable UI components, including the different types of graphs.
  - `src/components/playground/`: The main interactive area where you upload files and ask questions.

- `backend_py/`: The core Python backend. It uses LangGraph to create an agent that can understand natural language, write SQL queries, and decide which visualization to use.

  - `my_agent/`: Contains the logic for the LangGraph agent, including state management, database interaction, and the main workflow.
  - `conversation_api.py`: A simple API that the frontend talks to. It manages conversation history.

- `sqlite_server/`: A small Node.js server responsible for handling the uploaded SQLite database files.

- `manage_services.sh`: A utility script to start, stop, and check the status of all the different services.

- `setup.sh`: The initial setup script that prepares your local environment.
