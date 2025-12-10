# HR Workflow Designer  
A React + ReactFlow based visual workflow builder with custom nodes, JSON editing, and workflow simulation.

This project allows HR teams to design automated workflows using a drag-and-drop UI, including custom node types such as **Start**, **Task**, **Approval**, **Automated**, and **End** nodes.


## 🚀 Features

### 🧱 **1. Visual Workflow Canvas**
- Drag and drop nodes
- Connect nodes using smooth edges
- Custom colored node components
- Pan / zoom / fit view controls

### 🗂️ **2. Custom Node Types**
- Start Node  
- Task Node  
- Approval Node  
- Automated Node (with automation dropdown)  
- End Node  

Each node has editable metadata.

---

### ✏️ **3. Node Editor Panel**
- Edit node title
- Edit metadata (JSON)
- Monaco-based JSON editor (auto fallback to textarea)
- Live JSON validation
- Persist edits to workflow

---

### 📦 **4. Export & Import Workflow**
- Export workflow as `workflow.json`
- Import workflow back into the canvas
- Useful for interviews and demos

---

### 🗑️ **5. Delete Node**
- Select a node → press Delete / Backspace

---

### 🧪 **6. Workflow Simulator Panel**
- Shows node structure
- Validates connections
- Simulates basic execution flow

---

## 🛠️ Tech Stack

| Layer | Technology |
|------|------------|
| UI Framework | React 18 |
| Canvas Engine | ReactFlow |
| Editor | Monaco Editor |
| State | Custom React Hooks |
| Mock API | MSW |
| Build Tool | Vite |
| Language | TypeScript |

---

## 📁 Folder Structure
src/
├── api/
├── components/
│ ├── Canvas/
│ ├── Editor/
│ ├── Sidebar/
│ └── nodes/
├── hooks/
├── styles/
└── App.tsx




