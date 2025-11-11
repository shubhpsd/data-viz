#!/bin/bash

# Data Visualization LangGraph - Service Manager
# This script manages all services for the project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Service configuration
FRONTEND_PORT=3000
CONVERSATION_API_PORT=5001

# PID files directory
PID_DIR="./pids"
mkdir -p "$PID_DIR"

# Service PID files
FRONTEND_PID="$PID_DIR/frontend.pid"
CONVERSATION_API_PID="$PID_DIR/conversation_api.pid"

# Log files directory
LOG_DIR="./logs"
mkdir -p "$LOG_DIR"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -ti :$port > /dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti :$port)
    if [ ! -z "$pid" ]; then
        kill -9 $pid 2>/dev/null || true
        print_status "Killed process on port $port (PID: $pid)"
    fi
}

# Function to check if service is running
is_service_running() {
    local pid_file=$1
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            return 0  # Service is running
        else
            rm -f "$pid_file"  # Clean up stale PID file
            return 1  # Service is not running
        fi
    else
        return 1  # PID file doesn't exist
    fi
}

# Function to start conversation API
start_conversation_api() {
    if is_service_running "$CONVERSATION_API_PID"; then
        print_warning "Conversation API is already running"
        return
    fi

    print_status "Starting Conversation API..."
    cd backend_py
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt > /dev/null 2>&1
    
    # Start the conversation API
    nohup python conversation_api.py > "../$LOG_DIR/conversation_api.log" 2>&1 &
    echo $! > "../$CONVERSATION_API_PID"
    cd ..
    
    # Wait a moment for the server to start
    sleep 3
    
    if check_port $CONVERSATION_API_PORT; then
        print_success "Conversation API started on port $CONVERSATION_API_PORT"
    else
        print_error "Failed to start Conversation API"
        rm -f "$CONVERSATION_API_PID"
    fi
}

# Function to start frontend
start_frontend() {
    if is_service_running "$FRONTEND_PID"; then
        print_warning "Frontend is already running"
        return
    fi

    print_status "Starting Frontend..."
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        # Add Homebrew to PATH for installation
        export PATH="/opt/homebrew/bin:$PATH"
        yarn install
    fi
    
    # Add Homebrew to PATH to find node
    export PATH="/opt/homebrew/bin:$PATH"
    
    nohup yarn dev > "../$LOG_DIR/frontend.log" 2>&1 &
    echo $! > "../$FRONTEND_PID"
    cd ..
    
    # Wait a moment for the server to start
    sleep 5
    
    if check_port $FRONTEND_PORT; then
        print_success "Frontend started on port $FRONTEND_PORT"
    else
        print_error "Failed to start frontend"
        rm -f "$FRONTEND_PID"
    fi
}

# Function to stop a service
stop_service() {
    local service_name=$1
    local pid_file=$2
    local port=$3
    
    if is_service_running "$pid_file"; then
        local pid=$(cat "$pid_file")
        kill $pid 2>/dev/null || kill -9 $pid 2>/dev/null || true
        rm -f "$pid_file"
        print_success "$service_name stopped"
    else
        print_warning "$service_name is not running"
    fi
    
    # Kill any remaining process on the port
    kill_port $port
}

# Function to start all services
start_all() {
    print_status "Starting all services..."
    echo ""
    
    # Check environment files
    check_environment_files
    echo ""
    
    start_conversation_api
    start_frontend
    
    echo ""
    print_success "All services startup completed!"
    echo ""
    print_status "Frontend: http://localhost:$FRONTEND_PORT"
    print_status "Conversation API: http://localhost:$CONVERSATION_API_PORT"
    echo ""
    print_status "Run './manage_services.sh status' to check service health"
    print_status "Run './manage_services.sh logs' to view logs"
    echo ""
    print_status "Note: LangGraph backend should be started separately using LangGraph Studio"
    print_status "      or run locally with: cd backend_py && /venv/bin/activate && langgraph dev --port 8123"
}

# Function to stop all services
stop_all() {
    print_status "Stopping all services..."
    
    stop_service "Frontend" "$FRONTEND_PID" "$FRONTEND_PORT"
    stop_service "Conversation API" "$CONVERSATION_API_PID" "$CONVERSATION_API_PORT"
    
    print_success "All services stopped"
}

# Function to restart all services
restart_all() {
    print_status "Restarting all services..."
    stop_all
    sleep 2
    start_all
}

