# DataViz Pro

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 20+](https://img.shields.io/badge/node-20+-green.svg)](https://nodejs.org/)

A natural language data visualization tool that lets you upload CSV files, ask questions in plain English, and get beautiful charts instantly. No SQL knowledge required.

[Demo Video](https://github.com/user-attachments/assets/56e342e9-55e7-4df4-84d1-36e729880e4f)

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, Material-UI
- **Backend**: Python, LangGraph, OpenAI/Gemini APIs
- **Database**: SQLite (with PostgreSQL support planned)
- **Visualization**: MUI Charts, React Flow

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- OpenAI or Google Gemini API key

### Setup

```bash
git clone https://github.com/shubhpsd/datavisualization_langgraph.git
cd datavisualization_langgraph
./manage_services.sh setup
```

Add your API keys to the generated environment files:

- `frontend/.env.local`
- `backend_py/.env`

### Run

```bash
./manage_services.sh start
```

Access the app at <http://localhost:3000\>

## What's Next

- PostgreSQL and MySQL support
- Download/sharing features
- Better chart customization
- Team collaboration features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
