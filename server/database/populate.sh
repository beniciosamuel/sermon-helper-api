#!/bin/bash

# Database Population Script for PostgreSQL
# This script creates the database if it doesn't exist and executes the structure.sql

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_error() {
    echo -e "${RED}Error: $1${NC}" >&2
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}Warning: $1${NC}"
}

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STRUCTURE_SQL="${SCRIPT_DIR}/structure.sql"
SECRETS_FILE="${SCRIPT_DIR}/../.env/secrets.json"

# Function to check if required tools are installed
check_dependencies() {
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL client (psql) is not installed or not in PATH."
        echo "Please install PostgreSQL client:"
        echo "  - macOS: brew install postgresql"
        echo "  - Ubuntu/Debian: sudo apt-get install postgresql-client"
        exit 1
    fi
    print_success "PostgreSQL client (psql) found"
    
    if ! command -v jq &> /dev/null; then
        print_error "jq is not installed or not in PATH."
        echo "Please install jq:"
        echo "  - macOS: brew install jq"
        echo "  - Ubuntu/Debian: sudo apt-get install jq"
        exit 1
    fi
    print_success "jq found"
}

# Function to get database configuration from secrets
get_db_config() {
    local env="${1:-development}"
    
    if [ ! -f "${SECRETS_FILE}" ]; then
        print_error "Secrets file not found at ${SECRETS_FILE}"
        echo "Please run the server start script first to retrieve secrets from Google Cloud."
        exit 1
    fi
    
    # Read database configuration from secrets.json
    DB_HOST=$(jq -r ".${env}.DB_HOST // empty" "${SECRETS_FILE}")
    DB_PORT=$(jq -r ".${env}.DB_PORT // \"5432\"" "${SECRETS_FILE}")
    DB_USER=$(jq -r ".${env}.DB_USER // empty" "${SECRETS_FILE}")
    DB_PASSWORD=$(jq -r ".${env}.DB_PASSWORD // empty" "${SECRETS_FILE}")
    DB_NAME=$(jq -r ".${env}.DB_NAME // empty" "${SECRETS_FILE}")
    
    # Validate required fields
    if [ -z "${DB_HOST}" ] || [ -z "${DB_USER}" ] || [ -z "${DB_PASSWORD}" ] || [ -z "${DB_NAME}" ]; then
        print_error "Missing required database configuration in secrets.json"
        echo "Required fields: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME"
        exit 1
    fi
    
    print_success "Database configuration loaded from secrets"
}

# Function to run psql command with credentials
# Uses PGPASSWORD env var to avoid password prompt
run_psql() {
    PGPASSWORD="${DB_PASSWORD}" psql \
        --host="${DB_HOST}" \
        --port="${DB_PORT}" \
        --username="${DB_USER}" \
        --no-password \
        "$@"
}

# Function to run psql connecting to the target database
run_psql_db() {
    run_psql --dbname="${DB_NAME}" "$@"
}

# Function to run psql connecting to the default postgres database (for admin operations)
run_psql_admin() {
    run_psql --dbname="postgres" "$@"
}

# Function to check if database exists
database_exists() {
    local result
    result=$(run_psql_admin \
        --tuples-only \
        --no-align \
        -c "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}';" 2>&1)
    
    local exit_code=$?
    
    if [ ${exit_code} -ne 0 ]; then
        print_error "Failed to connect to PostgreSQL: ${result}"
        exit 1
    fi
    
    if [ "${result}" = "1" ]; then
        return 0  # Database exists
    else
        return 1  # Database does not exist
    fi
}

# Function to create database if it doesn't exist
create_database_if_not_exists() {
    print_success "Checking if database '${DB_NAME}' exists..."
    
    if database_exists; then
        print_warning "Database '${DB_NAME}' already exists"
        echo "Do you want to drop and recreate it? (y/N)"
        read -r response
        if [[ "${response}" =~ ^[Yy]$ ]]; then
            print_warning "Dropping database '${DB_NAME}'..."
            # Terminate existing connections before dropping
            run_psql_admin -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();" > /dev/null 2>&1
            run_psql_admin -c "DROP DATABASE ${DB_NAME};" 2>&1
            print_success "Database '${DB_NAME}' dropped"
        else
            print_success "Keeping existing database"
            return 0
        fi
    fi
    
    print_success "Creating database '${DB_NAME}'..."
    run_psql_admin -c "CREATE DATABASE ${DB_NAME} WITH ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8' TEMPLATE=template0;" 2>&1
    
    if [ $? -eq 0 ]; then
        print_success "Database '${DB_NAME}' created successfully"
    else
        # Try without locale settings (for systems with different locale setup)
        print_warning "Retrying database creation with default locale..."
        run_psql_admin -c "CREATE DATABASE ${DB_NAME};" 2>&1
        if [ $? -eq 0 ]; then
            print_success "Database '${DB_NAME}' created successfully"
        else
            print_error "Failed to create database '${DB_NAME}'"
            exit 1
        fi
    fi
}

# Function to execute structure.sql
execute_structure_sql() {
    if [ ! -f "${STRUCTURE_SQL}" ]; then
        print_error "structure.sql not found at ${STRUCTURE_SQL}"
        exit 1
    fi
    
    print_success "Executing structure.sql..."
    
    run_psql_db -f "${STRUCTURE_SQL}" 2>&1
    
    local exit_code=$?
    
    if [ ${exit_code} -eq 0 ]; then
        print_success "structure.sql executed successfully"
    else
        print_error "Failed to execute structure.sql"
        exit 1
    fi
}

# Function to display usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --env ENV     Environment to use (development|production). Default: development"
    echo "  -f, --force       Force recreation of database without prompting"
    echo "  -h, --help        Display this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Use development environment"
    echo "  $0 -e production      # Use production environment"
    echo "  $0 --force            # Force recreate without prompting"
}

# Main execution
main() {
    local env="development"
    local force=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--env)
                env="$2"
                shift 2
                ;;
            -f|--force)
                force=true
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    # Validate environment
    if [[ "${env}" != "development" && "${env}" != "production" ]]; then
        print_error "Invalid environment: ${env}. Must be 'development' or 'production'"
        exit 1
    fi
    
    echo "=========================================="
    echo "Database Population Script (PostgreSQL)"
    echo "Environment: ${env}"
    echo "=========================================="
    echo ""
    
    # Step 1: Check dependencies
    check_dependencies
    
    # Step 2: Load database configuration
    get_db_config "${env}"
    
    echo ""
    echo "Database Configuration:"
    echo "  Host: ${DB_HOST}"
    echo "  Port: ${DB_PORT}"
    echo "  User: ${DB_USER}"
    echo "  Database: ${DB_NAME}"
    echo ""
    
    # Step 3: Create database if it doesn't exist
    if [ "${force}" = true ]; then
        # Force mode: drop and recreate
        if database_exists; then
            print_warning "Force mode: Dropping database '${DB_NAME}'..."
            # Terminate existing connections before dropping
            run_psql_admin -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();" > /dev/null 2>&1
            run_psql_admin -c "DROP DATABASE IF EXISTS ${DB_NAME};" 2>&1
        fi
        run_psql_admin -c "CREATE DATABASE ${DB_NAME};" 2>&1
        print_success "Database '${DB_NAME}' created"
    else
        create_database_if_not_exists
    fi
    
    # Step 4: Execute structure.sql
    execute_structure_sql
    
    echo ""
    echo "=========================================="
    print_success "Database population complete!"
    echo "=========================================="
}

# Run main function with all arguments
main "$@"
