#!/bin/bash
# Docker startup script for DATN application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

show_menu() {
    echo ""
    echo "====== DATN Application Launcher ======"
    echo "1. Start Development (Dev)"
    echo "2. Start Production (Prod)"
    echo "3. Stop All Services"
    echo "4. View Backend Logs"
    echo "5. View Frontend Logs"
    echo "6. View All Logs"
    echo "7. Rebuild Images"
    echo "8. Reset All (Remove containers, networks, volumes)"
    echo "9. Exit"
    echo "========================================"
    echo ""
}

start_dev() {
    print_info "Starting Development Mode..."
    if [ ! -f ".env.dev" ]; then
        print_error ".env.dev file not found!"
        exit 1
    fi
    docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d --build
    print_info "Development services started!"
    echo ""
    echo "Access URLs:"
    echo "  Frontend: http://localhost:4200"
    echo "  Backend:  http://localhost:8080"
    echo ""
}

start_prod() {
    print_info "Starting Production Mode..."
    if [ ! -f ".env.prod" ]; then
        print_error ".env.prod file not found!"
        exit 1
    fi
    docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
    print_info "Production services started!"
    echo ""
    echo "Access URLs:"
    echo "  Frontend: http://localhost:80"
    echo "  Backend:  http://localhost:8080"
    echo ""
}

stop_all() {
    print_info "Stopping all services..."
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.prod.yml down
    print_info "All services stopped!"
}

view_backend_logs() {
    print_info "Viewing Backend Logs (Press Ctrl+C to exit)..."
    docker-compose -f docker-compose.dev.yml logs -f backend || docker-compose -f docker-compose.prod.yml logs -f backend
}

view_frontend_logs() {
    print_info "Viewing Frontend Logs (Press Ctrl+C to exit)..."
    docker-compose -f docker-compose.dev.yml logs -f frontend || docker-compose -f docker-compose.prod.yml logs -f frontend
}

view_all_logs() {
    print_info "Viewing All Logs (Press Ctrl+C to exit)..."
    docker-compose -f docker-compose.dev.yml logs -f || docker-compose -f docker-compose.prod.yml logs -f
}

rebuild_images() {
    print_info "Rebuilding Docker images..."
    docker-compose -f docker-compose.dev.yml build --no-cache
    docker-compose -f docker-compose.prod.yml build --no-cache
    print_info "Images rebuilt successfully!"
}

reset_all() {
    print_warning "This will remove all containers, networks, and volumes!"
    read -p "Are you sure? (yes/no): " confirmation
    if [ "$confirmation" = "yes" ]; then
        print_info "Resetting all services..."
        docker-compose -f docker-compose.dev.yml down -v
        docker-compose -f docker-compose.prod.yml down -v
        print_info "All services reset!"
    else
        print_info "Reset cancelled."
    fi
}

# Main loop
while true; do
    show_menu
    read -p "Select an option (1-9): " choice

    case $choice in
        1) start_dev ;;
        2) start_prod ;;
        3) stop_all ;;
        4) view_backend_logs ;;
        5) view_frontend_logs ;;
        6) view_all_logs ;;
        7) rebuild_images ;;
        8) reset_all ;;
        9)
            print_info "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid option. Please try again."
            ;;
    esac
done

