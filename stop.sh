#!/bin/bash
# ============================================================================
# Travel2030 - Shutdown Script
# Stops Backend, Frontend, and optionally MySQL
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

echo -e "${CYAN}${BOLD}"
echo "  ============================================"
echo "       Travel2030 - Shutdown"
echo "  ============================================"
echo -e "${NC}"

KILLED=0

# ── Stop fakeSMTP (port 2525) ────────────────────────────────────────────────
echo -e "${BOLD}[1/3] Stopping fakeSMTP (port 2525)...${NC}"
SMTP_PIDS=$(lsof -ti:2525 2>/dev/null)
if [ -n "$SMTP_PIDS" ]; then
    echo "$SMTP_PIDS" | xargs kill -9 2>/dev/null
    echo -e "${GREEN}  Stopped${NC} (PID: $SMTP_PIDS)"
    KILLED=$((KILLED + 1))
else
    echo -e "${YELLOW}  Not running${NC}"
fi

# ── Stop Backend (port 8085) ─────────────────────────────────────────────────
echo -e "${BOLD}[2/3] Stopping backend (port 8085)...${NC}"
BACKEND_PIDS=$(lsof -ti:8085 2>/dev/null)
if [ -n "$BACKEND_PIDS" ]; then
    echo "$BACKEND_PIDS" | xargs kill -9 2>/dev/null
    echo -e "${GREEN}  Stopped${NC} (PID: $BACKEND_PIDS)"
    KILLED=$((KILLED + 1))
else
    echo -e "${YELLOW}  Not running${NC}"
fi

# Also kill any mvn spring-boot:run processes
MVN_PIDS=$(pgrep -f "spring-boot:run" 2>/dev/null)
if [ -n "$MVN_PIDS" ]; then
    echo "$MVN_PIDS" | xargs kill -9 2>/dev/null
    echo -e "${GREEN}  Stopped Maven process${NC} (PID: $MVN_PIDS)"
    KILLED=$((KILLED + 1))
fi

# ── Stop Frontend (port 4200) ───────────────────────────────────────────────
echo -e "${BOLD}[3/3] Stopping frontend (port 4200)...${NC}"
FRONTEND_PIDS=$(lsof -ti:4200 2>/dev/null)
if [ -n "$FRONTEND_PIDS" ]; then
    echo "$FRONTEND_PIDS" | xargs kill -9 2>/dev/null
    echo -e "${GREEN}  Stopped${NC} (PID: $FRONTEND_PIDS)"
    KILLED=$((KILLED + 1))
else
    echo -e "${YELLOW}  Not running${NC}"
fi

# Also kill any ng serve processes
NG_PIDS=$(pgrep -f "ng serve" 2>/dev/null)
if [ -n "$NG_PIDS" ]; then
    echo "$NG_PIDS" | xargs kill -9 2>/dev/null
    echo -e "${GREEN}  Stopped Angular process${NC} (PID: $NG_PIDS)"
    KILLED=$((KILLED + 1))
fi

# ── Clean up log files ──────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/backend.log" ] || [ -f "$SCRIPT_DIR/frontend.log" ]; then
    rm -f "$SCRIPT_DIR/backend.log" "$SCRIPT_DIR/frontend.log"
    echo -e "\n${GREEN}  Log files cleaned${NC}"
fi

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
if [ $KILLED -gt 0 ]; then
    echo -e "${GREEN}${BOLD}  All Travel2030 services stopped.${NC}"
else
    echo -e "${YELLOW}  No Travel2030 services were running.${NC}"
fi
echo ""
