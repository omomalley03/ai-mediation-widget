# AI Negotiation Mediator

An AI-powered widget that monitors conversations between two parties and intervenes when inappropriate language is detected.

## Features
- Real-time dialogue simulation between Alice and Bob
- AI analysis of each message for profanity
- Visual warnings when inappropriate language is detected
- Clean, modern UI with split-screen layout

## Setup

1. Clone or download this repository
2. Open `index.html` in a web browser
3. No build process required - runs directly in the browser

## Usage

1. Type messages in either Alice or Bob's input box
2. Press Enter or click Send
3. AI automatically analyzes each message
4. If profanity is detected, a warning modal appears

## Technologies
- HTML5
- CSS3 (with animations)
- Vanilla JavaScript
- Anthropic Claude API

## Note
This project uses the Anthropic API. The API is accessible without a key in the Claude.ai artifact environment, but if running locally, you'll need to add authentication.
```

### 6. Create .gitignore (if using Git)
```
# Dependencies
node_modules/

# Environment variables
.env
config.js

# IDE
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db

# Logs
*.log