#!/bin/bash

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

print_command() {
  echo -e "${BLUE}[COMMAND]${NC} $1"
}

# Function to check if Docker is installed
check_docker() {
  if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
  fi

  if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
  fi
}

# Function to start production environment
start_prod() {
  print_message "Starting production environment..."
  print_command "docker-compose up -d"
  docker-compose up -d
  print_message "Production environment started. Access the application at http://localhost"
}

# Function to start development environment
start_dev() {
  print_message "Starting development environment..."
  print_command "docker-compose -f docker-compose.dev.yml up"
  docker-compose -f docker-compose.dev.yml up
}

# Function to stop containers
stop() {
  if [ "$1" == "dev" ]; then
    print_message "Stopping development environment..."
    print_command "docker-compose -f docker-compose.dev.yml down"
    docker-compose -f docker-compose.dev.yml down
  else
    print_message "Stopping production environment..."
    print_command "docker-compose down"
    docker-compose down
  fi
}

# Function to show logs
logs() {
  if [ "$1" == "dev" ]; then
    print_message "Showing development logs..."
    print_command "docker-compose -f docker-compose.dev.yml logs -f"
    docker-compose -f docker-compose.dev.yml logs -f
  else
    print_message "Showing production logs..."
    print_command "docker-compose logs -f"
    docker-compose logs -f
  fi
}

# Function to rebuild containers
rebuild() {
  if [ "$1" == "dev" ]; then
    print_message "Rebuilding development environment..."
    print_command "docker-compose -f docker-compose.dev.yml up -d --build"
    docker-compose -f docker-compose.dev.yml up -d --build
  else
    print_message "Rebuilding production environment..."
    print_command "docker-compose up -d --build"
    docker-compose up -d --build
  fi
}

# Check if Docker is installed
check_docker

# Parse command line arguments
case "$1" in
  start)
    if [ "$2" == "dev" ]; then
      start_dev
    else
      start_prod
    fi
    ;;
  stop)
    stop $2
    ;;
  logs)
    logs $2
    ;;
  rebuild)
    rebuild $2
    ;;
  *)
    echo "Usage: $0 {start|stop|logs|rebuild} [dev|prod]"
    echo "Examples:"
    echo "  $0 start       # Start production environment"
    echo "  $0 start dev   # Start development environment"
    echo "  $0 stop        # Stop production environment"
    echo "  $0 stop dev    # Stop development environment"
    echo "  $0 logs        # Show production logs"
    echo "  $0 logs dev    # Show development logs"
    echo "  $0 rebuild     # Rebuild production containers"
    echo "  $0 rebuild dev # Rebuild development containers"
    exit 1
    ;;
esac

exit 0 