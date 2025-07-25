# 🚀 Go High Level MCP Server - One-Click Setup!

[![smithery badge](https://smithery.ai/badge/@amardeep29/gohighlevelmcp)](https://smithery.ai/server/@amardeep29/gohighlevelmcp)

> **Enhanced MCP Server for Go High Level with Custom Fields Support**

## ⚡ **SUPER QUICK INSTALL (30 seconds)**

### Method 1: Clone & Auto-Setup ⭐ **RECOMMENDED**
```bash
# 1. Clone the repo
git clone https://github.com/yourusername/ghl-mcp-server-enhanced-fixed.git
cd ghl-mcp-server-enhanced-fixed

# 2. Install dependencies
npm install

# 3. Interactive setup (will ask for your API credentials)
npm run setup

# 4. Start the server
npm start
```

### Method 2: Ultimate One-Liner 🔥
```bash
git clone https://github.com/yourusername/ghl-mcp-server-enhanced-fixed.git && cd ghl-mcp-server-enhanced-fixed && npm install && npm run quick-start
```

## 🔑 **Getting Your GHL Credentials (Takes 1 minute)**

1. **Login to Go High Level**: https://app.gohighlevel.com/
2. **Go to Settings** → **Integrations** → **API** 
3. **Copy these values**:
   - 🎯 **Access Token** (starts with `pit-` or similar)
   - 📍 **Location ID** (your workspace ID)

That's it! The setup script will handle everything else.

## 🛠️ **Manual Setup (If You Prefer)**

1. **Copy environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** with your credentials:
   ```bash
   GHL_ACCESS_TOKEN=your_actual_token_here
   GHL_LOCATION_ID=your_actual_location_id_here
   ```

3. **Build and start**:
   ```bash
   npm run build
   npm start
   ```

## 🔧 **MCP Client Configuration**

### Claude Desktop Configuration
Add this to your Claude config file:

**Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ghl-server": {
      "command": "node",
      "args": ["/path/to/your/ghl-mcp-server-enhanced-fixed/dist/server.js"],
      "env": {
        "GHL_ACCESS_TOKEN": "your_token_here",
        "GHL_LOCATION_ID": "your_location_id_here"
      }
    }
  }
}
```

### Installing via Smithery

To install gohighlevelmcp for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@amardeep29/gohighlevelmcp):

```bash
npx -y @smithery/cli install @amardeep29/gohighlevelmcp --client claude
```

### Other MCP Clients
For other MCP clients, use:
- **Command**: `node dist/server.js`
- **Working Directory**: `/path/to/ghl-mcp-server-enhanced-fixed`
- **Environment Variables**: Your GHL credentials

## ✨ **Available Functions**

### 📱 **Contact Management**
- `search_contacts` - Find contacts by name/email/phone
- `get_contact` - Get detailed contact info
- `create_contact` - Add new contacts
- `create_note` - Add notes to contacts
- `get_contact_notes` - View all contact notes
- `create_task` - Create tasks for contacts

### 💼 **Opportunity Management**  
- `search_opportunities` - Find deals and opportunities
- `get_opportunity` - Get opportunity details
- `create_opportunity` - Create new opportunities
- `move_opportunity_stage` - Move deals through pipeline
- `assign_opportunity` - Assign deals to team members
- `update_opportunity_status` - Update deal status

### 📅 **Calendar & Appointments**
- `list_calendar_appointments` - View scheduled appointments

### 💬 **Messaging**
- `send_sms` - Send SMS messages
- `send_email` - Send email messages  
- `get_conversation_history` - View message history

### 📊 **Pipeline Management**
- `get_pipeline_stages` - List all pipeline stages
- `get_pipeline_info` - Get pipeline details

### 🏷️ **Custom Fields** ⭐ **NEW!**
- `list_custom_fields` - View all custom fields
- `get_custom_field` - Get specific field details
- `create_custom_field` - Create new custom fields

## 🧪 **Test Your Setup**

```bash
# Test if your API credentials work
npm test
```

## 📁 **File Structure**
```
ghl-mcp-server-enhanced-fixed/
├── 📄 server.ts              # Main server code
├── 🔧 setup.js               # Interactive setup script  
├── 📋 package.json           # Dependencies & scripts
├── 🔒 .env                   # Your API credentials (after setup)
├── 📝 .env.example           # Template for credentials
├── 📚 README.md              # This file
├── 🏗️ dist/                  # Compiled files
└── 📦 node_modules/          # Dependencies
```

## 🆘 **Troubleshooting**

### ❌ "Missing GHL_ACCESS_TOKEN"
- Run `npm run setup` again
- Make sure your `.env` file exists and has valid credentials

### ❌ "API Error 401: Unauthorized"  
- Check your Access Token is correct
- Verify the token has proper permissions in GHL

### ❌ "Location not found"
- Double-check your Location ID
- Make sure you're using the correct workspace

### 🔄 **Reset Configuration**
```bash
rm .env && npm run setup
```

## 🌟 **Contributing**

Found a bug or want to add features? We'd love your help!

1. Fork the repository
2. Create a feature branch
3. Make your changes  
4. Submit a pull request

## 📄 **License**

MIT License - feel free to use this in your projects!

---

**Made with ❤️ for the Go High Level community**

> 🎯 **Pro Tip**: Star this repo if it saves you time! ⭐
