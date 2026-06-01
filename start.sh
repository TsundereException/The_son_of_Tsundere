#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Starting Django Backend..."
osascript -e 'tell application "Terminal" to do script "cd '\'''$DIR/Backend''\'' && source venv/bin/activate && python manage.py runserver"'

echo "Starting Vite Frontend..."
osascript -e 'tell application "Terminal" to do script "cd '\'''$DIR/Frontend''\'' && npm run dev"'

echo "Both servers are starting in new terminal windows!"