# Function to show service status
show_status() {
    echo "Service Status:"
    echo "=============="
    
    # Check Conversation API
    if is_service_running "$CONVERSATION_API_PID"; then
        print_success "Conversation API: RUNNING (port $CONVERSATION_API_PORT)"
    else
        print_error "Conversation API: STOPPED"
    fi
    
    # Check Frontend
    if is_service_running "$FRONTEND_PID"; then
        print_success "Frontend: RUNNING (port $FRONTEND_PORT)"
    else
        print_error "Frontend: STOPPED"
    fi
    
    echo ""
    print_status "Note: LangGraph backend should be started separately using LangGraph Studio"
    print_status "      or run locally with: cd backend_py && /venv/bin/activate && langgraph dev --port 8123"
}

# Function to show logs
show_logs() {
    echo "Recent logs:"
    echo "============"
    
    if [ -f "$LOG_DIR/frontend.log" ]; then
        echo -e "${BLUE}Frontend logs (last 10 lines):${NC}"
        tail -n 10 "$LOG_DIR/frontend.log"
        echo ""
    fi
    
    if [ -f "$LOG_DIR/conversation_api.log" ]; then
        echo -e "${BLUE}Conversation API logs (last 10 lines):${NC}"
        tail -n 10 "$LOG_DIR/conversation_api.log"
        echo ""
    fi
}

# Function to check environment files
check_environment_files() {
    local missing_env=false
    
    print_status "Checking environment configuration..."
    
    if [ ! -f "frontend/.env.local" ]; then
        print_warning "Frontend .env.local not found. Copy from frontend/env.example"
        missing_env=true
    fi
    
    if [ ! -f "backend_py/.env" ]; then
        print_warning "Backend Python .env not found. Copy from backend_py/env.example"
        missing_env=true
    fi
    
    if [ "$missing_env" = true ]; then
        print_error "Missing environment files. Please configure them before starting services."
        echo ""
        print_status "Quick setup:"
        print_status "  cp frontend/env.example frontend/.env.local"
        print_status "  cp backend_py/env.example backend_py/.env"
        print_status "  # Edit the files and add your API keys"
        echo ""
        return 1
    else
        print_success "Environment files found"
        return 0
    fi
}

# Function to run health checks
health_check() {
    print_status "Running health checks..."
    echo ""
    
    # Check Conversation API
    if curl -s "http://localhost:$CONVERSATION_API_PORT/health" > /dev/null 2>&1; then
        print_success "Conversation API: Healthy"
    else
        print_error "Conversation API: Unhealthy or not responding"
    fi
    
    # Check Frontend
    if curl -s "http://localhost:$FRONTEND_PORT" > /dev/null 2>&1; then
        print_success "Frontend: Healthy"
    else
        print_error "Frontend: Unhealthy or not responding"
    fi
}

# Function to show help
show_help() {
    echo "Data Visualization LangGraph - Service Manager"
    echo "=============================================="
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start      Start all services"
    echo "  stop       Stop all services"
    echo "  restart    Restart all services"
    echo "  status     Show service status"
    echo "  logs       Show recent logs"
    echo "  health     Run health checks"
    echo "  setup      Setup environment files"
    echo "  clean      Clean up PID and log files"
    echo "  help       Show this help message"
    echo ""
    echo "Individual service commands:"
    echo "  start-frontend     Start only frontend"
    echo "  start-api          Start only conversation API"
    echo "  stop-frontend      Stop only frontend"
    echo "  stop-api           Stop only conversation API"
    echo ""
    echo "Example:"
    echo "  $0 start          # Start all services"
    echo "  $0 status         # Check service status"
    echo "  $0 logs           # View recent logs"
}

# Function to setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Copy example files
    if [ ! -f "frontend/.env.local" ]; then
        cp frontend/env.example frontend/.env.local
        print_success "Created frontend/.env.local"
    fi
    
    if [ ! -f "backend_py/.env" ]; then
        cp backend_py/env.example backend_py/.env
        print_success "Created backend_py/.env"
    fi
    
    echo ""
    print_warning "IMPORTANT: Edit the .env files and add your actual API keys:"
    print_status "  - OPENAI_API_KEY or GOOGLE_API_KEY"
    print_status "  - LANGSMITH_API_KEY (optional)"
    print_status "  - LANGGRAPH_API_URL (when using LangGraph Studio)"
    echo ""
}

# Function to clean up
clean_up() {
    print_status "Cleaning up PID and log files..."
    rm -rf "$PID_DIR"
    rm -rf "$LOG_DIR"
    print_success "Cleanup completed"
}

# Main script logic
case "${1:-help}" in
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        restart_all
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    health)
        health_check
        ;;
    setup)
        setup_environment
        ;;
    clean)
        clean_up
        ;;
    start-frontend)
        start_frontend
        ;;
    start-api)
        start_conversation_api
        ;;
    stop-frontend)
        stop_service "Frontend" "$FRONTEND_PID" "$FRONTEND_PORT"
        ;;
    stop-api)
        stop_service "Conversation API" "$CONVERSATION_API_PID" "$CONVERSATION_API_PORT"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
