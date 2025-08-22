#!/bin/bash

# PulseFlow Deployment Script
# This script handles deployment to various environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="production"
SKIP_TESTS=false
SKIP_BUILD=false
DEPLOY_TARGET="vercel"

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

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV    Set deployment environment (default: production)"
    echo "  -t, --target TARGET      Set deployment target (vercel|docker|aws) (default: vercel)"
    echo "  --skip-tests            Skip running tests"
    echo "  --skip-build            Skip building the application"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Deploy to production on Vercel"
    echo "  $0 -e staging -t docker              # Deploy to staging using Docker"
    echo "  $0 --skip-tests --skip-build         # Quick deploy without tests/build"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -t|--target)
            DEPLOY_TARGET="$2"
            shift 2
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

print_status "Starting PulseFlow deployment..."
print_status "Environment: $ENVIRONMENT"
print_status "Target: $DEPLOY_TARGET"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    case $DEPLOY_TARGET in
        vercel)
            if ! command -v vercel &> /dev/null; then
                print_warning "Vercel CLI not found. Installing..."
                npm install -g vercel
            fi
            ;;
        docker)
            if ! command -v docker &> /dev/null; then
                print_error "Docker is not installed"
                exit 1
            fi
            ;;
        aws)
            if ! command -v aws &> /dev/null; then
                print_error "AWS CLI is not installed"
                exit 1
            fi
            ;;
    esac
    
    print_success "Dependencies check passed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm ci
    print_success "Dependencies installed"
}

# Run tests
run_tests() {
    if [ "$SKIP_TESTS" = true ]; then
        print_warning "Skipping tests"
        return
    fi
    
    print_status "Running tests..."
    npm run test:ci
    print_success "Tests passed"
}

# Build application
build_application() {
    if [ "$SKIP_BUILD" = true ]; then
        print_warning "Skipping build"
        return
    fi
    
    print_status "Building application..."
    npm run build
    print_success "Build completed"
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        vercel --prod --yes
    else
        vercel --yes
    fi
    
    print_success "Deployed to Vercel"
}

# Deploy using Docker
deploy_docker() {
    print_status "Deploying using Docker..."
    
    # Build Docker image
    docker build -t pulseflow:$ENVIRONMENT .
    
    # Stop existing container if running
    docker stop pulseflow-$ENVIRONMENT 2>/dev/null || true
    docker rm pulseflow-$ENVIRONMENT 2>/dev/null || true
    
    # Run new container
    docker run -d \
        --name pulseflow-$ENVIRONMENT \
        --env-file .env.local \
        -p 3000:3000 \
        pulseflow:$ENVIRONMENT
    
    print_success "Deployed using Docker"
}

# Deploy to AWS
deploy_aws() {
    print_status "Deploying to AWS..."
    print_warning "AWS deployment not implemented yet"
    # TODO: Implement AWS deployment (ECS, Lambda, etc.)
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Wait a moment for the service to start
    sleep 10
    
    case $DEPLOY_TARGET in
        vercel)
            # Get Vercel URL from deployment
            HEALTH_URL="https://your-app.vercel.app/health"
            ;;
        docker)
            HEALTH_URL="http://localhost:3000/health"
            ;;
        aws)
            HEALTH_URL="https://your-aws-domain.com/health"
            ;;
    esac
    
    if command -v curl &> /dev/null; then
        if curl -f -s "$HEALTH_URL" > /dev/null; then
            print_success "Health check passed"
        else
            print_warning "Health check failed - service may still be starting"
        fi
    else
        print_warning "curl not available - skipping health check"
    fi
}

# Main deployment flow
main() {
    check_dependencies
    install_dependencies
    run_tests
    build_application
    
    case $DEPLOY_TARGET in
        vercel)
            deploy_vercel
            ;;
        docker)
            deploy_docker
            ;;
        aws)
            deploy_aws
            ;;
        *)
            print_error "Unknown deployment target: $DEPLOY_TARGET"
            exit 1
            ;;
    esac
    
    health_check
    
    print_success "Deployment completed successfully!"
    print_status "Environment: $ENVIRONMENT"
    print_status "Target: $DEPLOY_TARGET"
}

# Run main function
main
